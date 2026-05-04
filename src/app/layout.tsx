import type { Metadata } from 'next';
import '@/styles/globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { getDb } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let appName = 'Kanemori';

  try {
    const row = getDb().prepare("SELECT value FROM settings WHERE key = 'app_name'").get() as { value?: string } | undefined;
    if (row?.value) appName = row.value;
  } catch {}

  return {
    title: `${appName} — Personal Finance Tracker`,
    description: 'Track your finances, monitor spending, and achieve your financial goals.',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-area">
            <div className="page-content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
