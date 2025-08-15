import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import ThemeRegistry from './ThemeRegistry/ThemeRegistry';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticketing System",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>
          <ThemeRegistry>
            <div className="min-h-screen flex flex-col">
              <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16 items-center">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      <span className="relative">
                        <span className="relative z-10">Ticketing System</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 blur-lg opacity-70 scale-110">
                          Ticketing System
                        </span>
                      </span>
                    </h1>
                    <nav className="flex space-x-4">
                      <a href="/admin/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                      <a href="/admin/tickets" className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Tickets</a>
                      <a href="/admin/users" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Users</a>
                    </nav>
                  </div>
                </div>
              </header>
              <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Ticketing System. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
