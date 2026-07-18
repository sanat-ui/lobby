import './globals.css'

export const metadata = {
  title: 'Gamer Connect',
  description: 'Connect with fellow gamers and share your gaming experiences.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" metadata={metadata} suppressHydrationWarning data-theme="light">
      <body>{children}</body>
    </html>
  )
}
