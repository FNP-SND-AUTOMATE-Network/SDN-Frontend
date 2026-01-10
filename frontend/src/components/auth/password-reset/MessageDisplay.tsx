import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

interface MessageDisplayProps {
    type: "success" | "error";
    message: string;
    additionalInfo?: string;
}

export function MessageDisplay({ type, message, additionalInfo }: MessageDisplayProps) {
    const isSuccess = type === "success";

    return (
        <div className={`rounded-md p-4 border ${isSuccess
                ? "bg-success-50 border-success-200"
                : "bg-danger-50 border-danger-200"
            }`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <FontAwesomeIcon
                        icon={isSuccess ? faCircleCheck : faCircleXmark}
                        className={`h-5 w-5 ${isSuccess ? "text-success-400" : "text-danger-400"
                            }`}
                    />
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-sf-pro-text ${isSuccess ? "text-success-800" : "text-danger-800"
                        }`}>
                        {message}
                    </p>
                    {additionalInfo && (
                        <p className={`text-xs mt-1 ${isSuccess ? "text-success-700" : "text-danger-700"
                            }`}>
                            {additionalInfo}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
