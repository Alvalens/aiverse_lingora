import { Card, CardContent } from "@/components/ui/card"

export function OfferCard() {
  return (
    <Card className="border-[#0B344C] bg-gradient-to-r from-[#0E63A9] to-[#21B5FE] text-white overflow-hidden relative">
      <CardContent className="p-8 relative z-10">
        <div>
          <h3 className="text-3xl font-medium">
            Take your <span className="font-bold">Best Offer</span> here.
          </h3>
          <p className="mt-2 text-lg">Buy your card and token now!</p>
        </div>
      </CardContent>
      {/* Crown SVG */}
      <div className="absolute bottom-0 right-0 opacity-30 z-0">
      </div>
    </Card>
  )
}