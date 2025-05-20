import Sidebar from './Sidebar';
import React from 'react';
export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <>
      <Sidebar />
      <main className="p-4">{children}</main>
    </>
  );
}
