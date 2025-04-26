import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import FeedbackCard from "./feedback-card";

type Feedback = {
  name: string;
  image: string;
  rating: number;
  text: string;
};

const MainFeedback = () => {
  const [showAll, setShowAll] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    // Fetch testimonial data dari API (pastikan endpointnya benar)
    fetch("/api/landing-page")
      .then((res) => res.json())
      .then((data) => {
        // Asumsikan API mengembalikan array dengan field:
        // { testimoni, rating, user: { name, image } }
        // Lakukan mapping agar sesuai dengan struktur Feedback
        const mapped: Feedback[] = data.map((item: any) => ({
          name: item.user.name,
          image: item.user.image,
          rating: item.rating,
          text: item.testimoni,
        }));
        setFeedbacks(mapped);
      })
      .catch((err) => {
        console.error("Error fetching testimonials:", err);
      });
  }, []);

  return (
    <section className="bg-primary text-color-text py-16 px-4 md:px-10 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
        {feedbacks.map((feedback, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: showAll || index < 3 ? 1 : 0,
              y: showAll || index < 3 ? 0 : 20,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`${showAll || index < 3 ? "block" : "hidden"}`}
          >
            <FeedbackCard feedback={feedback} />
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          onClick={() => setShowAll(!showAll)}
          className={`transition duration-300 ${
            showAll
              ? "bg-transparent text-color-text hover:bg-tertiary hover:text-black border border-tertiary"
              : "bg-transparent text-color-text hover:bg-tertiary hover:text-black border border-tertiary"
          }`}
        >
          {showAll ? "Close Feedbacks" : "View All Feedbacks"}
        </Button>
      </div>
    </section>
  );
};

export default MainFeedback;
