import { Topbar } from "@/components/gestor/topbar";
import { Sidebar } from "@/components/gestor/sidebar";
import { BottomBar } from "@/components/gestor/bottom-bar";

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] lg:grid-cols-[240px_1fr] lg:grid-rows-[auto_1fr]">
      <Topbar />
      <Sidebar />
      <main className="min-w-0 p-4 pb-6 md:p-6 lg:p-7">{children}</main>
      <BottomBar />
    </div>
  );
}
