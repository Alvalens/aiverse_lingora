"use client";

import { Copy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATIC_DATA = {
  referralCode: "AZARYA094",
};

export function ReferralCard() {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(STATIC_DATA.referralCode);
  };

  return (
    <Card className="border-[#0B344C] bg-secondary w-full h-auto">
      <CardHeader className="border-b border-[#0B344C]">
        <CardTitle className="text-base font-bold text-color-text">Referral</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:max-w-[250px]">
            <Input
              value={STATIC_DATA.referralCode}
              readOnly
              tabIndex={-1}
              className="border-quaternary bg-[#E2E8F0] text-color-text h-9 text-base pr-10"
              style={{
                boxShadow: "none",
                outline: "none",
                borderWidth: "1px",
                borderColor: "var(--color-quaternary)",
                transition: "none",
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-color-text hover:bg-secondary hover:text-black h-7 w-7"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="h-9 text-base text-color-text w-full sm:w-auto bg-primary border-2 rounded-lg border-transparent"
            style={{
              background:
                "linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--color-quaternary), var(--color-tertiary)) border-box",
              border: "2px solid transparent",
            }}
            onClick={copyToClipboard}
          >
            Copy Link
          </Button>
        </div>

        <Button className="w-full h-9 text-base bg-gradient-to-br from-quaternary to-tertiary text-white rounded-lg">
          More Info
        </Button>
      </CardContent>
    </Card>
  );
}