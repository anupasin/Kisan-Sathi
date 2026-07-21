import { Header } from "./header";
import { SideNav } from "./side-nav";
import { TabBar } from "./tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col md:flex-row md:overflow-hidden">
      <SideNav />
      <div className="flex min-h-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pb-6 pt-4 md:max-w-6xl md:px-8">
          {children}
        </main>
        <TabBar />
      </div>
    </div>
  );
}
