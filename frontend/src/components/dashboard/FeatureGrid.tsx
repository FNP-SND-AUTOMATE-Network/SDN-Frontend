import { FeatureCard } from "./FeatureCard";

export const FeatureGrid = () => {
  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6 text-success-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "ระบบรับรอง",
      description: "Login, Register, OTP พร้อมใช้งาน",
      bgColor: "bg-success-100",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828l-8.485 8.485a2 2 0 01-1.414.586l-4 1 1-4a2 2 0 01.586-1.414L8.343 7.343z"
          />
        </svg>
      ),
      title: "UI Components",
      description: "Material-UI, Font Awesome, SF Pro Font",
      bgColor: "bg-primary-100",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-warning-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "การแจ้งเตือน",
      description: "Alert System พร้อม Animations",
      bgColor: "bg-warning-100",
    },
  ];

  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};
