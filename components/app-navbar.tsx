"use client";

import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TokenDisplay } from "@/components/token-display";
import { UserProfile } from "@/components/user-profile";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export function AppNavbar() {
  const { data, isLoading, error } = useTokenBalance();

  const tokens = data?.token ?? 0;

  return (
    <header className="w-full border-b border-primary/20 bg-tertiary">
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