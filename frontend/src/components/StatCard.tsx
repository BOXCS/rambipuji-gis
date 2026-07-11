import React from "react";

export interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
}

export default function StatCard({
  icon: Icon,
  value,
  label,
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[--border-default] flex items-center space-x-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[--color-primary-subtle] flex items-center justify-center text-[--color-primary] flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="font-semibold text-2xl text-[--text-primary]">
          {value}
        </div>
        <div className="text-sm text-[--text-muted]">{label}</div>
      </div>
    </div>
  );
}
