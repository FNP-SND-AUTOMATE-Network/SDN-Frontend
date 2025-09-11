import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme หลักของระบบ
        primary: {
          50: "#F0F9FF",
          100: "#E0F2FE", 
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#61B4E8", // สีหลัก
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
        secondary: {
          50: "#F7FAFC",
          100: "#EDF2F7",
          200: "#E2E8F0",
          300: "#CBD5E0",
          400: "#A0AEC0",
          500: "#A9D5EE", // สีรอง
          600: "#718096",
          700: "#4A5568",
          800: "#2D3748",
          900: "#1A202C",
        },
        // Theme สำหรับปุ่มและ alert
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0", 
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E", // สำหรับยืนยัน
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5", 
          400: "#F87171",
          500: "#EF4444", // สำหรับข้อผิดพลาด
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F78A04", // สำหรับแจ้งเตือน
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // เพิ่มสีขาวเป็น utility
        background: "#FFFFFF",
        foreground: "#1A202C",
      },
      fontFamily: {
        'sf-pro': [
          '-apple-system',
          'BlinkMacSystemFont', 
          'SF Pro Display',
          'SF Pro Text',
          'system-ui',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        'sf-pro-text': [
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        'sf-pro-display': [
          'SF Pro Display',
          '-apple-system', 
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
