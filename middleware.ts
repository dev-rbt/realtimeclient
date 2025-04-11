import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/api/login', '/api/logout'];

// Secret key for JWT verification (should match the one used in login.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'robotpos_secure_jwt_secret_key_2025';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow access to public routes without authentication
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }
  
  // Allow access to static files and API routes except those that need protection
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/_next/') ||
    pathname.startsWith('/static') || 
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/protected'))
  ) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = req.cookies.get('auth-token')?.value;
  
  // If no token is found, redirect to login page
  if (!token) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token using jose
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secretKey);
    
    // If verification succeeds, allow access
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login page
    console.error('Token verification failed:', error);
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /login (login page)
     * 2. /api/login (login API)
     * 3. /api/logout (logout API)
     * 4. /_next (Next.js internals)
     * 5. /static (static files)
     * 6. /_vercel (Vercel internals)
     * 7. /favicon.ico, /robots.txt (common static files)
     */
    '/((?!login|api\/login|api\/logout|_next|static|_vercel|favicon.ico|robots.txt).*)',
  ],
};
