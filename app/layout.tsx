import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'English Learner',
  description: 'Learn English words with pronunciation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
