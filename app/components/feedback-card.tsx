/* eslint-disable @next/next/no-img-element */
import { Card, CardContent } from "@/components/ui/card";

const FeedbackCard = ({ feedback }: { feedback: any }) => {
  return (
    <Card className="bg-gradient-to-bl from-tertiary-from to-tertiary-to p-6 rounded-lg text-left text-gray-300 border border-secondary/30">
      <CardContent>
        <p className="mb-4">{feedback.text}</p>
        <div className="flex items-center gap-2">
          <img
            src={feedback.image || "/placeholder.svg"}
            alt={feedback.name}
            width={40}
            height={40}
            className="rounded-full object-cover aspect-square"
          />
          <div>
            <p className="font-bold text-yellow-400">{feedback.name}</p>
            <p>{"⭐".repeat(feedback.rating)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
