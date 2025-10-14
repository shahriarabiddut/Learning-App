import "@/app/globals.css";
import { Providers } from "@/app/provider";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { generateMetadata } from "@/lib/seo/generateMetadata";

// SEO Starts
export const metadata = generateMetadata({
  title: "",
  url: SITE_DEFAULTS.url,
  image: SITE_DEFAULTS.siteLogo,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getStoredValue(key, fallback) {
                  try {
                    return localStorage.getItem(key) || fallback;
                  } catch (error) {
                    return fallback;
                  }
                }

                function getSystemPreference() {
                  try {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } catch (error) {
                    return 'light';
                  }
                }

                function isValidTheme(value) {
                  return ['light', 'dark', 'system'].includes(value);
                }

                const THEME_STORAGE_KEY = 'theme';
                const savedTheme = getStoredValue(THEME_STORAGE_KEY, 'system');
                const theme = isValidTheme(savedTheme) ? savedTheme : 'system';
                const systemPreference = getSystemPreference();
                const resolvedTheme = theme === 'system' ? systemPreference : theme;

                const { documentElement } = document;
                documentElement.classList.remove('light', 'dark');
                documentElement.classList.add(resolvedTheme);
                documentElement.setAttribute('data-theme', resolvedTheme);

                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                  const color = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff';
                  metaThemeColor.setAttribute('content', color);
                }

                try {
                  sessionStorage.setItem('initial-theme', resolvedTheme);
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen font-poppins"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
