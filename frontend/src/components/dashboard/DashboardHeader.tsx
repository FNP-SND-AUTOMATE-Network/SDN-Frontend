import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

export const DashboardHeader = () => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
        <FontAwesomeIcon 
          icon={faScrewdriverWrench} 
          className="text-primary-600 text-4xl"
        />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4 font-sf-pro-display">
        Dashboard
      </h1>
      <p className="text-xl text-gray-600 font-sf-pro-text">
        ระบบจัดการหลัก
      </p>
    </div>
  );
};
