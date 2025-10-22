import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import CourierNavigation from "@/components/layout/CourierNavigation";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "Yusu Courier Panel - Kuryer Paneli",
  description: "Yusu Courier Panel - Çatdırılma sifarişlərini idarə edin və müştərilərə xidmət göstərin. / Manage delivery orders and serve customers.",
  keywords: "courier, kuryer, courier panel, kuryer paneli, delivery management, çatdırılma idarəetməsi, logistics",
  authors: [{ name: "Yusu Courier Team" }],
  openGraph: {
    title: "Yusu Courier Panel - Kuryer Paneli",
    description: "Çatdırılma sifarişlərini idarə edin və müştərilərə xidmət göstərin. / Manage delivery orders and serve customers.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
