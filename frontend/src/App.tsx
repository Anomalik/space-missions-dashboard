import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Space Missions Dashboard
          </h1>
          <ThemeToggle />
        </header>
        <main className="p-6">
          <p className="text-muted-foreground">Dashboard loading...</p>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
