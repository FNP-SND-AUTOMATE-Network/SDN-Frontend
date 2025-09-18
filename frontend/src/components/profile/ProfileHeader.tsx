"use client";

interface ProfileHeaderProps {
  title: string;
  description: string;
}

export default function ProfileHeader({ title, description }: ProfileHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 font-sf-pro-display">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}
