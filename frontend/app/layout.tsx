import Navbar from '@/components/layout/Navbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-canvas text-ink min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex-grow bg-canvas">
          {children}
        </div>
      </body>
    </html>
  );
}