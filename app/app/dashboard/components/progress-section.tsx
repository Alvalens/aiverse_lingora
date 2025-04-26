"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const progressItems = [
  {
    label: "Daily Talk",
    value: 75,
    level: "High" as const,
  },
  {
    label: "Retell & Describe",
    value: 45,
    level: "Low" as const,
  },
  {
    label: "Interactive Debate",
    value: 15,
    level: "Very Low" as const,
  },
];

const getSolidColorClass = (value: number) => {
  if (value >= 66) {
    return "bg-lime-400";
  } else if (value >= 33) {
    return "bg-orange-400";
  } else {
    return "bg-red-500";
  }
};

export function ProgressSection() {
  return (
    <Card className="border-[hsl(var(--border))] bg-[hsl(var(--tertiary))] rounded-lg shadow-md h-[400px]">
      <CardHeader className="pb-1 pt-3 border-b border-[hsl(var(--border))]">
        <CardTitle className="text-base font-bold text-[hsl(var(--tertiary-foreground))]">
          Statistic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-12 pt-4">
        {progressItems.map((item) => (
          <div key={item.label} className="relative">
            {/* Label */}
            <div className="flex items-center justify-between mb-1">
              <div className="text-base font-medium text-[hsl(var(--tertiary-foreground))]">
                {item.label}
              </div>
            </div>

            {/* Progress Bar Row */}
            <div className="relative">
              {/* Value */}
              <div className="absolute right-20 -top-6 text-base font-bold text-[hsl(var(--tertiary-foreground))]">
                {item.value}%
              </div>

              {/* Level */}
              <div className="absolute right-20 top-5 text-base text-[hsl(var(--tertiary-foreground))]/70">
                {item.level}
              </div>

              <div className="flex items-center">
                <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden mr-20">
                  <div
                    className={`h-full ${getSolidColorClass(item.value)} rounded-full`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>

                <Button
                  size="sm"
                  className="absolute right-0 bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--secondary))]/90 px-2 py-0 h-6 text-base rounded-md border-2"
                  style={{
                    background: "var(--color-secondary)",
                    border: "2px solid transparent",
                    backgroundClip: "padding-box, border-box",
                    backgroundImage:
                      "linear-gradient(var(--color-secondary), var(--color-secondary)), linear-gradient(135deg, var(--color-quaternary), var(--color-tertiary))",
                  }}
                >
                  Start
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}