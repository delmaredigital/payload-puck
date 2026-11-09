// Import your Tailwind CSS; adjust the path as needed
import '@/app/(frontend)/globals.css'

export const metadata = {
  title: 'Puck Editor',
  description: 'Visual page editor',
}

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme="light" is needed if your CSS hides content until a theme
    // is set (a common FOUC-prevention pattern). Match your theme system.
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  )
}
