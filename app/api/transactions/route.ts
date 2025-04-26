import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
});


export async function POST(req: Request) {
	const user_id = (await getServerSession(authOptions))?.user?.id;
	if (!user_id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { packId } = await req.json();
	if (!packId) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	const pack = await prisma.tokenPack.findUnique({
		where: { id: packId },
	});

	if (!pack) {
		return NextResponse.json(
			{ error: "Token pack not found" },
			{ status: 404 }
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: user_id },
		select: { tokens: true },
	});

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

    const order_id = `order-${user_id}-${Date.now()}`;

	const params = {
		item_details: [
			{
				id: pack.id.toString(),
				price: pack.price,
				name: pack.name,
				quantity: 1,
			},
		],
		transaction_details: {
			order_id: order_id,
			gross_amount: pack.price,
		},
	};

	const token = await snap.createTransactionToken(params);

    await prisma.transaction.create({
		data: {
			midtransOrderId: order_id,
			userId: user_id,
            amount: pack.price,
			tokenPackId: pack.id,
			status: "PENDING",
		},
	});


	return NextResponse.json({ token }, { status: 200 });
}
