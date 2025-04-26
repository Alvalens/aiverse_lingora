import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const password = await hash("password123", 12);
	const user = await prisma.user.create({
		data: {
			name: "User",
			email: "user@gmail.com",
			password,
		},
	});

	await prisma.tokenBalance.create({
		data: {
			userId: user.id,
			token: 100,
		},
	});

	await prisma.tokenPack.create({
		data: {
			name: "Basic",
			dummyPrice: 25000,
			price: 15000,
			tokens: 25,
			description: "For new users",
		},
	});

	await prisma.tokenPack.create({
		data: {
			name: "Standard",
			dummyPrice: 75000,
			price: 50000,
			tokens: 100,
			description: "For regular usage",
		},
	});

	await prisma.tokenPack.create({
		data: {
			name: "Premium",
			dummyPrice: 125000,
			price: 100000,
			tokens: 250,
			description: "Best value for money",
		},
	});
}
main()
	.then(() => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
