import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/contexts/sidebar-context";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "YouTube",
  description: "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${roboto.variable} font-sans antialiased bg-yt-black text-yt-white`}>
        <QueryProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
