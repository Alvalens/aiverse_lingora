//// filepath: /c:/Next.Js Project/intervyou/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { language, PrismaClient, Role } from "@prisma/client";
import transporter from "@/lib/nodemailer";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request", // Halaman notifikasi cek email
    error: "/auth/error",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const message = {
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n\nClick the link below to sign in:\n\n${url}\n\n`,
          html: `<p>Sign in to <strong>${host}</strong></p>
                 <p>Click <a href="${url}">this link</a> to sign in.</p>`,
        };

        const result = await transporter.sendMail(message);
        const failed = result.rejected?.concat(result.pending ?? []).filter(Boolean);
        if (failed && failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            throw new Error("No user found");
          }
          const isValid = bcrypt.compareSync(credentials.password, user.password as string);
          if (!isValid) {
            throw new Error("Invalid password");
          }
          // Konversi emailVerified dari Date|null ke boolean
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            language: user.language,
            agreement: user.agreement,
            emailVerified: !!user.emailVerified,
          };
        } catch (err) {
          throw err;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER",
          language: "ID",
          agreement: false,
          emailVerified: true, // Asumsikan akun google sudah diverifikasi
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Upsert tokenBalance untuk semua metode login
      try {
        await prisma.tokenBalance.upsert({
          where: { userId: user.id },
          update: { userId: user.id },
          create: { userId: user.id, token: 50 },
        });
      } catch (error) {
        console.error("Error upserting token balance:", error);
      }
  
      if (account?.provider === "google") {
        try {
          const imageUrl = user.image;
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email || "" },
            include: { education: true, experience: true, skills: true },
          });
          if (dbUser) {

            // Perbarui data khusus akun Google, termasuk menandai email sebagai terverifikasi
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name,
                image: imageUrl,
                role: dbUser.role || "USER",
                language: dbUser.language || "ID",
                emailVerified: new Date(),
              },
              select: { id: true, name: true, image: true, agreement: true },
            });
          } else {
          }
        } catch (error) {
          console.error("Error processing Google sign-in:", error);
        }
      }
      // Untuk email/password, tidak ada update emailVerified (sesuai kebutuhan)
      return true;
    },

    async jwt({ token, user}) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
        token.language = user.language;
        token.agreement = user.agreement;
        // Konversi ke boolean
        token.emailVerified = !!user.emailVerified;
      }
      if (token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
              language: true,
              agreement: true,
              emailVerified: true,
            },
          });
          if (freshUser) {
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.image = freshUser.image;
            token.role = freshUser.role;
            token.language = freshUser.language;
            token.agreement = !!freshUser.agreement;
            token.emailVerified = !!freshUser.emailVerified;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        image: token.image as string | null,
        role: token.role as Role,
        language: token.language as language,
        agreement: !!token.agreement,
        emailVerified: !!token.emailVerified,
      };
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.tokenBalance.create({
        data: { userId: user.id, token: 50 },
      });
      // Set emailVerified ke null sebagai default (belum diverifikasi)
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "USER", language: "ID", agreement: false, emailVerified: null },
      });
    },
    async signIn({ user, account }) {
      if (account?.provider === "email") {
        try {
          await prisma.forgotVerificationToken.update({
            where: {
              userId_purpose: { userId: user.id, purpose: "VERIFICATION" }
            },
            data: {
              // Jika diinginkan, update data token atau langsung biarkan record yang sudah ada.
            },
          });
          // Tandai user sebagai terverifikasi
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        } catch (error) {
          console.error("Error updating EmailVerification record:", error);
        }
      }
    },
  },
};