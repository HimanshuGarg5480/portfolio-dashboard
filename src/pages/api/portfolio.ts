import { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

const StockData = [
  {
    name: 'HDFC Bank',
    purchasePrice: 1490,
    quantity: 50,
    investment: 74500,
    exchange: 'HDFCBANK',
    sector: 'Financial Sector',
  },
  {
    name: 'Bajaj Finance',
    purchasePrice: 6466,
    quantity: 15,
    investment: 96990,
    exchange: 'BAJFINANCE',
    sector: 'Financial Sector',
  },
  {
    name: 'ICICI Bank',
    purchasePrice: 780,
    quantity: 84,
    investment: 65520,
    exchange: 'ICICIBANK',
    sector: 'Financial Sector',
  },
  {
    name: 'Bajaj Housing',
    purchasePrice: 130,
    quantity: 504,
    investment: 65520,
    exchange: 'BAJAJHFL',
    sector: 'Financial Sector',
  },
  // {
  //   name: 'Savani Financials',
  //   purchasePrice: 130,
  //   quantity: 504,
  //   investment: 65520,
  //   exchange: 'SAVFIN.BO',
  //   sector: 'Financial Sector',
  // },
  {
    name: 'Affle India',
    purchasePrice: 1151,
    quantity: 50,
    investment: 57550,
    exchange: 'AFFLE',
    sector: 'Tech Sector',
  },
  {
    name: 'LTI Mindtree',
    purchasePrice: 4775,
    quantity: 16,
    investment: 76400,
    exchange: 'LTIM',
    sector: 'Tech Sector',
  },
  {
    name: 'KPIT Tech',
    purchasePrice: 672,
    quantity: 61,
    investment: 40992,
    exchange: 'KPITTECH',
    sector: 'Tech Sector',
  },
  {
    name: 'Tata Tech',
    purchasePrice: 1072,
    quantity: 63,
    investment: 67536,
    exchange: 'TATATECH',
    sector: 'Tech Sector',
  },
  {
    name: 'BLS E-Services',
    purchasePrice: 232,
    quantity: 191,
    investment: 44312,
    exchange: 'BLSE',
    sector: 'Tech Sector',
  },
  {
    name: 'Tanla',
    purchasePrice: 1134,
    quantity: 45,
    investment: 51030,
    exchange: 'TANLA',
    sector: 'Tech Sector',
  },
  {
    name: 'Dmart',
    purchasePrice: 3777,
    quantity: 27,
    investment: 101979,
    exchange: 'DMART',
    sector: 'Consumer Sector',
  },
  {
    name: 'Tata Consumer',
    purchasePrice: 845,
    quantity: 90,
    investment: 76050,
    exchange: 'TATACONSUM',
    sector: 'Consumer Sector',
  },
  {
    name: 'Pidilite',
    purchasePrice: 2376,
    quantity: 36,
    investment: 85536,
    exchange: 'PIDILITIND',
    sector: 'Consumer Sector',
  },
  {
    name: 'Tata Power',
    purchasePrice: 224,
    quantity: 225,
    investment: 50400,
    exchange: 'TATAPOWER',
    sector: 'Power Sector',
  },
  {
    name: 'KPI Green',
    purchasePrice: 875,
    quantity: 50,
    investment: 43750,
    exchange: 'KPIGREEN',
    sector: 'Power Sector',
  },
  {
    name: 'Suzlon',
    purchasePrice: 44,
    quantity: 450,
    investment: 19800,
    exchange: 'SUZLON',
    sector: 'Power Sector',
  },
  {
    name: 'Gensol',
    purchasePrice: 998,
    quantity: 45,
    investment: 44910,
    exchange: 'GENSOL',
    sector: 'Power Sector',
  },
  {
    name: 'Hariom Pipes',
    purchasePrice: 580,
    quantity: 60,
    investment: 34800,
    exchange: 'HARIOMPIPE',
    sector: 'Pipe Sector',
  },
  {
    name: 'Astral',
    purchasePrice: 1517,
    quantity: 56,
    investment: 84952,
    exchange: 'ASTRAL',
    sector: 'Pipe Sector',
  },
  {
    name: 'Polycab',
    purchasePrice: 2818,
    quantity: 28,
    investment: 78904,
    exchange: 'POLYCAB',
    sector: 'Pipe Sector',
  },
  {
    name: 'Clean Science',
    purchasePrice: 1610,
    quantity: 32,
    investment: 51520,
    exchange: 'CLEAN',
    sector: 'Others',
  },
  {
    name: 'Deepak Nitrite',
    purchasePrice: 2248,
    quantity: 27,
    investment: 60696,
    exchange: 'DEEPAKNTR',
    sector: 'Others',
  },
  {
    name: 'Fine Organic',
    purchasePrice: 4284,
    quantity: 16,
    investment: 68544,
    exchange: 'FINEORG',
    sector: 'Others',
  },
  {
    name: 'Gravita',
    purchasePrice: 2037,
    quantity: 8,
    investment: 16296,
    exchange: 'GRAVITA',
    sector: 'Others',
  },
  {
    name: 'SBI Life',
    purchasePrice: 1197,
    quantity: 49,
    investment: 58653,
    exchange: 'SBILIFE',
    sector: 'Others',
  },
  ];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const enriched = await Promise.all(StockData.map(fetchStockData));
  res.status(200).json(enriched);
}
async function fetchStockData(stock: any) {
  const trySuffixes = ['.NS', '.BO'];

  for (const suffix of trySuffixes) {
    try {
      const yahoo = await yahooFinance.quoteSummary(`${stock.exchange}${suffix}`, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      });

      const cmp = yahoo.price?.regularMarketPrice ?? stock.purchasePrice ?? 0;
      const peRatio = yahoo.summaryDetail?.trailingPE ?? 0;
      const eps = (yahoo.defaultKeyStatistics as any)?.trailingEps;
      const latestEarnings = eps ? `${eps} EPS` : 'N/A';
      const investment = stock.purchasePrice * stock.quantity;
      const presentValue = cmp * stock.quantity;
      const gainLoss = presentValue - investment;

      return {
        ...stock,
        cmp,
        presentValue,
        gainLoss,
        peRatio,
        latestEarnings,
        listedAt: suffix === '.NS' ? 'NSE' : 'BSE',
      };
    } catch (err) {
      // continue to next suffix
    }
  }

  // If both .NS and .BO failed:
  console.error(`Yahoo data fetch failed for ${stock.name} (${stock.exchange}) on both NSE and BSE`);

  return {
    ...stock,
    cmp: stock.purchasePrice,
    peRatio: 0,
    latestEarnings: 'N/A',
    error: 'Fetch failed',
  };
}
