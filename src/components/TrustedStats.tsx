import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, Users, FileText, Clock } from "lucide-react";
import worldwideImg from "../assets/Worldwide.png";

const stats = [
  {
    value: 100, suffix: "+",
    label: "Free Tools",
    color: "#f43f5e",
    bgColor: "rgba(244,63,94,0.12)",
    icon: LayoutGrid,
  },
  {
    value: 1, suffix: "M+",
    label: "Happy Users",
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.12)",
    icon: Users,
  },
  {
    value: 10, suffix: "M+",
    label: "Files Processed",
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.12)",
    icon: FileText,
  },
  {
    value: 24, suffix: "/7",
    label: "Available",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.12)",
    icon: Clock,
  },
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
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(stats.map((s) => Math.floor(s.value * ease)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started]);

  return (
    <section ref={sectionRef} className="w-full px-6 pb-10 sm:pb-14 lg:pb-16">
      <div
        className="relative mx-auto max-w-[1400px] rounded-3xl overflow-hidden"
      >
        {/* Lavender gradient base — light mode only */}
        {/* <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 30%, #fdf4ff 60%, #e0f2fe 100%)",
          }}
        /> */}
        {/* Dark mode overlay — covers lavender with dark bg */}
        {/* <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: "var(--trusted-dark-overlay, transparent)" }}
        /> */}

        {/* Decorative blobs */}
        {/* <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[80px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent)" }} />
        <div className="absolute -bottom-16 right-[30%] w-64 h-64 rounded-full blur-[70px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbcfe8, transparent)" }} /> */}

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-4 py-12 sm:py-14 lg:py-16 lg:px-12">

          {/* LEFT — text + stats */}
          <div className="flex-1 w-full">
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--hero-heading-color)" }}>
              Trusted by{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899)" }}>
                Millions
              </span>
              <br />
              of Users{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #ec4899, #8b5cf6)" }}>
                Worldwide
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed max-w-lg"
              style={{ color: "var(--hero-text-color)" }}>
              ConvertHub offers a complete suite of free online tools for PDF, video,
              image, and file management. Download, convert, edit, and create —
              all from one powerful platform.
            </p>

            {/* Stats row — circle icon with teardrop blob */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
  {stats.map((stat, i) => {
    const Icon = stat.icon;

    return (
      <div
        key={stat.label}
        className="flex flex-col items-center text-center"
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: `${stat.color}12`,
            color: stat.color,
          }}
        >
          <Icon className="w-7 h-7" strokeWidth={2} />
        </div>

        {/* Number */}
        <div
          className="mt-4 text-3xl sm:text-4xl font-bold leading-none"
          style={{ color: stat.color }}
        >
          {counts[i]}
          {stat.suffix}
        </div>

        {/* Label */}
        <div
          className="mt-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {stat.label}
        </div>
      </div>
    );
  })}
</div>
          </div>

          {/* RIGHT — illustration */}
          <div className="w-full lg:w-[46%] xl:w-[44%] flex items-center justify-center shrink-0">
            <img
              src={worldwideImg}
              alt="Trusted worldwide illustration"
              className="w-full h-auto object-contain"
              style={{ filter: "drop-shadow(0 20px 40px rgba(124,58,237,0.18))", opacity : "var(--opacity-custm)" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustedStats;
