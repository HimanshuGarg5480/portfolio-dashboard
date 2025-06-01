import PortfolioTable from '../components/PortfolioTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Portfolio Dashboard</h1>
      <PortfolioTable />
    </main>
  );
}
