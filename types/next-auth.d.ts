//// filepath: /c:/Next.Js Project/intervyou/types/next-auth.d.ts
import { language } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      image: string | null;
      language: language;
      agreement: boolean;
      emailVerified: boolean; // Added emailVerified property
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
    language: language;
    agreement: boolean;
    emailVerified: boolean; // Added emailVerified property
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    language: language;
    agreement: boolean;
    emailVerified: boolean; // Added emailVerified property
  }
}