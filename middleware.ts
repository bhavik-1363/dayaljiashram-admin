import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isRootPage = request.nextUrl.pathname === "/"

  // Only redirect the root page to login
  if (isRootPage) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login"],
}
