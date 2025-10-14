export function DashboardChildren({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex-1 overflow-y-auto bg-background">
      {children}
    </section>
  );
}
