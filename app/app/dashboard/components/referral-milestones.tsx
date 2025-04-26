"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const STATIC_DATA = {
  referrals: 3,
  milestone: 5,
  reward: 50,
}

export function ReferralMilestones() {
  return (
    <Card className="border-[hsl(var(--border))] bg-[hsl(var(--tertiary))] rounded-lg shadow-md h-[175px] w-full">
      <CardHeader className="pb-1 pt-3 border-b border-[hsl(var(--border))] flex items-center">
        <div className="flex items-center w-full">
          <CardTitle className="text-base font-bold text-[hsl(var(--tertiary-foreground))]">
            Referral Milestones
          </CardTitle>
          <Button
            size="sm"
            className="ml-auto h-6 px-3 text-base border border-[hsl(var(--secondary))] text-[hsl(var(--tertiary-foreground))] bg-transparent hover:bg-[hsl(var(--secondary))] hover:text-black rounded-md"
          >
            Claim
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[calc(175px-44px)] pt-2 pb-3">
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-base text-[hsl(var(--tertiary-foreground))]/70">
              Your Milestone: {STATIC_DATA.referrals} referrals to earn {STATIC_DATA.reward} tokens
            </span>
          </div>

          {/* Progress Bar with 3/5 on the right */}
          <div className="flex items-center gap-2">
            <Progress
              value={(STATIC_DATA.referrals / STATIC_DATA.milestone) * 100}
              className="h-2 w-[350px] rounded-full bg-white [&>div]:bg-gradient-to-r [&>div]:from-white [&>div]:to-lime-400"
            />
            <span className="text-sm font-medium text-[hsl(var(--tertiary-foreground))]">
              {STATIC_DATA.referrals}/{STATIC_DATA.milestone}
            </span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-9 text-base bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--secondary))]/90 rounded-md mt-auto">
              Claim Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Claim Your Reward</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-base">
                Congratulations! You have earned {STATIC_DATA.reward} tokens through your referrals.
              </p>
              <Button className="w-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90 rounded-lg">
                Claim Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}