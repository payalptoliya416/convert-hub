import React from "react";
import { Check, LockKeyhole, Zap, Smartphone } from "lucide-react";
import whyChooseImg from "../assets/why-choose.png";

const features = [
  {
    icon: Check,
    title: "100% Free Tools",
    description: "No registration. No hidden charges. Ever.",
    iconBg: "bg-emerald-500",
    glowColor: "rgba(16,185,129,0.35)",
    circleBg: "rgba(16,185,129,0.12)",
  },
  {
    icon: LockKeyhole,
    title: "Secure & Private",
    description: "Your files are processed securely and deleted automatically.",
    iconBg: "bg-blue-500",
    glowColor: "rgba(59,130,246,0.35)",
    circleBg: "rgba(59,130,246,0.12)",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your work done in seconds, not minutes.",
    iconBg: "bg-violet-500",
    glowColor: "rgba(139,92,246,0.35)",
    circleBg: "rgba(139,92,246,0.12)",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "On any device — desktop, mobile, or tablet.",
    iconBg: "bg-rose-500",
    glowColor: "rgba(244,63,94,0.35)",
    circleBg: "rgba(244,63,94,0.12)",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="w-full py-10 sm:py-14 lg:py-16 px-6">
      <div
        className="mx-auto max-w-[1400px] rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 30%, #fdf4ff 60%, #e0f2fe 100%)",
        }}
      >
        {/* Dark mode overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: "var(--trusted-dark-overlay, transparent)" }}
        />
      
        <div className="relative z-10 flex flex-col lg:flex-row items-center">

          {/* ── LEFT: Illustration ── */}
          <div className="w-full lg:w-[46%] flex items-center justify-center shrink-0">
            <img
              src={whyChooseImg}
              alt="Why choose ConvertHub"
              className="w-full max-w-[500px] h-auto object-contain"
              style={{ filter: "drop-shadow(0 20px 48px rgba(124,58,237,0.22))" }}
            />
          </div>

          {/* ── RIGHT: Content ── */}
          <div className="w-full lg:w-[54%] px-4 lg:px-12 pb-10 lg:pl-4 lg:pr-12 lg:py-14">

            {/* Heading */}
            <h2
              className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--text-heading)" }}
            >
              Why Choose{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899)" }}
              >
                ConvertHub?
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Powerful tools. Total privacy. Zero hassle.
            </p>

            {/* Feature list */}
            <div className="mt-8 flex flex-col gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-4">
                    {/* Icon circle */}
                    <div
                      className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: f.circleBg,
                        boxShadow: `0 4px 16px ${f.glowColor}`,
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 ${f.iconBg.replace("bg-", "text-")}`}
                        strokeWidth={2.2}
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <h3
                        className="text-base font-bold leading-tight"
                        style={{ color: "var(--text-heading)" }}
                      >
                        {f.title}
                      </h3>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {f.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
