import './globals.css';

export const metadata = {
  title: 'ChainScore - On-chain Reputation Score',
  description: 'Decentralized on-chain credit scoring protocol built on GenLayer',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
