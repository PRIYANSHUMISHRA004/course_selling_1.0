import React from "react";
import { FeatureItem } from "./FeatureItem";

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonColor?: string;
  onClick: () => void;
  accentColor: string;
}

export const RoleCard = ({
  icon,
  title,
  description,
  features,
  buttonText,
  buttonColor,
  onClick,
  accentColor,
}: RoleCardProps) => {
  return (
    <div
      className="flex-1 w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 group"
      style={{
        borderColor: undefined,
      }}
    >
      {/* Card Header */}
      <div className="p-6 pb-0 flex flex-col items-start">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card Content - Feature List */}
      <div className="p-6 pt-4 pb-0 flex-1">
        <div className="space-y-3 mb-6">
          {features.map((feature, idx) => (
            <FeatureItem key={idx} text={feature} />
          ))}
        </div>
      </div>

      {/* Card Actions - Button */}
      <div className="p-6 pt-4">
        <button
          type="button"
          onClick={onClick}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: buttonColor || accentColor,
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
