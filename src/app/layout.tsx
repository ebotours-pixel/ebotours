import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/use-cart.tsx";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wanderlust Hub",
  description: "Your ultimate destination for curated tour packages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WishlistProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
