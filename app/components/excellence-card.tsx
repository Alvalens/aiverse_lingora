import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const ExcellenceCard = ({ image, title }: { image: string; title: string }) => {
  return (
    <Card className="bg-secondary shadow-lg border border-secondary/30 text-color-text h-[180px] ">
      <CardContent className="p-6 relative flex flex-col justify-center h-full gap-4 ">
        <Image
          src={image}
          alt="Logo"
          width={100}
          height={100}
          className="w-6"
        />
        <h3 className="text-base font-medium">{title}</h3>
      </CardContent>
    </Card>
  );
};

export default ExcellenceCard;
