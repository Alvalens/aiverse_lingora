"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ReactNode } from "react";
import Navbar from "./components/navbar";
import AnimatedText from "./components/animated-text";
import ExcellenceCard from "./components/excellence-card";
import Circle from "./components/circle";
import Footer from "./components/footer";
import FeatureMenu from "./components/feature-menu";
import MainCarousel from "./components/main-carousel";
// import MainFeedback from "./components/main-feedback";
import MainFaq from "./components/main-faq";

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
  return (
    <div className="gradient-bg text-black min-h-screen relative bg-primary-z-40">
      {/* Gradient overlay that sits on top of everything including navbar */}
      <div className="gradient-overlay"></div>
      {/* Light effect at the top */}
      <div className="light-effect"></div>
      <Navbar />
      {/* Section 1 - Start */}
      <AnimatedSection
        id="section1"
        className="text-black min-h-screen max-w-7xl mx-auto relative pt-20"
      >
        {/* Visual effects */}
        <Circle />
        {/* Content */}
        <motion.section
          className="text-center py-32 px-4 md:px-10 mt-16 relative z-20"
          variants={sectionVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-6xl mt-6 leading-tight font-semibold  "
          >
            Speak English with Confidence. <br />
            Try <AnimatedText text="Lingora" />
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="my-4  md:w-full mx-auto text-sm md:text-lg text-gray-600"
          >
            Discover how we transform your English skills, one conversation at a
            time.
          </motion.p>

          <motion.div variants={itemVariants}>
            <button className="text-white bg-gradient-to-tr from-[#0A3558] to-[#00D4DA] py-2 px-6 rounded-full transition-colors duration-200 hover:bg-[#00D4DA]/80 cursor-pointer mb-10">
              Start Your Free Trial!
            </button>
          </motion.div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 py-2 w-full relative z-20 -mt-12"
        >
          <motion.div variants={itemVariants}>
            <ExcellenceCard
              image="/landing-page/conversation.svg"
              title="Build Confidence Through Daily Talk to boost fluency and ease in speaking."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ExcellenceCard
              image="/landing-page/practice.svg"
              title="Practice organizing ideas into clear, flowing narratives essential for longer discourse."
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ExcellenceCard
              image="/landing-page/flame.svg"
              title="Tackle complex topics with quick thinking and strong reasoning under high cognitive load."
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ExcellenceCard
              image="/landing-page/circle.svg"
              title="Grow Beyond the Test, focuses on real-world communicative skills for life and exams."
            />
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
        <FeatureMenu />
      </AnimatedSection>
      {/* Section 2 - End */}
      {/* Section 3 - Start */}
      <AnimatedSection
        id="adventages"
        className="p-0 m-0 relative z-10"
        delay={0.1}
      >
        <MainCarousel />
      </AnimatedSection>
      {/* Section 3 - End */}
      
      {/* Section 5 - Start */}
      <AnimatedSection id="faq" className="relative z-10" delay={0.1}>
        <MainFaq />
      </AnimatedSection>
      {/* Section 5 - End */}
      {/* Footer */}
      <Footer />
    </div>
  );
}
