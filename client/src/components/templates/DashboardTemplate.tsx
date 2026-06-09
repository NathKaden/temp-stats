import { ReactNode } from "react";

interface DashboardTemplateProps {
  header: ReactNode;
  overview: ReactNode;
  charts: ReactNode;
  table: ReactNode;
}

export const DashboardTemplate = ({ header, overview, charts, table }: DashboardTemplateProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          {header}
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Real-time Overview</h2>
            {overview}
          </section>
          
          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Historical Trends</h2>
            {charts}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Raw Data</h2>
            {table}
          </section>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Pi Monitor Dashboard &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};
