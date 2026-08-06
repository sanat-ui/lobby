// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // We'll add proper auth protection in Phase 5
  // For now just let all requests through
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}