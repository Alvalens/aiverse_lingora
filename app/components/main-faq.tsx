import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const MainFaq = () => {
  const faqs = [
    {
      question: "What is Lingora and how does it work?",
      answer:
        "Lingora is an AI-driven platform that helps you learn English through speaking practice. Our interactive conversations, debates, and storytelling sessions improve your fluency naturally.",
    },
    {
      question: "What are tokens and how do they work?",
      answer:
        "Tokens are credits you purchase to access different speaking activities on Lingora. Each conversation or learning activity uses a specific number of tokens.",
    },
    {
      question: "Are there any free tokens for new users?",
      answer: "Yes, every new user receives 50 free tokens upon signing up to try out our speaking activities.",
    },
  ];

  return (
    <section className="w-full h-min-screen bg-primary py-16 px-4 md:px-8 lg:px-32 flex flex-col lg:flex-row items-center gap-16">
      <div className="w-full lg:w-1/2">
        <h2 className="text-color-text text-3xl md:text-4xl font-bold">
          Frequently asked questions!
        </h2>
      </div>
      <div className="w-full lg:w-1/2">
        <Accordion type="single" collapsible>
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className="border-tertiary"
            >
              <AccordionTrigger className="text-color-text text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-color-text mt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default MainFaq;
