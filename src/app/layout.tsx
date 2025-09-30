import type { Metadata } from "next";
import "./globals.css"; // Make sure you have a global CSS file

export const metadata: Metadata = {
  // You can move your <title> here
  title: "AI Site Generator",
  description: "Powered by Google Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/*
          'children' is where your page content (like page.tsx) will be rendered.
          This is the Next.js equivalent of your old <div id="root"></div>.
        */}
        {children}
      </body>
    </html>
  );
}