import React, { useEffect, useRef, useState } from "react";

const stats = [
  { value: 100, suffix: "+",  label: "Free Tools",       color: "text-rose-400"    },
  { value: 1,   suffix: "M+", label: "Happy Users",      color: "text-blue-400"    },
  { value: 10,  suffix: "M+", label: "Files Processed",  color: "text-emerald-400" },
  { value: 24,  suffix: "/7", label: "Available",        color: "text-violet-400"  },
];

const TrustedStats: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.25 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCounts(stats.map((stat) => Math.floor(stat.value * easeOut)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started]);

  return (
    <section ref={sectionRef} className="w-full pb-10 sm:pb-14 lg:pb-16 px-4">
      <div
        className="mx-auto max-w-7xl px-4 rounded-3xl border py-12 sm:py-14 lg:py-16"
        style={{
          backgroundColor: 'var(--bg-surface-60)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1
            className="text-3xl md:text-5xl font-black tracking-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            Trusted by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">
              Millions
            </span>{" "}
            of Users{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">
              Worldwide
            </span>
          </h1>
          <p
            className="text-lg max-w-4xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            ConvertHub offers a complete suite of free online tools for PDF,
            video, image, and file management. Download, convert, edit, and
            create — all from one powerful platform.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-y-10 sm:mt-12 sm:grid-cols-4 sm:gap-y-0">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className={`text-2xl font-semibold tracking-tight sm:text-5xl ${stat.color}`}>
                {counts[index]}{stat.suffix}
              </div>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedStats;
