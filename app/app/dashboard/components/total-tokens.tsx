import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TotalTokensProps {
  tokens: number;
}

export function TotalTokens({ tokens }: TotalTokensProps) {
  return (
    <Card className="border-[#0B344C] bg-secondary w-full h-auto">
      <CardHeader className="border-b border-[#0B344C]">
        <CardTitle className="text-base font-bold text-color-text">Total Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-4 pt-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/dashboard/coins-gradient-fix.svg"
            alt="Coins"
            width={36}
            height={36}
            className="mr-2"
          />
          <span className="text-3xl font-bold text-color-text">{tokens}</span>
        </div>
        <Link href="/app/shop" passHref>
          <Button className="w-full h-9 text-base text-white rounded-lg bg-gradient-to-br from-quaternary to-tertiary border-0 hover:opacity-90 transition">
            Go to Shop
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}