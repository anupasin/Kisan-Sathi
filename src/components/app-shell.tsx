import { Header } from "./header";
import { TabBar } from "./tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-6 pt-4">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
