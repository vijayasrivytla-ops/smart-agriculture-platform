import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudLightning,
  Wind,
  Droplets,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Thermometer,
  Calendar,
  AlertTriangle,
  FileText,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { FarmerProfile } from "../types";

interface LiveWeatherAppProps {
  profile: FarmerProfile;
}

interface WeatherAppDetails {
  temp: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  locationName: string;
  lat: number;
  lon: number;
  currentCode: number;
  uvIndex: number;
  precipitationToday: number;
  evapotranspiration: number; // estimated or mock
  dewPoint: number; // estimated
  soilTemp: number; // estimated
  forecast: {
    day: string;
    maxTemp: number;
    minTemp: number;
    precip: number;
    uv: number;
    code: number;
    conditionName: string;
  }[];
}

interface AIAdvisory {
  sowingStatus: string;
  sowingAdvice: string;
  sprayingStatus: string;
  sprayingAdvice: string;
  harvestingStatus: string;
  harvestingAdvice: string;
  diseaseRisk: string;
  pestForecast: string;
  irrigationAlert: string;
  generalSummary: string;
}

const PRESET_FARMS = [
  { name: "Des Moines, Iowa (Corn Belt)", lat: 41.5868, lon: -93.6250, crop: "Corn & Soybeans" },
  { name: "Punjab, India (Granary)", lat: 31.1471, lon: 75.3412, crop: "Wheat & Basmati Rice" },
  { name: "Saskatchewan, Canada (Canola Fields)", lat: 52.9399, lon: -106.4509, crop: "Canola & Wheat" },
  { name: "Nairobi, Kenya (Coffee Highlands)", lat: -1.2921, lon: 36.8219, crop: "Coffee & Tea" },
  { name: "Mato Grosso, Brazil (Soy Basin)", lat: -12.6819, lon: -56.9211, crop: "Soybeans & Maize" },
];

