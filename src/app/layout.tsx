import { Inter as FontSans } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Exam Builder',
    template: '%s | Exam Builder',
  },
  description: 'Create and manage exams easily with our intuitive exam building platform.',
  keywords: ['exam', 'education', 'assessment', 'quiz', 'test builder'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`min-h-screen bg-gray-50 font-sans antialiased ${fontSans.variable}`}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
