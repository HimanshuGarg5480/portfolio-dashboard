import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { StockData } from "../types/portfolio";
import { fetchPortfolio } from "../lib/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const columnHelper = createColumnHelper<StockData>();

const columns = [
  columnHelper.accessor("name", { header: "Stock" }),
  columnHelper.accessor("exchange", { header: "Stock Name" }),
  columnHelper.accessor("quantity", { header: "Qty" }),
  columnHelper.accessor("purchasePrice", { header: "Buy Price" }),
  columnHelper.accessor("cmp", { header: "CMP" }),
  columnHelper.accessor("investment", { header: "Investment" }),
  columnHelper.accessor("presentValue", { header: "Present Value" }),
  columnHelper.accessor("gainLoss", {
    header: "Gain/Loss",
    cell: (info) => (
      <span
        className={`${
          info.getValue() >= 0 ? "text-green-400" : "text-red-400"
        } font-semibold`}
      >
        {info.getValue().toFixed(2)}
      </span>
    ),
  }),
  columnHelper.accessor("peRatio", { header: "P/E Ratio" }),
  columnHelper.accessor("latestEarnings", { header: "Latest Earnings" }),
];

export default function PortfolioTable() {
  const [data, setData] = useState<StockData[]>([]);

  const fetchAndSet = async () => {
    const portfolio = await fetchPortfolio();
    setData(portfolio);
  };

  useEffect(() => {
    fetchAndSet();
    const interval = setInterval(fetchAndSet, 15000);
    return () => clearInterval(interval);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const groupedBySector = data.reduce(
    (acc, stock) => {
      if (!acc[stock.sector]) {
        acc[stock.sector] = {
          purchasePrice: 0,
          investment: 0,
          presentValue: 0,
          gainLoss: 0,
        };
      }
      acc[stock.sector].investment += stock.investment;
      acc[stock.sector].presentValue += stock.presentValue;
      acc[stock.sector].purchasePrice += stock.purchasePrice;
      acc[stock.sector].gainLoss += stock.gainLoss;
      return acc;
    },
    {} as Record<
      string,
      {
        purchasePrice: number;
        investment: number;
        presentValue: number;
        gainLoss: number;
      }
    >
  );

  const chartData = Object.entries(groupedBySector).map(
    ([sector, summary]) => ({
      name: sector,
      investment: summary.investment,
      purchasePrice: summary.purchasePrice,
      presentValue: summary.presentValue,
      gainLoss: summary.gainLoss,
    })
  );

  const COLORS = [
    "#6366f1",
    "#22c55e",
    "#f97316",
    "#e11d48",
    "#0ea5e9",
    "#F4C2C2",
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-100 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
        📊 Portfolio Overview
      </h2>

      {/* Portfolio Table */}
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-700 mb-10">
        <table className="min-w-full divide-y divide-gray-700 bg-gray-800 text-sm">
          <thead className="bg-gray-700 text-gray-200 text-xs uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center font-medium"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-700 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sector Summary */}
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
        🏭 Sector Summary
      </h2>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-700 mb-10">
        <table className="min-w-full divide-y divide-gray-700 bg-gray-800 text-sm">
          <thead className="bg-gray-700 text-gray-200 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-center">Sector</th>
              <th className="px-4 py-3 text-center">Purchase Price</th>
              <th className="px-4 py-3 text-center">Investment</th>
              <th className="px-4 py-3 text-center">Present Value</th>
              <th className="px-4 py-3 text-center">Gain/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Object.entries(groupedBySector).map(([sector, summary], idx) => (
              <tr key={idx} className="hover:bg-gray-700 transition">
                <td className="px-4 py-2 text-center">{sector}</td>
                <td className="px-4 py-2 text-center">
                  {summary.purchasePrice.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  {summary.investment.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  {summary.presentValue.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center font-semibold">
                  <span
                    className={
                      summary.gainLoss >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {summary.gainLoss.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
        📈 Sector Investment Distribution
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="investment"
              nameKey="name"
              outerRadius={100}
              fill="#8884d8"
              label={({ name }) => name}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#f9fafb",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
