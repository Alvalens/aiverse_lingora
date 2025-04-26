import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tokens } from "@/lib/constants";

const MainFaq = () => {
  const faqs = [
    {
      question: "What is Intervyou.ai and how does it work?",
      answer:
        "Intervyou.ai is an AI-driven SaaS platform using a token-based system for interview practice and CV services.",
    },
    {
      question: "What are tokens and how do they work?",
      answer:
        "Tokens are credits you purchase to use platform features; each action deducts a set number of tokens.",
    },
    {
      question: "How many tokens do I need for an interview session?",
      answer: `Each AI Interview Session costs ${Tokens.convDaily} tokens per practice run.`,
    },
    {
      question: "How many tokens for CV optimization and analysis?",
      answer: `CV Optimization requires ${Tokens.convDaily} tokens, while CV Analysis costs ${Tokens.convDaily} tokens per use.`,
    },
    {
      question: "Are there any free tokens for new users?",
      answer: "Yes, every new user receives 50 free tokens upon signing up.",
    },
    {
      question: "Can I use Intervyou.ai on mobile devices?",
      answer:
        "Yes, the platform is fully responsive and works on any modern browser—desktop, tablet, or smartphone.",
    },
    {
      question: "Is my data and feedback secure?",
      answer:
        "All data is encrypted in transit and at rest, and we comply with industry-standard data protection regulations.",
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
