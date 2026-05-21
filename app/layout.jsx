import "./globals.css";
import CookieWrapper from "@/components/CookieWrapper";

export const metadata = {
  title: "Gyroroue — Are you wheeling it? International survey",
  description: "Adoption and use of electric unicycles — an international survey of riders, the curious, and the skeptics.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-theme="light" data-font="serif" data-density="default">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CookieWrapper>{children}</CookieWrapper>
      </body>
    </html>
  );
}
