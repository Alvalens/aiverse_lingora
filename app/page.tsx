"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface AnimatedSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection = ({
  id,
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.section>
  );
};

export default function Home() {
  const router = useRouter();
  return (
    <div className="gradient-bg text-white min-h-screen">
      {/* Gradient overlay that sits on top of everything including navbar */}
      <div className="gradient-overlay"></div>

      {/* Light effect at the top */}
      <div className="light-effect"></div>

      {/* Section 1 - Start */}
      <AnimatedSection
        id="section1"
        className="text-white min-h-screen max-w-7xl mx-auto relative pt-20"
      >
        {/* Content */}
        <motion.section
          className="text-center py-32 px-4 md:px-10 mt-16 relative z-20"
          variants={sectionVariants}
        >
          <motion.p
            variants={itemVariants}
            className="bg-secondary text-black px-4 py-1 md:px-6 md:py-2 rounded-full inline-block text-sm md:text-lg"
          >
            Get started today!
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mt-6"
          >
            {" "}
            Headline
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-4 text-sm md:text-lg text-gray-400"
          >
            Interview Training and CV Optimization Platform
          </motion.p>

          <motion.div variants={itemVariants}>
            <button>Trial Test</button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2>Review Section</h2>
          </motion.div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 py-2 w-full relative z-20 -mt-12"
        >
          <motion.div variants={itemVariants}>
            <p>Image</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p>Image</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p>Image</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p>Image</p>
          </motion.div>
        </motion.section>
      </AnimatedSection>
      {/* Section 1 - End */}

      {/* Section 2 - Start */}
      <AnimatedSection
        id="features"
        className="p-0 m-0 relative z-10"
        delay={0.1}
      >
        <p>Feature Menu</p>
      </AnimatedSection>
      {/* Section 2 - End */}

      {/* Section 3 - Start */}
      <AnimatedSection
        id="adventages"
        className="p-0 m-0 relative z-10"
        delay={0.1}
      >
        <p>Main Carousel</p>
      </AnimatedSection>
      {/* Section 3 - End */}

      {/* Section 4 - Start */}
      <AnimatedSection
        id="testimonials"
        className="text-white py-16 px-4 md:px-10 text-center relative z-10"
        delay={0.1}
      >
        <motion.div
          variants={itemVariants}
          className="inline-block bg-secondary text-black px-4 py-1 rounded-full text-sm mb-4"
        >
          Clients Feedback
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-5xl font-bold mb-8"
        >
          What our <span className="text-secondary">satisfied clients</span>{" "}
          <br />
          said about us!
        </motion.h2>

        <motion.div variants={itemVariants}>
          <p>Main Feedback</p>
        </motion.div>
      </AnimatedSection>
      {/* Section 4 - End */}

      {/* Section 5 - Start */}
      <AnimatedSection id="faq" className="relative z-10" delay={0.1}>
        <p>Main FAQ</p>
      </AnimatedSection>
      {/* Section 5 - End */}

      {/* Footer */}
      <p>Footer</p>
    </div>
  );
}
