"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATIC_DATA = {
  score: 57,
  maxScore: 100,
}

export function TotalScore() {
  return (
    <Card className="relative border-[hsl(var(--border))] bg-[hsl(var(--tertiary))] rounded-lg shadow-md h-[130px]">
      <CardHeader className="pb-1 pt-3 border-b border-[hsl(var(--border))]">
        <CardTitle className="text-base font-bold text-[hsl(var(--tertiary-foreground))]">Total Score</CardTitle>
      </CardHeader>
      <CardContent className="py-2 flex flex-col">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-[hsl(var(--tertiary-foreground))]">{STATIC_DATA.score}</span>
          <span className="text-lg text-[hsl(var(--tertiary-foreground))]/70 ml-2">/ {STATIC_DATA.maxScore}</span>
        </div>
      </CardContent>

      <Button
        size="sm"
        className="absolute bottom-3 right-3 bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--secondary))]/90 rounded-md h-9"
      >
        See More
      </Button>
    </Card>
  )
}