import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

export const DevelopmentStatus = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warning-100 rounded-full mb-6">
            <FontAwesomeIcon 
              icon={faScrewdriverWrench} 
              className="text-warning-600 text-2xl"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-sf-pro-display">
            🚧 กำลังพัฒนา
          </h2>

          <p className="text-lg text-gray-600 mb-8 font-sf-pro-text">
            ระบบ Dashboard หลักอยู่ในระหว่างการพัฒนา
            <br />
            โปรดรอติดตามในเร็วๆ นี้
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  🔑 Login
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" className="w-full">
                  📝 Register
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3 font-sf-pro-text">
                🧪 ทดสอบระบบ:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/otp">
                  <Button variant="warning" className="w-full text-sm py-2">
                    🔢 ทดสอบ OTP
                  </Button>
                </Link>

                <Link href="/alerts-demo">
                  <Button
                    variant="secondary"
                    className="w-full text-sm py-2"
                  >
                    🎉 ทดสอบ Alerts
                  </Button>
                </Link>

                <Link href="/test-api">
                  <Button variant="warning" className="w-full text-sm py-2">
                    🔧 ทดสอบ API
                  </Button>
                </Link>

                <Link href="/debug-otp">
                  <Button variant="outline" className="w-full text-sm py-2">
                    🔍 Debug OTP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
