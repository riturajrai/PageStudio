import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow studio and preview routes
  if (pathname.startsWith('/studio') || pathname.startsWith('/preview')) {
    return NextResponse.next();
  }

  // Add more rules later (RBAC)
  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*', '/preview/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};