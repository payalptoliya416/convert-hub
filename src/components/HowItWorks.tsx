import React from "react";
import { MousePointerClick, Upload, Download } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MousePointerClick,
    title: "Select Your Tool",
    description:
      "Choose from 100+ tools across different categories. No registration required.",
    color: "from-violet-600 to-indigo-600",
  },
  {
    number: "2",
    icon: Upload,
    title: "Upload & Process",
    description:
      "Upload your files and let our tools do the magic. Fast and secure processing.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "3",
    icon: Download,
    title: "Download Results",
    description:
      "Download your processed files instantly. Files are automatically deleted for privacy.",
    color: "from-emerald-500 to-teal-500",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full px-4 pb-10 sm:pb-14 lg:pb-16">
      <div
        className="mx-auto max-w-7xl rounded-3xl border px-4 py-10 sm:py-12 lg:py-14"
        style={{
          backgroundColor: 'var(--bg-surface-60)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1
            className="text-3xl md:text-5xl font-black tracking-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            How{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">
              Converthub?
            </span>{" "}
            Works
          </h1>
          <p
            className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Simple, fast, and secure. Get your work done in just three easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:grid-cols-3 lg:gap-8">
          {/* Connecting line - Desktop */}
          <div
            className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px lg:block"
            style={{ backgroundColor: 'var(--border)' }}
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div
                  className={`flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <Icon className="mb-0.5 h-5 w-5 text-white/90" />
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                </div>

                <h3
                  className="mt-6 text-lg font-semibold sm:text-xl"
                  style={{ color: 'var(--text-heading)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3 max-w-sm text-sm leading-7 sm:text-base"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
