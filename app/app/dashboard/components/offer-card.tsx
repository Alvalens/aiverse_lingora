import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card"

export function OfferCard() {
  return (
    <Card className="border-[#0B344C] bg-quaternary text-white overflow-hidden relative h-[140px]">
      <CardContent className="p-4 relative z-10 h-full flex flex-col justify-center">
        <div>
          <h3 className="text-2xl font-medium">
            Take your <span className="font-bold">Best Offer</span> here.
          </h3>
          <p className="mt-1 text-base">Buy your card and token now!</p>
        </div>
      </CardContent>
      {/* Tag SVG */}
      <div className="absolute bottom-0 right-0 opacity-80 z-0">
        <Image
          src="/images/dashboard/tag.svg"
          alt="Tag"
          width={128}
          height={128}
          className="w-32 h-32 brightness-200"
        />
      </div>
    </Card>
  )
}