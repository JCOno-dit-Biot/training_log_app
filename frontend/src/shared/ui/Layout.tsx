import Sidebar from './sidebar/Sidebar';
import React from 'react';

export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <>
      {/* Sidebar: fixed column on the left */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-[13rem] z-10">
        <Sidebar />
      </div>

      {/* Main: pad for the sidebar, no width calc, no vertical overflow */}
      <main className="min-h-screen md:pl-[13rem] px-4 bg-gray-50">
        {children}
      </main>
    </>
  );
}
