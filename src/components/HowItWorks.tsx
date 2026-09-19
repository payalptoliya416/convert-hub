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
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-900/60 px-4 py-10 sm:py-12 lg:py-14">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How ConvertHub Works
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base lg:text-lg">
            Simple, fast, and secure. Get your work done in just three easy
            steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:grid-cols-3 lg:gap-8">
          {/* Connecting line - Desktop */}
          <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px bg-slate-700 lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Step Circle */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <Icon className="mb-0.5 h-5 w-5 text-white/90" />
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-white sm:text-2xl">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400 sm:text-base">
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
