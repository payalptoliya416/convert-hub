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
        style={{
          background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 30%, #fdf4ff 60%, #e0f2fe 100%)",
        }}
      >
        {/* Dark mode overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "var(--trusted-dark-overlay, transparent)" }}
        />

        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[80px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent)" }} />
        <div className="absolute -bottom-16 right-[30%] w-64 h-64 rounded-full blur-[70px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbcfe8, transparent)" }} />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-8 py-12 sm:py-14 lg:py-16 lg:px-12">

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
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center"
                >
                  {/* Visual */}
                  <div className="relative w-[170px] h-[125px]">

                    {/* Main pedestal */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-0
                                w-[150px] h-[62px]
                                rounded-[50%]
                                overflow-hidden"
                      style={{
                        background: `linear-gradient(
                          180deg,
                          ${stat.color}30 0%,
                          ${stat.color}18 45%,
                          ${stat.color}08 100%
                        )`,
                        border: `1px solid ${stat.color}30`,
                        boxShadow: `
                          inset 0 2px 8px ${stat.color}18,
                          0 12px 25px ${stat.color}12
                        `,
                      }}
                    >
                      {/* Top platform */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -top-[2px]
                                  w-[150px] h-[38px]
                                  rounded-[50%]"
                        style={{
                          background: `linear-gradient(
                            180deg,
                            ${stat.color}35,
                            ${stat.color}18
                          )`,
                          border: `1px solid ${stat.color}35`,
                          boxShadow: `
                            inset 0 2px 5px rgba(255,255,255,0.25),
                            0 4px 12px ${stat.color}15
                          `,
                        }}
                      />

                      {/* Inner highlight */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-2
                                  w-[105px] h-[20px] rounded-[50%] opacity-40"
                        style={{
                          background: `radial-gradient(
                            ellipse,
                            ${stat.color}55 0%,
                            transparent 70%
                          )`,
                        }}
                      />
                    </div>

                    {/* Soft floor glow */}
                    <div
                      className="absolute bottom-[-8px] left-1/2
                                -translate-x-1/2
                                w-[125px] h-[25px]
                                rounded-full blur-xl opacity-20"
                      style={{
                        backgroundColor: stat.color,
                      }}
                    />

                    {/* Floating icon */}
                    <div
                      className="absolute z-10 top-0 left-1/2
                                -translate-x-1/2
                                w-[76px] h-[76px]
                                rounded-full
                                flex items-center justify-center"
                      style={{
                        background: `linear-gradient(
                          145deg,
                          ${stat.color} 0%,
                          ${stat.color}e6 100%
                        )`,
                        boxShadow: `
                          0 10px 20px ${stat.color}40,
                          inset 0 2px 3px rgba(255,255,255,0.3)
                        `,
                      }}
                    >
                      <Icon
                        className="w-9 h-9 text-white"
                        strokeWidth={1.8}
                      />
                    </div>
                  </div>

                  {/* Number */}
                  <div
                    className="text-3xl sm:text-4xl font-black
                              tracking-tight leading-none mt-3"
                    style={{
                      color: stat.color,
                    }}
                  >
                    {counts[i]}
                    {stat.suffix}
                  </div>

                  {/* Label */}
                  <div
                    className="mt-2 text-sm font-medium"
                    style={{
                      color: "var(--text-secondary)",
                    }}
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
              style={{ filter: "drop-shadow(0 20px 40px rgba(124,58,237,0.18))" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustedStats;
