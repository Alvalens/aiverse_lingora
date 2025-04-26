import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TotalTokensProps {
  tokens: number;
}

export function TotalTokens({ tokens }: TotalTokensProps) {
  return (
    <Card className="border-[#0B344C] bg-tertiary h-[175px] w-full">
      <CardHeader className="pb-1 pt-3 border-b border-[#0B344C]">
        <CardTitle className="text-base font-bold text-white">Total Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[calc(175px-44px)] pb-3">
        <div className="flex items-center gap-2 mt-3">
          <Image
            src="/images/dashboard/coins-gradient.svg"
            alt="Coins"
            width={36}
            height={36}
            className="mr-2"
          />
          <span className="text-3xl font-bold text-white">{tokens}</span>
        </div>

        <Link href="/app/shop" passHref>
          <Button className="w-full h-9 text-base bg-secondary text-black hover:bg-secondary/90 mt-auto rounded-lg">
            Go to Shop
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}