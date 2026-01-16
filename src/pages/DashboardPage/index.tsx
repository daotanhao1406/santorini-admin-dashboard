import { ChartAreaInteractive } from "./components/ChartAreaInteractive";
import { RecentTransactions } from "./components/RecentTransactions";
import { RevenueBreakdown } from "./components/RevenueBreakdown";
import { SectionCards } from "./components/SelectionCards";

export default function DashboardPage() {
  return (
    <>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div className="px-4 lg:px-6 space-y-6">
        <SectionCards />
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <ChartAreaInteractive />
          <RevenueBreakdown />
        </div>
        <RecentTransactions />
      </div>
    </>
  );
}
