// Layout.tsx
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({ children }: any) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#E9F3FF] dark:bg-gray-950">

      <Sidebar />


      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main
          className="
            flex-1 
            overflow-y-auto 
            p-6 
            dark:text-gray-100
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
