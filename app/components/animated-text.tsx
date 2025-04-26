import React from "react";

const AnimatedText = ({ text }: { text: string }) => {
  return <span className="typing animated-text text-[#00D4DA]">{text}</span>;
};

export default AnimatedText;
