"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STATIC_DATA = {
  practiceToday: 8,
  practiceHistory: [
    { date: "2025-04-01", count: 5 },
    { date: "2025-04-02", count: 3 },
    { date: "2025-04-03", count: 7 },
    { date: "2025-04-04", count: 2 },
    { date: "2025-04-05", count: 4 },
    { date: "2025-04-06", count: 6 },
    { date: "2025-04-07", count: 8 },
  ],
};

export function TotalPractices() {
  return (
    <Card className="relative border-[#0B344C] bg-tertiary h-[310px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#0B344C]">
        <CardTitle className="text-base font-bold text-white">
          Total Practices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-white mt-4">
          {STATIC_DATA.practiceToday} times
        </div>
      </CardContent>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 h-7 px-2 text-base bg-secondary text-black hover:bg-secondary/90"
          >
            See More
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-primary text-white">
          <DialogHeader>
            <DialogTitle>Practice History</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {STATIC_DATA.practiceHistory.map((practice) => (
                <div
                  key={practice.date}
                  className="flex items-center justify-between border-b border-[#0B344C] pb-2"
                >
                  <span className="text-sm">
                    {new Date(practice.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{practice.count} times</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}