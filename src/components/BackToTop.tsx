import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisible, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl transition-all duration-300 cursor-pointer group ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      }`}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      <ChevronUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-violet-400" />
    </button>
  );
}
