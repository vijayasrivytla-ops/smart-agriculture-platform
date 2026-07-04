import React, { useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, HelpCircle, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CropMarket {
  id: string;
  name: string;
  currentPrice: number; // per Metric Ton (USD)
  change: number; // Percentage
  volume: string;
  minPrice: number;
  maxPrice: number;
  grade: string;
  trendData: { month: string; actual: number; predicted?: number }[];
}

const CROP_MARKETS: CropMarket[] = [
  {
    id: "wheat",
    name: "Hard Red Winter Wheat",
    currentPrice: 284.50,
    change: 2.4,
    volume: "12,450 MT",
    minPrice: 271.00,
    maxPrice: 290.00,
    grade: "Grade A (Standard)",
    trendData: [
      { month: "Jan", actual: 265 },
      { month: "Feb", actual: 270 },
      { month: "Mar", actual: 278 },
      { month: "Apr", actual: 272 },
      { month: "May", actual: 280 },
      { month: "Jun", actual: 284, predicted: 284 },
      { month: "Jul", actual: 284, predicted: 289 },
      { month: "Aug", actual: 284, predicted: 293 },
      { month: "Sep", actual: 284, predicted: 298 },
    ]
  },
  {
    id: "rice",
    name: "Basmati / Long Grain Rice",
    currentPrice: 420.00,
    change: -1.2,
    volume: "8,920 MT",
    minPrice: 415.00,
    maxPrice: 432.00,
    grade: "Premium Export Grade",
    trendData: [
      { month: "Jan", actual: 440 },
      { month: "Feb", actual: 435 },
      { month: "Mar", actual: 428 },
      { month: "Apr", actual: 425 },
      { month: "May", actual: 422 },
      { month: "Jun", actual: 420, predicted: 420 },
      { month: "Jul", actual: 420, predicted: 418 },
      { month: "Aug", actual: 420, predicted: 416 },
      { month: "Sep", actual: 420, predicted: 421 },
    ]
  },
  {
    id: "corn",
    name: "Yellow Corn (Maize)",
    currentPrice: 198.20,
    change: 4.8,
    volume: "24,800 MT",
    minPrice: 185.00,
    maxPrice: 202.00,
    grade: "Feed / Milling Grade",
    trendData: [
      { month: "Jan", actual: 182 },
      { month: "Feb", actual: 185 },
      { month: "Mar", actual: 188 },
      { month: "Apr", actual: 192 },
      { month: "May", actual: 195 },
      { month: "Jun", actual: 198, predicted: 198 },
      { month: "Jul", actual: 198, predicted: 204 },
      { month: "Aug", actual: 198, predicted: 209 },
      { month: "Sep", actual: 198, predicted: 212 },
    ]
  },
  {
    id: "soybeans",
    name: "Organic Soybeans",
    currentPrice: 512.00,
    change: 0.5,
    volume: "15,310 MT",
    minPrice: 502.00,
    maxPrice: 520.00,
    grade: "Non-GMO Grade I",
    trendData: [
      { month: "Jan", actual: 495 },
      { month: "Feb", actual: 502 },
      { month: "Mar", actual: 508 },
      { month: "Apr", actual: 510 },
      { month: "May", actual: 511 },
      { month: "Jun", actual: 512, predicted: 512 },
      { month: "Jul", actual: 512, predicted: 515 },
      { month: "Aug", actual: 512, predicted: 518 },
      { month: "Sep", actual: 512, predicted: 522 },
    ]
  },
  {
    id: "cotton",
    name: "Raw Upland Cotton",
    currentPrice: 310.80,
    change: -2.7,
    volume: "6,440 MT",
    minPrice: 305.00,
    maxPrice: 325.00,
    grade: "Strict Low Middling",
    trendData: [
      { month: "Jan", actual: 328 },
      { month: "Feb", actual: 324 },
      { month: "Mar", actual: 321 },
      { month: "Apr", actual: 318 },
      { month: "May", actual: 315 },
      { month: "Jun", actual: 310, predicted: 310 },
      { month: "Jul", actual: 310, predicted: 308 },
      { month: "Aug", actual: 310, predicted: 306 },
      { month: "Sep", actual: 310, predicted: 311 },
    ]
  }
];

export default function MarketPrices() {
  const [selectedCropId, setSelectedCropId] = useState<string>("wheat");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const selectedCrop = CROP_MARKETS.find(c => c.id === selectedCropId) || CROP_MARKETS[0];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="market-prices-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Global Agricultural Market Index
          </h3>
          <p className="text-xs text-slate-500">Live commodity price indicators & AI predictive crop trajectories</p>
        </div>

        <button
          onClick={handleRefresh}
          className={`p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition cursor-pointer ${
            refreshing ? "animate-spin" : ""
          }`}
          title="Refresh pricing logs"
          id="market-refresh-button"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Crop Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CROP_MARKETS.map((crop) => (
          <button
            key={crop.id}
            onClick={() => setSelectedCropId(crop.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
              selectedCropId === crop.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
            }`}
            id={`market-crop-tab-${crop.id}`}
          >
            {crop.name.split(" ")[0]}
            <span className={`text-[10px] font-bold ${crop.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {crop.change >= 0 ? `+${crop.change}%` : `${crop.change}%`}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60" id="stat-current-price">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Index Price</span>
          <span className="text-xl font-black text-slate-900 tracking-tight">${selectedCrop.currentPrice.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Per Metric Ton (USD)</span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60" id="stat-price-change">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">24h Trajectory</span>
          <div className="flex items-center gap-1.5">
            {selectedCrop.change >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-lg font-extrabold ${selectedCrop.change >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {selectedCrop.change >= 0 ? `+${selectedCrop.change}%` : `${selectedCrop.change}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Bullish sentiment index</span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60" id="stat-daily-limits">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Spread range</span>
          <span className="text-xs font-bold text-slate-700 block">
            Min: <span className="font-extrabold text-slate-900">${selectedCrop.minPrice}</span>
          </span>
          <span className="text-xs font-bold text-slate-700 block">
            Max: <span className="font-extrabold text-slate-900">${selectedCrop.maxPrice}</span>
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60" id="stat-grade-spec">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Standards Spec</span>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mb-1">
            {selectedCrop.grade}
          </span>
          <span className="text-[10px] text-slate-400 block">Volume: {selectedCrop.volume}</span>
        </div>
      </div>

      {/* Area Chart visualization */}
      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4" id="market-chart-container">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Market History & AI Predicted Trend (Next 3 Months)
          </h4>
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
            Predictive Model Loaded
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={selectedCrop.trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{ background: "#1e293b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Historical Rate"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorPredicted)"
                name="AI Forecast Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3" id="market-disclaimer">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-normal">
          <strong>Planning Advisory:</strong> Projected agricultural forecasts take into account current international stockpiles, regional drought indices, and sowing delays. Always seek locally regulated grain elevator guidelines before completing locking-forward agreements.
        </p>
      </div>
    </div>
  );
}
