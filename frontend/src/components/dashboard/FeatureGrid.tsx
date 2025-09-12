import {
  faBell,
  faCertificate,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FeatureCard } from "./FeatureCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
          <FontAwesomeIcon icon={faCertificate} />
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
          <FontAwesomeIcon icon={faShieldAlt} />
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
          <FontAwesomeIcon icon={faBell} />
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
