import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PromptHunter - Oszczędna Biblioteka Promptów AI',
  description: 'Automatycznie zbieraj prompty AI z Twittera - zoptymalizowane pod darmowe API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    PromptHunter 
                    <span className="text-sm text-green-600 ml-2">⚡ Oszczędny</span>
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Dashboard
                  </a>
                  <a href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Ustawienia
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}