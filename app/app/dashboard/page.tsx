"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import AuthToast from "@/components/auth-toast";

export default function Page() {
  const { data: session, status } = useSession();
  const { data: tokenBalance } = useTokenBalance();
  

  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <AuthToast />
      <h1>Welcome to the Dashboard</h1>
      {session?.user?.email && <p>Logged in as: {session.user.email}</p>}
      Your token is {tokenBalance?.token} <br />
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
