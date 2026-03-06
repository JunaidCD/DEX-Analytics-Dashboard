import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DEXplorer - Decentralized Exchange",
  description: "Advanced Web3 DEX Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