export default function LiveWeatherApp({ profile }: LiveWeatherAppProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [weather, setWeather] = useState<WeatherAppDetails | null>(null);
  const [customSearch, setCustomSearch] = useState<string>("");
  const [activePreset, setActivePreset] = useState<number>(1); // Default Punjab
  const [chartView, setChartView] = useState<"temp" | "rain">("temp");

  // AI Advisory States
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAdvisory, setAiAdvisory] = useState<AIAdvisory | null>(null);
  const [aiError, setAiError] = useState<string>("");

  useEffect(() => {
    const selected = PRESET_FARMS[activePreset];
    fetchWeatherData(selected.lat, selected.lon, selected.name);
  }, [activePreset]);

  // Handle Geolocation
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setErrorMsg("");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude, "Your Current Coordinates");
          setActivePreset(-1);
        },
        (err) => {
          console.warn("Geolocation access denied:", err);
          setErrorMsg("Could not fetch current coordinates. Defaulting to Punjab, India.");
          // fallback
          setActivePreset(1);
        }
      );
    } else {
      setErrorMsg("Geolocation not supported by browser.");
    }
  };

  const fetchWeatherData = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setErrorMsg("");
    setAiAdvisory(null); // Reset advisor when location changes
    try {
      const url = `/api/weather?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Upstream weather service returned error status");
      const data = await res.json();

      const current = data.current_weather;
      if (!current) throw new Error("Meteorological parameters are missing in source data");

      const mappedCondition = mapWeatherCode(current.weathercode);
      
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const forecastList = (data.daily?.time || []).slice(0, 5).map((timeStr: string, idx: number) => {
        const d = new Date(timeStr);
        const dayName = days[d.getDay()];
        const maxT = Math.round(data.daily.temperature_2m_max[idx]);
        const minT = Math.round(data.daily.temperature_2m_min[idx]);
        const precip = data.daily.precipitation_sum ? Number(data.daily.precipitation_sum[idx]) : 0;
        const uv = data.daily.uv_index_max ? Number(data.daily.uv_index_max[idx]) : 3;
        const code = data.daily.weathercode[idx];

        return {
          day: idx === 0 ? "Today" : dayName,
          maxTemp: maxT,
          minTemp: minT,
          precip: Number(precip.toFixed(1)),
          uv: Number(uv.toFixed(1)),
          code: code,
          conditionName: mapWeatherCode(code)
        };
      });

      // Evapotranspiration estimate, Dewpoint estimate, Soil Temp estimate
      const mockEvapo = Number((2.5 + (current.temperature / 12) + (current.windspeed / 25)).toFixed(1));
      const mockDew = Math.round(current.temperature - ((100 - 65) / 5)); // simple estimation formula
      const mockSoil = Math.round(current.temperature - 1.5);

      setWeather({
        temp: Math.round(current.temperature),
        windSpeed: current.windspeed,
        humidity: 68, // standard farm humidity
        condition: mappedCondition,
        locationName: name,
        lat: lat,
        lon: lon,
        currentCode: current.weathercode,
        uvIndex: data.daily?.uv_index_max ? Number(data.daily.uv_index_max[0]) : 5,
        precipitationToday: data.daily?.precipitation_sum ? Number(data.daily.precipitation_sum[0]) : 0,
        evapotranspiration: mockEvapo,
        dewPoint: mockDew,
        soilTemp: mockSoil,
        forecast: forecastList
      });
    } catch (err: any) {
      console.error("Error loading weather details:", err);
      setErrorMsg(err.message || "Unable to load live weather. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setAiAdvisory(null);

    try {
      const geoUrl = `/api/weather/search?name=${encodeURIComponent(customSearch)}`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Geocoding coordinates retrieval failed");
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location "${customSearch}" was not recognized.`);
      }

      const result = geoData.results[0];
      const displayName = `${result.name}, ${result.admin1 || ""} (${result.country})`;
      await fetchWeatherData(result.latitude, result.longitude, displayName);
      setActivePreset(-1); // custom active
    } catch (err: any) {
      console.warn("Geocoding issue:", err);
      setErrorMsg(err.message || "Failed to find location.");
      setLoading(false);
    }
  };

  const handleGenerateAIAdvisory = async () => {
    if (!weather) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/weather-advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp: weather.temp,
          condition: weather.condition,
          windSpeed: weather.windSpeed,
          humidity: weather.humidity,
          location: weather.locationName,
          cropInterest: profile.mainCrops || "General Agriculture"
        })
      });

      if (!res.ok) {
        throw new Error("AI Advisor failed to compile briefing.");
      }

      const data = await res.json();
      setAiAdvisory(data);
    } catch (err: any) {
      console.error(err);
      setAiError("Failed to generate custom agrometeorology briefing. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const mapWeatherCode = (code: number): string => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Light Drizzle";
    if (code >= 61 && code <= 65) return "Rain Showers";
    if (code >= 71 && code <= 77) return "Snowfall";
    if (code >= 80 && code <= 82) return "Heavy Rain";
    if (code >= 95 && code <= 99) return "Thunderstorms";
    return "Overcast";
  };

  const getWeatherIcon = (code: number, className = "w-10 h-10") => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-emerald-100/80`} />;
    if (code >= 45 && code <= 48) return <Cloud className={`${className} text-slate-300`} />;
    if (code >= 51 && code <= 65) return <CloudRain className={`${className} text-teal-400`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-rose-500 animate-pulse`} />;
    return <Cloud className={`${className} text-slate-400`} />;
  };

  // Helper status color functions
  const getBadgeClass = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("optimal") || s.includes("safe") || s.includes("low")) {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
    if (s.includes("fair") || s.includes("caution") || s.includes("medium") || s.includes("sub-optimal")) {
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    }
    return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
  };

  // Sowing suitability rating based on simple logic
  const calculateSowingIndex = (temp: number, currentCode: number) => {
    if (currentCode >= 80) return { label: "Avoid (Heavy Rain)", color: "text-rose-400 bg-rose-500/10 border border-rose-500/20" };
    if (temp > 38) return { label: "Poor (Extreme Heat)", color: "text-amber-400 bg-amber-500/10 border border-amber-500/20" };
    if (temp < 10) return { label: "Sub-optimal (Low Soil Temp)", color: "text-blue-400 bg-blue-500/10 border border-blue-500/20" };
    return { label: "Highly Optimal", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" };
  };

  return (
    <div className="space-y-6" id="live-weather-application">
      {/* Search Header Banner */}
      <div className="bg-[#122E23] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6" id="weather-banner-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#94C973]/10 text-[#94C973] rounded-lg">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">Live Precision Weather Hub</h2>
          </div>
          <p className="text-xs text-white/60 max-w-xl">
            Sowing index modeling, soil heat indices, and customized agrometeorology recommendations powered by deep neural micro-forecasts.
          </p>
        </div>

        {/* Searching input */}
        <div className="flex flex-col sm:flex-row gap-2 max-w-md w-full shrink-0">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search farm city or region..."
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94C973] bg-black/30 text-white placeholder-white/30 transition shadow-sm"
                id="app-weather-search"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#94C973] hover:bg-[#a8db87] text-[#0A1F16] rounded-xl text-xs font-black cursor-pointer transition shadow-sm"
              id="app-weather-search-btn"
            >
              Search
            </button>
          </form>
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl cursor-pointer transition"
            title="Use current GPS location"
          >
            <Compass className="w-4 h-4 text-[#94C973]" />
            <span className="sm:hidden lg:inline">GPS</span>
          </button>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10" id="farm-location-presets">
        {PRESET_FARMS.map((farm, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActivePreset(idx);
              setCustomSearch("");
            }}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold border cursor-pointer whitespace-nowrap transition-all ${
              activePreset === idx && !customSearch
                ? "bg-[#94C973] text-[#0A1F16] border-[#94C973] shadow-md"
                : "bg-[#122E23] text-white/70 border-white/5 hover:bg-[#1a3d30] hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <div>
              <span className="block leading-none text-left">{farm.name.split(",")[0]}</span>
              <span className="block text-[8px] opacity-60 font-medium text-left mt-0.5">{farm.crop}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Error View */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-xs text-red-300 font-semibold">{errorMsg}</p>
          <button
            onClick={() => {
              if (activePreset >= 0) {
                fetchWeatherData(PRESET_FARMS[activePreset].lat, PRESET_FARMS[activePreset].lon, PRESET_FARMS[activePreset].name);
              } else {
                setActivePreset(1);
              }
            }}
            className="px-4 py-1.5 bg-[#94C973] text-[#0A1F16] text-[11px] font-bold rounded-lg cursor-pointer hover:bg-[#a8db87]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#122E23] border border-white/5 rounded-3xl animate-pulse">
          <Cloud className="w-16 h-16 text-[#94C973] animate-bounce mb-3" />
          <p className="text-xs text-white/70 font-semibold">Contacting spatial micro-atmosphere radar layers...</p>
          <p className="text-[10px] text-white/40 mt-1">Downloading satellite matrices and humidity vectors</p>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-weather-panels">
          {/* LEFT COLUMN: Main Weather Stats & Secondary Indicators */}
          <div className="lg:col-span-4 space-y-6">
            {/* Current Large Card */}
            <div className="bg-[#122E23] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#94C973]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-white/60">
                  <MapPin className="w-3.5 h-3.5 text-[#94C973]" />
                  <span className="text-xs font-bold truncate max-w-[220px]" title={weather.locationName}>
                    {weather.locationName}
                  </span>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <span className="text-6xl font-black tracking-tighter text-white leading-none">
                    {weather.temp}
                  </span>
                  <span className="text-2xl font-black text-[#94C973] mt-1">°C</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white bg-white/10 px-3 py-1 rounded-full border border-white/5 shadow-xs">
                    {weather.condition}
                  </span>
                  {weather.precipitationToday > 0 && (
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/15">
                      🌧️ {weather.precipitationToday} mm rain
                    </span>
                  )}
                </div>
              </div>

              {/* Icon & Sowing Info Footer */}
              <div className="flex items-end justify-between pt-8 border-t border-white/5 mt-6">
                <div>
                  <span className="text-[9px] font-bold text-white/40 uppercase block">Soil Sowing Window</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mt-1 ${calculateSowingIndex(weather.temp, weather.currentCode).color}`}>
                    {calculateSowingIndex(weather.temp, weather.currentCode).label}
                  </span>
                </div>
                <div className="p-2 bg-white/5 rounded-2xl border border-white/10">
                  {getWeatherIcon(weather.currentCode, "w-16 h-16 drop-shadow-xl")}
                </div>
              </div>
            </div>

            {/* Advanced Agro-Meteorology Indices Grid */}
            <div className="bg-[#122E23] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-black tracking-wider uppercase text-white/40 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#94C973]" />
                Advanced Agro-Indices
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-white/40 leading-none">Soil Temp</span>
                  <span className="text-sm font-black text-white mt-2 mb-0.5">{weather.soilTemp} °C</span>
                  <span className="text-[9px] text-[#94C973] font-semibold">10cm depth index</span>
                </div>

                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-white/40 leading-none">Reference ET0</span>
                  <span className="text-sm font-black text-white mt-2 mb-0.5">{weather.evapotranspiration} mm/d</span>
                  <span className="text-[9px] text-white/50 font-semibold">Evapotranspiration</span>
                </div>

                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-white/40 leading-none">Dew Point</span>
                  <span className="text-sm font-black text-white mt-2 mb-0.5">{weather.dewPoint} °C</span>
                  <span className="text-[9px] text-teal-400 font-semibold">Condensation point</span>
                </div>

                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-white/40 leading-none">Max UV Index</span>
                  <span className="text-sm font-black text-white mt-2 mb-0.5">{weather.uvIndex}</span>
                  <span className={`text-[9px] font-bold ${weather.uvIndex > 7 ? "text-rose-400" : "text-amber-400"}`}>
                    {weather.uvIndex > 7 ? "Extreme Exposure" : "Moderate Index"}
                  </span>
                </div>
              </div>

              {/* Humidity & Wind Speed Horizontal Panel */}
              <div className="border-t border-white/5 pt-3.5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 font-bold block">Rel. Humidity</span>
                    <strong className="text-xs text-white block">{weather.humidity}%</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#94C973]/10 text-[#94C973] rounded-xl">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 font-bold block">Wind Speed</span>
                    <strong className="text-xs text-white block">{weather.windSpeed} km/h</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Agricultural Weather Advisor & Recharts Graphs */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI-Powered Agronomy Weather Advisor */}
            <div className="bg-gradient-to-br from-[#122E23] to-[#0A1F16] border border-[#94C973]/20 rounded-3xl p-6 shadow-xl space-y-5" id="ai-weather-advisor-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#94C973] animate-pulse" />
                    AI Agrometeorology Advisor
                  </h3>
                  <p className="text-xs text-white/60">
                    Get customized crop guidelines and weather risk analysis compiled instantly for <strong className="text-white">{profile.mainCrops || "General Farming"}</strong>.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAIAdvisory}
                  disabled={aiLoading}
                  className="px-4 py-2.5 bg-[#94C973] hover:bg-[#a8db87] disabled:bg-[#94C973]/40 disabled:text-white/40 text-[#0A1F16] rounded-xl text-xs font-black cursor-pointer transition shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  {aiLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Analyzing Fields...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Weather Advisory
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-xs text-red-300">
                  {aiError}
                </div>
              )}

              {/* Advisor Insights Display */}
              {!aiAdvisory && !aiLoading && (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl bg-black/10">
                  <BookOpen className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-xs text-white/50">No crop advisory compiled yet for {weather.locationName}.</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Click the button above to generate a customized AI weather advisory briefing.</p>
                </div>
              )}

              {aiLoading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-black/10 border border-dashed border-white/10 rounded-2xl">
                  <div className="w-8 h-8 border-4 border-[#94C973] border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-[#94C973] animate-pulse">Consulting Kisan Neural Advisory Indices...</p>
                    <p className="text-[10px] text-white/40">Calculating spraying thresholds, dew point ratios, and pest infection cycles.</p>
                  </div>
                </div>
              )}

              {aiAdvisory && !aiLoading && (
                <div className="space-y-4 animate-fade-in" id="ai-advisor-results">
                  {/* Grid of status boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-black/15 p-3.5 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-white/40">Sowing / Planting</span>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${getBadgeClass(aiAdvisory.sowingStatus)}`}>
                          {aiAdvisory.sowingStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{aiAdvisory.sowingAdvice}</p>
                    </div>

                    <div className="bg-black/15 p-3.5 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-white/40">Chemical Spraying</span>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${getBadgeClass(aiAdvisory.sprayingStatus)}`}>
                          {aiAdvisory.sprayingStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{aiAdvisory.sprayingAdvice}</p>
                    </div>

                    <div className="bg-black/15 p-3.5 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-white/40">Harvesting Outlook</span>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${getBadgeClass(aiAdvisory.harvestingStatus)}`}>
                          {aiAdvisory.harvestingStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{aiAdvisory.harvestingAdvice}</p>
                    </div>
                  </div>

                  {/* Secondary insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-extrabold text-[#94C973] tracking-wide block">Disease & Pest Risk Matrix</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        <strong className="text-white">Pathogen Risk: {aiAdvisory.diseaseRisk}.</strong> {aiAdvisory.pestForecast}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-extrabold text-[#94C973] tracking-wide block">Irrigation & Soil Moisture Action</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {aiAdvisory.irrigationAlert}
                      </p>
                    </div>
                  </div>

                  {/* General Summary Briefing */}
                  <div className="bg-[#94C973]/10 border border-[#94C973]/20 p-3 rounded-xl mt-1 flex items-start gap-2.5">
                    <FileText className="w-4.5 h-4.5 text-[#94C973] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-[#94C973]">Daily Agro-Advisory Briefing</span>
                      <p className="text-[11px] text-[#94C973] font-semibold leading-relaxed mt-0.5">
                        {aiAdvisory.generalSummary}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Trends: Recharts Graphs Card */}
            <div className="bg-[#122E23] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4" id="weather-charts-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4.5 h-4.5 text-[#94C973]" />
                    5-Day Microclimate Outlook
                  </h3>
                  <p className="text-[11px] text-white/60">Trend analytics for thermal oscillation and moisture deposit sums.</p>
                </div>

                {/* Chart Toggles */}
                <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/5">
                  <button
                    onClick={() => setChartView("temp")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition ${
                      chartView === "temp" ? "bg-[#94C973] text-[#0A1F16]" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Temperature
                  </button>
                  <button
                    onClick={() => setChartView("rain")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition ${
                      chartView === "rain" ? "bg-[#94C973] text-[#0A1F16]" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Rain Trend
                  </button>
                </div>
              </div>

              {/* Render Rechart */}
              <div className="h-64 w-full bg-black/10 rounded-2xl p-4 border border-white/5" id="weather-trends-recharts-container">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "temp" ? (
                    <AreaChart data={weather.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} tickLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} unit="°" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#122E23", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "bold" }}
                        itemStyle={{ color: "#ffffff", fontSize: "11px" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Area name="Max Temp (°C)" type="monotone" dataKey="maxTemp" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMax)" />
                      <Area name="Min Temp (°C)" type="monotone" dataKey="minTemp" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMin)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={weather.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} tickLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} unit="mm" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#122E23", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "bold" }}
                        itemStyle={{ color: "#ffffff", fontSize: "11px" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="square" wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar name="Rainfall Sum (mm)" dataKey="precip" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Day Cards for Outlook */}
              <div className="grid grid-cols-5 gap-2 border-t border-white/5 pt-4">
                {weather.forecast.map((fc, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center py-3.5 px-2 rounded-2xl border text-center transition-all ${
                      i === 0
                        ? "bg-[#94C973]/10 border-[#94C973]/30"
                        : "bg-black/10 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <span className="text-[10px] font-black text-white/50 block mb-1">{fc.day}</span>
                    <div className="my-1.5">{getWeatherIcon(fc.code, "w-8 h-8")}</div>
                    <span className="text-[10px] font-extrabold text-white block">
                      {fc.maxTemp}° / {fc.minTemp}°
                    </span>
                    <span className="text-[8px] font-bold text-[#38bdf8] block mt-1" title="Precipitation">
                      {fc.precip > 0 ? `🌧️ ${fc.precip}mm` : "No rain"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
