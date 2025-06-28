import './globals.css'

export const metadata = {
  title: 'PromptHunter - AI Prompt Tracker',
  description: 'Automatyczne śledzenie i zbieranie AI promptów z X.com',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}