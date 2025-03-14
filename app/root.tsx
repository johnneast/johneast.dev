import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { useState } from "react";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import FooterContent from "./components/footer-content";
import HeaderContent from "./components/header-content";

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
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { to: "/", label: "About" },
    { to: "/experience", label: "Experience" },
    { to: "/chat", label: "Chat" },
  ];

  const currentRouteLabel =
    navItems.find((item) => item.to === location.pathname)?.label || "Select";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-row h-screen max-w-7xl mx-auto">
        <div className="md:w-1/2 flex flex-col h-screen p-4 pt-12">
          <header className="mb-8">
            <HeaderContent />
          </header>

          <nav className="flex-1">
            <ul className="flex flex-col gap-2 h-full">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      cn(
                        "block w-full",
                        isActive ? "text-primary" : "text-foreground"
                      )
                    }
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

          <footer className="text-sm">
            <FooterContent />
          </footer>
        </div>

        {/* Main Content */}
        <main className="md:w-1/2 p-4 pt-12 h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col">
        <header className="p-4 w-full">
          <HeaderContent />
        </header>

        <nav className="p-4 sticky top-0 z-10 bg-background">
          <Select
            value={location.pathname}
            defaultValue={currentRouteLabel}
            onValueChange={(value) => navigate(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              {navItems.map((item) => (
                <SelectItem key={item.to} value={item.to}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </nav>

        <main className="p-4 flex-1">
          <Outlet />
        </main>

        <footer className="p-4 text-sm">
          <FooterContent />
        </footer>
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