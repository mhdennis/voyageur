export const metadata = {
  title: "Voyageur — Your Travel Points Concierge",
  description:
    "Maximize your credit card points and loyalty rewards. Get personalized travel recommendations, trip planning, and points optimization.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
