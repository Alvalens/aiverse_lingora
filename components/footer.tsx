/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-white py-16 px-4 md:px-8 lg:px-32">
      <div className="flex flex-col lg:flex-row justify-between gap-10">
        {/* Left Section */}
        <div className="w-full lg:w-1/3">
          <div className="flex items-center gap-2">
            <img
              src="images/landingpage/Intervyoulogo.png"
              alt="Logo"
              className="w-8 h-8"
            />
            <h2 className="text-xl font-semibold">Intervyou.ai</h2>
          </div>
          <p className="text-gray-400 mt-4">
            It has long been known that a readers attention will be diverted
            from.
          </p>

          {/* Newsletter */}
          <div className="mt-6">
            <p className="font-semibold">Join a Newsletter</p>
            <div className="flex items-center mt-2 border border-gray-600 rounded-lg overflow-hidden">
              <input
                type="email"
                placeholder="Enter Your Email Here"
                className="bg-transparent text-white px-4 py-2 outline-none w-full"
              />
              <button className="bg-secondary p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section - Quick Links & Services */}
        <div className="w-full lg:w-1/3 flex justify-between">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {[
                { label: "Home", route: "/" },
                { label: "About", route: "/about" },
                { label: "How to use", route: "/how-to-use" },
                { label: "Terms & Policy", route: "/terms-policy" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.route} className="menu-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
{/* Features */}
<div>
  <h3 className="text-lg font-semibold">Features</h3>
  <ul className="mt-4 space-y-2">
    {[
      { label: "AI Interview Session", route: "#interview" },
      { label: "Feedback Improvement", route: "#feedback" },
      { label: "Material Recommendations", route: "#recommendations" },
      { label: "CV Analysis & Optimization", route: "#cv" }
    ].map((service) => (
      <li key={service.label}>
        <a
          href={service.route}
          className="menu-link"
        >
          {service.label}
        </a>
      </li>
    ))}
  </ul>
</div>
        </div>

        {/* Right Section - Contact */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-lg font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 text-gray-400 hover:text-secondary transition-colors">
              <MapPin size={18} />
              Jl. Semarang 5 Malang 65145 Jawa Timur Indonesia
            </li>
            <li className="flex items-center gap-3 text-gray-400 hover:text-secondary transition-colors">
              <Mail size={18} />
              intervyou.ai@gmail.com
            </li>
            <li className="flex items-center gap-3 text-gray-400 hover:text-secondary transition-colors">
              <Phone size={18} />
              +62 823 9977 1954
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;