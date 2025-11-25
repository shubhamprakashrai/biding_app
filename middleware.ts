import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public routes
  const isPublic =
    path === "/" ||
    path === "/login" ||
    path === "/register";

  // Read "user" cookie
  const userCookie = request.cookies.get("user")?.value;
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie); // { name, email, role }
    } catch (e) {
      user = null;
    }
  }

  // ==========================================================
  // 1. LOGGED-IN USERS VISITING LOGIN OR REGISTER
  // ==========================================================
  if ((path === "/login" || path === "/register") && user) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (user.role === "DEV") {
      return NextResponse.redirect(new URL("/dev-dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ==========================================================
  // 2. PROTECTED ROUTES - must be logged in
  // ==========================================================
  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ==========================================================
  // 3. ADMIN ROUTE PROTECTION
  // ==========================================================
  if (path.startsWith("/admin")) {
    if (user?.role !== "ADMIN") {
      if (user?.role === "DEV") {
        return NextResponse.redirect(new URL("/dev-dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ==========================================================
  // 3.1 ADMIN-ONLY PROTECTION FOR /list-users
  // ==========================================================
  if (path.startsWith("/list-users")) {
    if (!user || user.role !== "ADMIN") {
      // If DEV tries to access admin-only route
      if (user?.role === "DEV") {
        return NextResponse.redirect(new URL("/dev-dashboard", request.url));
      }
      // If normal user tries
      if (user?.role === "USER") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Not logged in
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ==========================================================
  // 4. USER ROUTE PROTECTION
  // ==========================================================
  if (path.startsWith("/dashboard")) {
    if (user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (user?.role === "DEV") {
      return NextResponse.redirect(new URL("/dev-dashboard", request.url));
    }
  }

  // ==========================================================
  // 5. DEV ROUTE PROTECTION
  // ==========================================================
  if (path.startsWith("/dev-dashboard")) {
    if (user?.role !== "DEV") {
      if (user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (user?.role === "USER") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin/:path*",
    "/dev-dashboard/:path*",
    "/list-users/:path*",  // 🔥 Added admin-protected route
  ],
};


// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;

//   // Public routes
//   const isPublic =
//     path === "/" ||
//     path === "/login" ||
//     path === "/register";

//   // Read "user" cookie
//   const userCookie = request.cookies.get("user")?.value;
//   let user = null;

//   if (userCookie) {
//     try {
//       user = JSON.parse(userCookie); // { name, email, role }
//     } catch (e) {
//       user = null;
//     }
//   }

//   // ==========================================================
//   // 1. LOGGED-IN USERS VISITING LOGIN OR REGISTER
//   // ==========================================================
//   if ((path === "/login" || path === "/register") && user) {
//     if (user.role === "ADMIN") {
//       return NextResponse.redirect(new URL("/admin", request.url));
//     }
//     if (user.role === "DEV") {
//       return NextResponse.redirect(new URL("/dev-dashboard", request.url));
//     }
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   // ==========================================================
//   // 2. PROTECTED ROUTES - user must be logged in
//   // ==========================================================
//   if (!isPublic && !user) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // ==========================================================
//   // 3. ADMIN ROUTE PROTECTION
//   // ==========================================================
//   if (path.startsWith("/admin")) {
//     if (user?.role !== "ADMIN") {
//       // If DEV tries to open ADMIN → send to DEV dashboard
//       if (user?.role === "DEV") {
//         return NextResponse.redirect(new URL("/dev-dashboard", request.url));
//       }
//       // Normal user → send to user dashboard
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//   }

//   // ==========================================================
//   // 4. USER ROUTE PROTECTION
//   // ==========================================================
//   if (path.startsWith("/dashboard")) {
//     if (user?.role === "ADMIN") {
//       return NextResponse.redirect(new URL("/admin", request.url));
//     }
//     if (user?.role === "DEV") {
//       return NextResponse.redirect(new URL("/dev-dashboard", request.url));
//     }
//   }

//   // ==========================================================
//   // 5. DEV ROUTE PROTECTION
//   // ==========================================================
//   if (path.startsWith("/dev-dashboard")) {
//     if (user?.role !== "DEV") {
//       if (user?.role === "ADMIN") {
//         return NextResponse.redirect(new URL("/admin", request.url));
//       }
//       if (user?.role === "USER") {
//         return NextResponse.redirect(new URL("/dashboard", request.url));
//       }
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/",
//     "/login",
//     "/register",
//     "/dashboard/:path*",
//     "/admin/:path*",
//     "/dev-dashboard/:path*"
//   ],
// };
