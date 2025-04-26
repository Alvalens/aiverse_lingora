import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
	try {
        const user_id = (await getServerSession(authOptions))?.user?.id;
        if (!user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
		const payload = await req.json();
		const { order_id, transaction_status, fraud_status } = payload;

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
			newStatus = "FAILED";
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

		return NextResponse.json({ success: true, status: 200 });
	} catch (error) {
		console.error("Front-end callback error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
