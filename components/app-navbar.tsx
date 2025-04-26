"use client";

import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TokenDisplay } from "@/components/token-display";
import { UserProfile } from "@/components/user-profile";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AppNavbar() {
  const { data, isLoading, error } = useTokenBalance();
  const tokens =
    error || typeof data?.token !== "number" || data.token == null
      ? 0
      : data.token;

  return (
    <header className="w-full border-b border-primary/20 bg-primary">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <AppBreadcrumb />
        </div>
        <div className="flex items-center gap-4">
          <TokenDisplay tokens={tokens} isLoading={isLoading} error={!!error} />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}