import React, { useState, useEffect } from "react";
import MenuButton from "./menu-button";
import MenuContent from "./menu-content";

const menuItems = [
  {
    id: "conversation",
    label: "Conversation",
    description: "AI-Based Speaking Practice Real-Life English Conversations",
    points: [
      "Practice speaking anytime with partner",
      "Get instant corrections and suggestions to improve",
      "Build real-world communication skills",
    ],
    image: "landing-page/images/conversation-features.png",
  },
  {
    id: "feedback",
    label: "Writing",
    description: "Elevate Your English Writing Instantly",
    points: [
      "Smart, CEFR-Aligned Feedback",
      "Task-Oriented Exercises",
      "Band Prediction for IELTS",
    ],
    image: "landing-page/images/conversation-features.png",
  },
  {
    id: "recommendations",
    label: "Vocabulary",
    description: "Expand Practical Vocabulary Efficiently",
    points: [
      "Personalized Flashcards",
      "Dynamic Thematic Quizzes",
      "Idiom Builder",
    ],
    image: "landing-page/images/conversation-features.png",
  },
];

const FeatureMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string>(menuItems[0].id);

  // Use useEffect to read the hash from the URL and update the activeMenu state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove '#' from hash
      if (hash && menuItems.some((item) => item.id === hash)) {
        setActiveMenu(hash);
      }
    };

    // On initial mount
    handleHashChange();

    // Add hash change listener
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className=" text-color-text min-h-screen">
      <section className="section-2 text-center py-16 min-h-screen px-4 md:px-10">
        <h2 className="text-2xl md:text-3xl font-bold text-color-text mt-6">
          Our Main Features
        </h2>

        {/* Desktop View */}
        <div className="hidden lg:flex justify-center gap-4 mt-10 flex-wrap">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="w-full lg:w-auto flex flex-col items-center"
            >
              <MenuButton
                item={item}
                isActive={activeMenu === item.id}
                onClick={() => {
                  // Update URL hash juga
                  window.location.hash = item.id;
                  setActiveMenu(item.id);
                }}
              />
            </div>
          ))}
        </div>

        {/* Tampilkan konten feature sesuai activeMenu */}
        {menuItems.map(
          (item) =>
            activeMenu === item.id && (
              <div key={item.id} id={item.id} className="hidden lg:block">
                <MenuContent item={item} />
              </div>
            )
        )}

        {/* Mobile View */}
        <div className="lg:hidden flex flex-col items-center gap-4 mt-10">
          {menuItems.map((item) => (
            <div key={item.id} className="w-full flex flex-col items-center">
              <MenuButton
                item={item}
                isActive={activeMenu === item.id}
                onClick={() => {
                  window.location.hash = item.id;
                  setActiveMenu(item.id);
                }}
              />
              {activeMenu === item.id && (
                <div id={item.id}>
                  <MenuContent item={item} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FeatureMenu;
