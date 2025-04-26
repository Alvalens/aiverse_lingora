import React from "react";
import { Button } from "@/components/ui/button";

const MenuButton = ({
  item,
  isActive,
  onClick,
}: {
  item: any;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="relative flex justify-center">
      <Button
        variant="outline"
        className={`border-tertiary bg-transparent cursor-pointer text-color-text hover:bg-tertiary hover:text-white border rounded-full px-4 py-2 text-sm md:text-lg transition-all flex items-center space-x-2 ${
          isActive ? "bg-tertiary border-tertiary text-white" : ""
        }`}
        onClick={onClick}
      >
        <span>{item.label}</span>
      </Button>
      {isActive && (
        <span className="absolute bottom-[-65px] left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-tertiary rounded-t-full"></span>
      )}
    </div>
  );
};

export default MenuButton;
