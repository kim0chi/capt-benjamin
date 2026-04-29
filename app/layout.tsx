import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider, THEME_STORAGE_KEY } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

const themeBootScript = `
(() => {
  const storageKey = '${THEME_STORAGE_KEY}';
  const defaultTheme = 'dark';
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : defaultTheme;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch {
    const root = document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = defaultTheme;
  }
})();
`

export const metadata: Metadata = {
  title: 'Kapitan',
  description:
    'Kapitan helps you stay on top of savings, upcoming bills, and spending habits with a clear, friendly money plan.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚓</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="kapitan-theme-bootstrap" dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${geist.className} bg-background font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
