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
    <Card className="border-[#0B344C] bg-secondary rounded-lg shadow-md w-full h-auto">
      <CardHeader className="border-b border-[#0B344C] flex items-center">
        <div className="flex items-center w-full">
          <CardTitle className="text-base font-bold text-color-text">
            Referral Milestones
          </CardTitle>
          <Button
            size="default"
            className="ml-auto h-6 px-3 text-xs text-color-text bg-primary rounded-md border-2"
            style={{
              background: "var(--color-primary)",
              border: "2px solid transparent",
              backgroundClip: "padding-box, border-box",
              backgroundImage:
                "linear-gradient(var(--color-primary), var(--color-primary)), linear-gradient(135deg, var(--color-quaternary), var(--color-tertiary))",
            }}
          >
            Claim
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base text-color-text">
              Your Milestone: {STATIC_DATA.referrals} referrals to earn {STATIC_DATA.reward} tokens
            </span>
          </div>
          {/* Progress Bar responsive */}
          <div className="flex items-center gap-2 flex-wrap">
            <Progress
              value={(STATIC_DATA.referrals / STATIC_DATA.milestone) * 100}
              className="h-2 w-full sm:w-[250px] rounded-full bg-white [&>div]:bg-gradient-to-r [&>div]:from-white [&>div]:to-lime-400"
            />
            <span className="text-sm font-medium text-color-text">
              {STATIC_DATA.referrals}/{STATIC_DATA.milestone}
            </span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-9 text-base bg-gradient-to-br from-quaternary to-tertiary text-white rounded-md">
              Claim Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-primary text-color-text rounded-lg border-2"
            style={{
              border: "2px solid transparent",
              backgroundClip: "padding-box, border-box",
              backgroundImage:
                "linear-gradient(var(--color-primary), var(--color-primary)), linear-gradient(135deg, var(--color-quaternary), var(--color-tertiary))",
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-color-text">Claim Your Reward</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-base text-color-text">
                Congratulations! You have earned {STATIC_DATA.reward} tokens through your referrals.
              </p>
              <Button className="w-full bg-gradient-to-br from-quaternary to-tertiary text-white rounded-lg">
                Claim Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}