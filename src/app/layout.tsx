import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/hooks/use-cart.tsx';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wanderlust Hub',
  description: 'Your ultimate destination for curated tour packages.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-slate-900 text-slate-300 py-12">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white mb-4">Wanderlust Hub</h3>
                  <p className="text-sm">Let's make your best trip with us. We provide the best tour packages to make your journey unforgettable.</p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-primary">About Us</a></li>
                    <li><a href="#" className="hover:text-primary">Tours</a></li>
                    <li><a href="#" className="hover:text-primary">Destinations</a></li>
                    <li><a href="#" className="hover:text-primary">Contact</a></li>
                  </ul>
                </div>
                 <div>
                  <h3 className="font-headline text-lg font-bold text-white mb-4">Contact Info</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <span>+123 456 7890</span></li>
                    <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <span>info@wanderlusthub.com</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white mb-4">Newsletter</h3>
                   <p className="text-sm mb-2">Subscribe for latest updates</p>
                   <div className="flex">
                      <input type="email" placeholder="Your email" className="bg-slate-800 text-white px-4 py-2 rounded-l-md focus:outline-none w-full"/>
                      <button className="bg-primary text-white px-4 py-2 rounded-r-md">Go</button>
                   </div>
                </div>
              </div>
              <div className="container mx-auto text-center border-t border-slate-700 mt-8 pt-6">
                <p className="text-sm">&copy; {new Date().getFullYear()} Wanderlust Hub. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
