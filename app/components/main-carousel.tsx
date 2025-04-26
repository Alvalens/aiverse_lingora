/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Folder background */}
      <div className="absolute inset-0 w-full h-full">
        {isHovered ? (
          <img
            src="landing-page/rectangle-hover.svg"
            alt=""
            className="w-full h-full object-fill"
            aria-hidden="true"
          />
        ) : (
          <img
            src="landing-page/rectangle-default.svg"
            alt=""
            className="w-full h-full object-fill"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-10 h-full flex flex-col  max-w-[25rem] mx-auto">
        {/* Icon moved to the right */}
        <div className="absolute top-4 left-8">
          <div className="bg-tertiary rounded-full p-4">{icon}</div>
        </div>

        {/* Improved text spacing */}
        <div className="mt-16 flex flex-col flex-grow">
          <h3 className="text-3xl font-bold mb-5 text-color-text">{title}</h3>
          <p className="text-color-text mb-8">{description}</p>
          <div className="mt-auto pt-2">
            <Button
              variant="link"
              className="text-color-text text-xl hover:text-tertiary p-0 flex items-center gap-2 group relative cursor-pointer underline-offset-6"
            >
              Explore More
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-secondary" />,
    title: "Adaptive Interviewing",
    description:
      "Our AI adjusts questions in real time to match your skill level and career goals.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-secondary" />,
    title: "Comprehensive Feedback",
    description:
      "Receive verbal tips and non-verbal analysis for tone, posture, and facial expression improvements.",
  },
  {
    icon: <Zap className="h-6 w-6 text-secondary" />,
    title: "Curated Resources",
    description:
      "We suggest articles and videos targeting your identified interview skill gaps for efficient learning.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-secondary" />,
    title: "CV Optimization",
    description:
      "Automatically enhance your resume’s formatting, keywords, and structure for higher ATS match rates.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-secondary" />,
    title: "Performance Analytics",
    description:
      " Interactive dashboards visualize your progress metrics, highlighting strengths and improvement areas across sessions.",
  },
  {
    icon: <Zap className="h-6 w-6 text-secondary" />,
    title: "Affordable Access",
    description:
      "Cloud-based subscription plans offer accessible, installation-free practice with transparent, budget-friendly pricing options.",
  },
];

export default function MainCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <section className="text-color-text py-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <div>
            <p className="text-2xl md:text-4xl font-bold">
              Learn Smarter, Not <br /> Harder with
            </p>
            <h2 className="text-color-text mb-2 text-3xl md:text-6xl font-bold">
              Lingora
            </h2>
          </div>
        </div>

        <div className="relative">
          {/* Custom navigation arrows */}
          <div className="hidden md:block absolute left-[-60px] top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-secondary h-12 w-12 hover:bg-tertiary"
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <Carousel
            setApi={setApi}
            className="w-full bg-transparent"
            opts={{ align: "start", loop: true }}
          >
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full md:basis-1/2 lg:basis-1/3 p-2"
                >
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="hidden md:block absolute right-[-60px] top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-secondary h-12 w-12 hover:bg-tertiary"
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                current === index ? "w-6 bg-tertiary" : "w-2 bg-gray-700"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
