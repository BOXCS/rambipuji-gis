import React from "react";

export interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-[--color-neutral-subtle] flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-[--text-muted]" />
      </div>
      <h3 className="text-base font-medium text-[--text-primary] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[--text-muted] max-w-sm">{description}</p>
      )}
    </div>
  );
}
