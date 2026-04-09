import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// เส้นทางที่ไม่ต้อง Login ก็เข้าได้
const PUBLIC_ROUTES = [
  '/', 
  '/login', 
  '/register', 
  '/forgot-password', 
  '/reset-password',
  '/otp',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เช็คว่าผู้ใช้มี Cookie 'refresh_token' หรือไม่ (ตาม Architecture คือ Backend จะส่ง HttpOnly Cookie มาให้)
  // หมายเหตุ: กรณีที่ยังไม่ได้แก้ Backend ให้ส่ง Cookie ตัว Middleware นี้จะทำงานผิดพลาดได้ 
  // แต่เราจะวางโครงสร้างดักจับจาก 'refresh_token' ไว้ก่อน
  const hasToken = request.cookies.has('refresh_token') || request.cookies.has('access_token');

  // ตรวจสอบว่าเป็น Public Route หรือไม่
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    // Exact match or starts with (for dynamic routes like /reset-password/[token])
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // 1. ถ้าไม่ได้ Login แต่พยายามเข้า Protected Route -> ส่งไป '/login'
  if (!hasToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // อยากส่งกลับมาหน้าเดิมหลัง Login เสร็จก็ทำได้ (Optional)
    // loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. ถ้า Login แล้ว แต่ดันพยายามเข้าหน้า Public (เช่น '/login', '/', `/register`) -> ส่งไป '/dashboard'
  if (hasToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. ปกติ ปล่อยผ่าน
  return NextResponse.next();
}

// กำหนดขอบเขตให้ Middleware ทำงานเฉพาะเส้นทางเบราว์เซอร์
export const config = {
  matcher: [
    /*
     * ไม่ทำงานในเส้นทางเหล่านี้:
     * - api (API routes ภายใน Next.js ถ้ามี)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons กราฟฟิกต่างๆ
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};
