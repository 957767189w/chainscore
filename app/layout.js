import './globals.css';

export const metadata = {
  title: 'ChainScore - 链上信誉评分',
  description: '基于 GenLayer 的去中心化链上信用评分协议',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
