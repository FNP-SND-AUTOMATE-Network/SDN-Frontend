"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

interface ErrorMessageProps {
  error: string | null;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-red-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">{error}</div>
        </div>
      </div>
    </div>
  );
}
