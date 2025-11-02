import type { Metadata } from "next";
import "./globals.css";
import SessionProviderAuth from "@/components/SessionProviderAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google"; // Import Google Font
import BottomNav from "@/components/BottomNav";

// Konfigurasi font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "300", "500", "700", "900"], // Pilih variasi font
  variable: "--font-poppins", // Variabel CSS untuk digunakan di Tailwind
});

export const metadata: Metadata = {
  title: "SocialBracket",
  description: "A social media platform",
  icons: "/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased font-poppins">
        <SessionProviderAuth>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              <Navbar />
              <div className="py-5 w-full">{children}<BottomNav /></div>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </SessionProviderAuth>
      </body>
    </html>
  );
}
