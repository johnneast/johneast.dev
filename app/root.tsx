import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useState } from "react";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "About" },
    { to: "/experience", label: "Experience" },
    { to: "/chat", label: "Chat" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 z-10 relative">
        <h1 className="text-4xl font-bold">Hi there, I'm John East</h1>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          className={cn(
            "md:w-1/2 p-4 md:fixed md:top-[80px] md:h-[calc(100vh-80px)] transition-all",
            isMobileMenuOpen ? "block" : "hidden md:block"
          )}
        >
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "block w-full",
                      isActive ? "text-blue-600 dark:text-blue-400" : ""
                    )
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    {item.label}
                  </Button>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="md:hidden p-4 bg-gray-200 dark:bg-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "Close" : "Menu"}
        </button>

        <main
          className="md:w-1/2 p-4 md:ml-[50%] md:h-[calc(100vh-80px)] md:overflow-y-auto bg-white dark:bg-gray-900"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
