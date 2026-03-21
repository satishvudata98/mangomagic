import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { SHOP_CONFIG } from "@/lib/shopConfig";
import { en } from "@/localization/en";

export const metadata = {
  title: {
    default: `${SHOP_CONFIG.name} | Premium Mangoes`,
    template: `%s | ${SHOP_CONFIG.name}`
  },
  description: en.meta.defaultDescription
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-textPrimary antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
