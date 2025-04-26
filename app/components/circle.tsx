import React from "react";

const Circle = () => {
  return (
    <div className="">
      <div className="shadow-[0_0_24px_8px_rgba(0,0,0,0.075)] bg-primary rounded-full w-[20rem] aspect-square  absolute top-2/6 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="shadow-[0_0_24px_8px_rgba(0,0,0,0.075)] bg-primary rounded-full w-[40rem] aspect-square bg-gradient-to-bl from-tertiary-from to-tertiary-to absolute top-2/6 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="shadow-[0_0_24px_8px_rgba(0,0,0,0.075)] bg-primary rounded-full w-[60rem] aspect-square bg-gradient-to-bl from-tertiary-from to-tertiary-to absolute top-2/6 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20"></div>
    </div>
  );
};

export default Circle;
