import React from "react";
import { MousePointerClick, Upload, Download } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MousePointerClick,
    title: "Select Your Tool",
    description: "Choose from 100+ tools across different categories. No registration required.",
    gradient: "from-violet-600 to-indigo-500",
    shadowColor: "rgba(124,58,237,0.45)",
  },
  {
    number: "2",
    icon: Upload,
    title: "Upload & Process",
    description: "Upload your files and let our tools do the magic. Fast and secure processing.",
    gradient: "from-blue-500 to-cyan-400",
    shadowColor: "rgba(6,182,212,0.45)",
  },
  {
    number: "3",
    icon: Download,
    title: "Download Results",
    description: "Download your processed files instantly. Files are automatically deleted for privacy.",
    gradient: "from-emerald-500 to-teal-400",
    shadowColor: "rgba(16,185,129,0.45)",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full px-6 pb-0 sm:pb-14 lg:pb-16">
      <div className="mx-auto max-w-[1400px]">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-5xl font-black tracking-tight"
            style={{ color: "var(--text-heading)" }}
          >
            How{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b)" }}
            >
              ConvertHub?
            </span>{" "}
            Works
          </h2>
          <p
            className="mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Simple, fast, and secure. Get your work done in just three easy steps.
          </p>
        </div>

        {/* ── Row: left image + steps + right image ── */}
        <div className="flex items-center">

          {/* Steps center */}
          <div className="flex-1 relative px-4 lg:px-8 py-6">

            {/* Dashed connector line */}
            <div
              className="absolute top-[58px] hidden lg:block pointer-events-none"
              style={{ left: "calc(16% + 36px)", right: "calc(16% + 36px)" }}
            >
              <svg
                viewBox="0 0 600 40"
                preserveAspectRatio="none"
                className="w-full h-10"
                fill="none"
              >
                <path
                  d="M 0 20 C 120 2, 240 38, 300 20 C 360 2, 480 38, 600 20"
                  stroke="url(#cGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="7 5"
                  opacity="0.55"
                />
                <defs>
                  <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#7c3aed" />
                    <stop offset="50%"  stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    {/* Circle */}
                    <div className="relative">
                      <div
                        className={`w-[70px] md:w-[80px] h-[70px] md:h-[80px] rounded-full bg-gradient-to-br ${step.gradient} flex flex-col items-center justify-center`}
                        style={{ boxShadow: `0 8px 24px ${step.shadowColor}` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {/* Step number chip */}
                      <span
                        className={`absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-[11px] font-black text-white border-2`}
                        style={{ borderColor: "var(--bg-base)" }}
                      >
                        {step.number}
                      </span>
                    </div>

                    <h3
                      className="mt-5 text-base sm:text-lg font-bold"
                      style={{ color: "var(--text-heading)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed max-w-[200px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {step.description}
                    </p>
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

export default HowItWorks;
