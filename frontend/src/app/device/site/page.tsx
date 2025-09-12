import { PageLayout } from "@/components/layout/PageLayout";

export default function DeviceSitePage() {
  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sf-pro-display">
        Device - Site
      </h1>
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600 font-sf-pro-text">
          หน้านี้กำลังพัฒนา
        </p>
      </div>
    </PageLayout>
  );
}
