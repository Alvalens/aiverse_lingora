import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";


const snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const statusResponse = await snap.transaction.notification(body);

		const { order_id, transaction_status, fraud_status } = statusResponse;

		const transaction = await prisma.transaction.findFirst({
			where: { midtransOrderId: order_id },
		});

		if (!transaction) {
			return NextResponse.json(
				{ error: "Transaction not found" },
				{ status: 404 }
			);
		}

		if (transaction.status !== "PENDING") {
			return NextResponse.json({ success: true }, { status: 200 });
		}

		let newStatus = transaction_status;
		if (transaction_status === "capture") {
			newStatus = fraud_status === "accept" ? "SUCCESS" : "FAILED";
		} else if (transaction_status === "settlement") {
			newStatus = "SUCCESS";
		} else if (
			transaction_status === "cancel" ||
			transaction_status === "deny" ||
			transaction_status === "expire"
		) {
			newStatus = "FAILURE";
		} else if (transaction_status === "pending") {
			newStatus = "PENDING";
		}

		const updatedTransaction = await prisma.transaction.update({
			where: { id: transaction.id },
			data: { status: newStatus },
		});

		if (newStatus === "SUCCESS") {
			const tokenPack = await prisma.tokenPack.findUnique({
				where: { id: updatedTransaction.tokenPackId },
			});
			if (tokenPack) {
				await prisma.tokenBalance.upsert({
					where: { userId: updatedTransaction.userId },
					update: {
						token: {
							increment: tokenPack.tokens,
						},
					},
					create: {
						userId: updatedTransaction.userId,
						token: tokenPack.tokens,
					},
				});
			}
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Midtrans notification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
