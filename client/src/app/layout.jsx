// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'; 
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Launchpad',
  description: 'Showcase your projects and connect with innovators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Civic Auth Script */}
        <Script
          src="https://auth.civic.com/js/civic.siww.js"
          strategy="beforeInteractive"
          id="civic-script"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// import { Geist, Geist_Mono } from "next/font/google";
// import Providers from './providers'; 
// import "./globals.css";
// import "./font.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Launchpad", // Updated to match your app
//   description: "The Student Modern Innovators' Park",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         <Script
//           src="https://auth.civic.com/js/civic.siww.js"
//           strategy="beforeInteractive"
//           id="civic-script"
//         />
//       </head>
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }