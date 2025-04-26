import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TokenDisplayProps {
  tokens: number;
  isLoading: boolean;
  error: boolean;
}

export function TokenDisplay({ tokens, isLoading, error }: TokenDisplayProps) {
  return (
    <Button
      asChild
      className="flex h-9 items-center rounded-full px-4 text-secondary-foreground"
      style={{
        background: "linear-gradient(to right, #0E63A9, #21B5FE)",
      }}
    >
      <a href="/app/shop" className="flex items-center">
        <Image
          src="/images/dashboard/coins.svg"
          alt="Coins"
          width={20}
          height={20}
          className="mr-2"
        />
        {isLoading ? "Loading..." : error ? "Error" : `${tokens} Token`}
        <Plus className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}