import React from "react";
import { Check, LockKeyhole, Zap, Smartphone } from "lucide-react";

const features = [
  {
    icon: Check,
    iconWrapper: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    title: "100% Free Tools",
    description:
      "Access all tools without any registration or payment. No hidden charges, ever.",
  },
  {
    icon: LockKeyhole,
    iconWrapper: "bg-blue-500/15",
    iconColor: "text-blue-400",
    title: "Secure & Private",
    description:
      "Your files are processed securely and deleted automatically. We respect your privacy.",
  },
  {
    icon: Zap,
    iconWrapper: "bg-violet-500/15",
    iconColor: "text-violet-400",
    title: "Lightning Fast",
    description:
      "Optimized for speed. Process your files in seconds, not minutes.",
  },
  {
    icon: Smartphone,
    iconWrapper: "bg-pink-500/15",
    iconColor: "text-pink-400",
    title: "Works Everywhere",
    description:
      "Use on any device - desktop, mobile, or tablet. No installation needed.",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="w-full py-10 sm:py-14 lg:py-16 px-4">
      <div
        className="mx-auto max-w-7xl px-4 rounded-3xl border py-10 sm:py-12 lg:py-14"
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
            Why Choose{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400">
              Converthub?
            </span>
          </h1>
          <p
            className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your all-in-one platform for productivity tools. Fast, secure, and completely free.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group min-h-[270px] rounded-2xl border transition-all duration-300 hover:-translate-y-1 sm:min-h-[270px] p-4"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-base)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-input)';
                }}
              >
                {/* Icon */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${feature.iconWrapper}`}>
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
