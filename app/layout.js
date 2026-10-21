import "./globals.css";
export const metadata = { title: "AZPREP: unofficial AZ-900 study tool", description: "Quizzes, flashcards, a study plan and an AI buddy for Azure Fundamentals." };
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#4f3df0" };
export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
