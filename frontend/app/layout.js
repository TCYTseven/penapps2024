import "./globals.css";

export const metadata = {
  title: "Penapps 2024",
  description: "Hackathon Project by Tejas, Jaxon, Glen, and Aanya.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add Google Fonts or another CDN link here */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;900&family=Roboto+Mono:wght@100;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
