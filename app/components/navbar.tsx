/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/globals.css";
import { ChevronDown } from "lucide-react";
// import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Animation variants for dropdown menu container
const dropdownVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -5,
  },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      height: {
        duration: 0.4,
      },
      opacity: {
        duration: 0.3,
        delay: 0.1,
      },
      y: {
        duration: 0.3,
        delay: 0.1,
      },
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -5,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
      y: {
        duration: 0.2,
      },
    },
  },
};

// Animation variants for individual menu items
const itemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
    },
  },
};

// Ubah tipe items menjadi objek yang memiliki label dan route
type DropdownItem = { label: string; route: string };

const CustomDropdown = ({
  trigger,
  isOpen,
  setIsOpen,
  label,
  items,
  onToggle,
}: {
  trigger: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  label: string;
  items: DropdownItem[];
  onToggle?: (isOpen: boolean) => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute top-full left-0 mt-2 bg-[#175472] text-white shadow-md rounded-lg overflow-hidden w-40 z-50"
          >
            <div className="p-2">
              <div className="font-medium text-sm">{label}</div>
              <div className="h-px bg-gray-200 my-1"></div>
              {items.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <button
                    onClick={() => router.push(item.route)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded text-white hover:bg-secondary transition-colors"
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const router = useRouter();

  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleProductsToggle = (isOpen: boolean) => {
    if (isOpen && isSolutionsOpen) {
      setIsSolutionsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
        setIsSolutionsOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(
          'button[aria-label="Toggle mobile menu"]'
        )
      ) {
        setIsProductsOpen(false);
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileProducts = () => {
    const newState = !isProductsOpen;
    setIsProductsOpen(newState);
    if (newState && isSolutionsOpen) {
      setIsSolutionsOpen(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full shadow-md z-50 p-4 md:px-8 flex justify-between items-center bg-primary"
      ref={navRef}
    >
      {/* Logo & Brand */}
      <div className="flex items-center space-x-4 relative z-10">
        <img src="landing-page/logo.svg" alt="Lingora Logo" className="h-10" />
        <span className="text-2xl font-bold text-black">Lingora</span>
      </div>

      {/* Desktop Navigation (Only visible above iPad Pro) */}
      <ul className="hidden xl:flex items-center space-x-6 text-white relative z-10">
        <li>
          <CustomDropdown
            trigger={
              <button className="text-black hover:bg-secondary py-2 px-6 rounded-full flex items-center">
                Products{" "}
                <ChevronDown
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                    isProductsOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
            }
            isOpen={isProductsOpen}
            setIsOpen={setIsProductsOpen}
            label="Our Products"
            items={[
              { label: "AI Interview Session", route: "/app/interview" },
              { label: "Analyze & Optimize CV", route: "/app/cv" },
            ]}
            onToggle={handleProductsToggle}
          />
        </li>
        <li>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-black hover:bg-secondary py-2 px-6 rounded-full"
          >
            Features
          </a>
        </li>
        <li>
          <a
            href="#adventages"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#adventages")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-black hover:bg-secondary py-2 px-6 rounded-full"
          >
            Adventages
          </a>
        </li>
        <li>
          <a
            href="#testimonials"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#testimonials")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-black hover:bg-secondary py-2 px-6 rounded-full"
          >
            Testimonials
          </a>
        </li>
        <li>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#faq")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-black hover:bg-secondary py-2 px-6 rounded-full"
          >
            FAQ
          </a>
        </li>
        <li>
          <button
            onClick={() => router.push("/auth/login")}
            className="text-white bg-gradient-to-r from-[#0A3558] to-[#00D4DA] py-2 px-6 rounded-full transition-colors duration-200 hover:from-[#0A3558]/80 hover:to-[#00D4DA]/80 cursor-pointer"
          >
            Login
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button (Visible on iPad Pro and smaller) */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="xl:hidden text-white focus:outline-none relative z-10"
        aria-label="Toggle mobile menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
          />
        </svg>
      </button>

      {/* Mobile & iPad Pro Navigation (Toggler) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 w-full bg-primary text-white flex flex-col items-center space-y-4 p-4 rounded-b-lg xl:hidden z-50"
          >
            <ul className="w-full space-y-4">
              <li>
                <button
                  onClick={toggleMobileProducts}
                  className="rounded-full px-6 py-2 w-full text-left flex items-center justify-between bg-[#175472]"
                >
                  Products{" "}
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                      isProductsOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isProductsOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#175472] rounded-lg text-white mt-2 space-y-2 px-4 py-2 w-full"
                    >
                      <li>
                        <a href="#">Product 1</a>
                      </li>
                      <li>
                        <a href="#">Product 2</a>
                      </li>
                      <li>
                        <a href="#">Product 3</a>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              <li>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full px-6 py-2 block"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#adventages"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#adventages")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full px-6 py-2 block"
                >
                  Adventages
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#testimonials")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full px-6 py-2 block"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#faq")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full px-6 py-2 block"
                >
                  FAQ
                </a>
              </li>
              <li>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-white rounded-full px-6 py-2 border border-secondary w-full text-center"
                >
                  Login
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
