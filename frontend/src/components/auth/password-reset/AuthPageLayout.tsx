import { ReactNode } from "react";

interface AuthPageLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
}

export function AuthPageLayout({ title, description, children }: AuthPageLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-primary-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
                        {title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {description}
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
