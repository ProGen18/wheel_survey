'use client';

import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";

export default function CookieWrapper({ children }) {
  return (
    <>
      {children}
      <CookieBanner />
      <Footer />
    </>
  );
}
