/* eslint-disable @next/next/no-img-element */
import React, { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface MenuContentProps {
  item: {
    id: string;
    label: string;
    description: string;
    points: string[];
    image: string;
  };
}

const MenuContent: FC<MenuContentProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="mt-16 w-full"
    >
      <Card className="bg-transparent border border-secondary text-color-text p-6 md:p-10 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto relative after:content-[''] after:absolute after:inset-0 after:border-4 after:rounded-lg after:opacity-0 after:transition-all after:duration-300 after:scale-105">
        <CardContent className="w-full md:w-1/2 text-start">
          <h3 className="text-2xl md:text-4xl font-semibold">
            {item.description}
          </h3>
          <ul className="text-color-text mt-6 text-lg md:text-xl list-none">
            {item.points.map((point: string, index: number) => (
              <li key={index} className="flex items-center gap-2 space-x-2">
                <span>
                  <CheckCircle className="w-6 h-6 text-tertiary" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <img
            src={item.image}
            alt={item.label}
            className="rounded-lg shadow-lg w-full"
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default MenuContent;
