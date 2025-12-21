import React from 'react';

import Sidebar from './sidebar/Sidebar';

export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <>
      {/* Sidebar: fixed column on the left */}
      <div className="fixed inset-y-0 left-0 z-10 hidden w-[13rem] md:block">
        <Sidebar />
      </div>

      {/* Main: pad for the sidebar, no width calc, no vertical overflow */}
      <main className="min-h-screen bg-neutral-100 px-4 md:pl-[13rem]">{children}</main>
    </>
  );
}
