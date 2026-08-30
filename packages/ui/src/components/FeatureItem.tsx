import React from "react";
import { CheckCircleIcon } from "./icons";

interface FeatureItemProps {
  text: string;
}

export const FeatureItem = ({ text }: FeatureItemProps) => {
  return (
    <div className="flex items-center gap-3">
      <CheckCircleIcon className="w-5 h-5 text-blue-500 shrink-0" />
      <span className="text-sm font-medium text-slate-800">
        {text}
      </span>
    </div>
  );
};
