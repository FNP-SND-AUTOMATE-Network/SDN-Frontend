"use client";

export default function LoadingSpinner() {
  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </div>
  );
}
