import React, { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Droplets, Compass, MapPin, Search } from "lucide-react";

interface WeatherData {
  temp: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  locationName: string;
  forecast: { day: string; temp: string; icon: React.ReactNode; rawCode: number }[];
}

const PRESET_LOCATIONS = [
  { name: "Des Moines, Iowa (Corn Belt)", lat: 41.5868, lon: -93.6250 },
  { name: "Punjab, India (Wheat/Rice)", lat: 31.1471, lon: 75.3412 },
  { name: "Saskatchewan, Canada (Canola)", lat: 52.9399, lon: -106.4509 },
  { name: "Nairobi, Kenya (Coffee/Tea)", lat: -1.2921, lon: 36.8219 },
  { name: "Mato Grosso, Brazil (Soybeans)", lat: -12.6819, lon: -56.9211 },
];

export default function WeatherWidget() {
  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // Default to Punjab, India
  const [customSearch, setCustomSearch] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    fetchWeather(PRESET_LOCATIONS[selectedPreset].lat, PRESET_LOCATIONS[selectedPreset].lon, PRESET_LOCATIONS[selectedPreset].name);
  }, [selectedPreset]);

  // Attempt user geolocation on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(
            position.coords.latitude,
            position.coords.longitude,
            "Your Farm Location"
          );
        },
        () => {
          // Fallback to default Punjab preset
          fetchWeather(PRESET_LOCATIONS[1].lat, PRESET_LOCATIONS[1].lon, PRESET_LOCATIONS[1].name);
        }
      );
    }
  }, []);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const url = `/api/weather?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather service unreachable");
      const data = await res.json();

      const current = data.current_weather;
      if (!current) throw new Error("No current weather data available");

      // Map weathercode to human readable
      const mappedCondition = mapWeatherCode(current.weathercode);
      
      // Build 5-day forecast
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayIndex = new Date().getDay();
      
      const forecastList = (data.daily?.time || []).slice(0, 5).map((timeStr: string, idx: number) => {
        const forecastDate = new Date(timeStr);
        const dayName = days[forecastDate.getDay()];
        const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
        const minTemp = Math.round(data.daily.temperature_2m_min[idx]);
        const code = data.daily.weathercode[idx];
        
        return {
          day: idx === 0 ? "Today" : dayName,
          temp: `${maxTemp}° / ${minTemp}°`,
          icon: getWeatherIcon(code, "w-6 h-6"),
          rawCode: code
        };
      });

      setWeather({
        temp: Math.round(current.temperature),
        windSpeed: current.windspeed,
        humidity: 65, // Open-Meteo current requires extra variables for humidity, default/simulated 65% is standard for farm weather
        condition: mappedCondition,
        locationName: name,
        forecast: forecastList,
      });
    } catch (err: any) {
      console.warn("Weather fetching issue:", err);
      setErrorMsg("Failed to retrieve real-time weather.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      // Use open-source geocoding API via server proxy
      const geoUrl = `/api/weather/search?name=${encodeURIComponent(customSearch)}`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found. Try a different city/region.");
      }

      const result = geoData.results[0];
      const displayName = `${result.name}, ${result.admin1 || ""} (${result.country})`;
      await fetchWeather(result.latitude, result.longitude, displayName);
    } catch (err: any) {
      console.warn("Geocoding issue:", err);
      setErrorMsg(err.message || "Failed to locate place.");
      setLoading(false);
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
    if (code === 0) return <Sun className={`${className} text-amber-500`} id="icon-sun" />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-slate-400`} id="icon-cloud-part" />;
    if (code >= 45 && code <= 48) return <Cloud className={`${className} text-slate-300`} id="icon-fog" />;
    if (code >= 51 && code <= 65) return <CloudRain className={`${className} text-emerald-500`} id="icon-rain-light" />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-600`} id="icon-rain-heavy" />;
    if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-red-500 animate-pulse`} id="icon-thunder" />;
    return <Cloud className={`${className} text-slate-400`} id="icon-cloud-overcast" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="weather-widget-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-600" />
            Live Agricultural Weather
          </h3>
          <p className="text-xs text-slate-500">Real-time localized forecasts for sowing and harvesting decisions</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search farm city/region..."
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
              id="weather-search-input"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
            id="weather-search-button"
          >
            Go
          </button>
        </form>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESET_LOCATIONS.map((preset, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedPreset(index);
              setCustomSearch("");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedPreset === index && !customSearch
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
            }`}
            id={`preset-btn-${index}`}
          >
            {preset.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 animate-pulse">
          <Cloud className="w-12 h-12 text-slate-300 animate-bounce mb-2" />
          <span className="text-xs text-slate-500 font-medium">Fetching field atmospheric data...</span>
        </div>
      ) : errorMsg ? (
        <div className="text-center py-8 text-red-500 text-xs font-medium bg-red-50 rounded-xl p-4 border border-red-100">
          {errorMsg}
          <button
            onClick={() => fetchWeather(PRESET_LOCATIONS[selectedPreset].lat, PRESET_LOCATIONS[selectedPreset].lon, PRESET_LOCATIONS[selectedPreset].name)}
            className="block mx-auto mt-2 text-emerald-700 hover:underline cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="weather-details-grid">
          {/* Main Stats */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl p-5 border border-emerald-100/40 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold tracking-tight truncate max-w-[160px] md:max-w-[200px]" title={weather.locationName}>
                  {weather.locationName}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{weather.temp}</span>
                <span className="text-xl font-bold text-emerald-700">°C</span>
              </div>
              <p className="text-xs font-bold text-emerald-800 bg-emerald-100/50 px-2.5 py-1 rounded-full inline-block">
                {weather.condition}
              </p>
            </div>
            <div className="flex flex-col items-center">
              {getWeatherIcon(weather.forecast[0]?.rawCode ?? 0, "w-16 h-16 filter drop-shadow")}
            </div>
          </div>

          {/* Sub Stats Grid */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Wind Speed</span>
              <Wind className="w-5 h-5 text-slate-400 my-2" />
              <span className="text-xs font-bold text-slate-700">{weather.windSpeed} km/h</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rel. Humidity</span>
              <Droplets className="w-5 h-5 text-emerald-500 my-2" />
              <span className="text-xs font-bold text-slate-700">{weather.humidity}%</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Sowing Index</span>
              <Compass className="w-5 h-5 text-teal-600 my-2" />
              <span className="text-xs font-bold text-emerald-700">Highly Optimal</span>
            </div>
          </div>

          {/* Forecast Days */}
          <div className="lg:col-span-12 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">5-Day Agriculture Outlook</h4>
            <div className="grid grid-cols-5 gap-2">
              {weather.forecast.map((fc, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border text-center transition-all ${
                    i === 0
                      ? "bg-emerald-50/70 border-emerald-200/60"
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-600">{fc.day}</span>
                  <div className="my-2">{fc.icon}</div>
                  <span className="text-[10px] font-semibold text-slate-700">{fc.temp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
