import Navbar from './Navbar';
import React from 'react';
export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
    </>
  );
}
