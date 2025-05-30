import Sidebar from './sidebar/Sidebar';
import React from 'react';

export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <>
    <div className="hidden md:flex">
      <Sidebar />
    </div>
      <main className="md:ml-50 w-[calc(100%-13rem)] min-h-screen p-4 bg-gray-50 overflow-x-hidden">{children}</main>
    </>
  );
}
