import React, { useState, useEffect } from "react";
import { Sprout, BarChart3, Camera, FlaskConical, MessageSquare, Settings, User, Sliders, ChevronRight, CheckCircle, Sparkles, MapPin, Landmark } from "lucide-react";
import WeatherWidget from "./components/WeatherWidget";
import MarketPrices from "./components/MarketPrices";
import CropDiseaseScanner from "./components/CropDiseaseScanner";
import YieldPredictor from "./components/YieldPredictor";
import SoilAnalyst from "./components/SoilAnalyst";
import CommunityForum from "./components/CommunityForum";
import FarmerProfileModal from "./components/FarmerProfileModal";
import MultilingualAssistant from "./components/MultilingualAssistant";
import LiveWeatherApp from "./components/LiveWeatherApp";
import { FarmerProfile } from "./types";
import { TRANSLATIONS, LANGUAGES } from "./translations";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profile, setProfile] = useState<FarmerProfile>({
    name: "Kisan Dev",
    farmName: "Sunrise Agritech Farms",
    location: "Punjab, India",
    mainCrops: "Wheat, Basmati Rice"
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return sessionStorage.getItem("kisan_ai_lang") || "English";
  });

  // Load profile from local storage on load
  useEffect(() => {
    const saved = localStorage.getItem("farmer_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved profile:", err);
      }
    }
  }, []);

  const handleSaveProfile = (updatedProfile: FarmerProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("farmer_profile", JSON.stringify(updatedProfile));
  };

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
    sessionStorage.setItem("kisan_ai_lang", code);
  };

  // Helper function to fetch localized translations
  const t = (key: keyof typeof TRANSLATIONS.English): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.English;
    return dict[key] || TRANSLATIONS.English[key];
  };

  return (
    <div className="min-h-screen bg-[#0A1F16] text-white flex flex-col font-sans" id="smart-agri-app">
      {/* Dynamic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0A1F16]/90 backdrop-blur-md border-b border-white/10 shadow-lg" id="app-navbar">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#94C973] rounded-xl flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5 text-[#0A1F16] animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#94C973] bg-[#94C973]/10 px-2 py-0.5 rounded-full border border-[#94C973]/20">
                {t("tagline")}
              </span>
              <h1 className="text-sm font-black text-white tracking-tight leading-none mt-0.5">
                {t("appName")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Elegant Global Language Selector Dropdown */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-2.5 py-1.5 hover:bg-white/10 transition cursor-pointer" id="global-language-dropdown">
              <span className="text-[10px] uppercase font-extrabold text-white/50 mr-1.5 hidden md:inline">{t("changeLang")}:</span>
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs bg-transparent border-none text-white font-extrabold focus:outline-none cursor-pointer pr-1"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#0A1F16] text-white font-medium">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick profile pill */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition text-left"
              id="navbar-profile-trigger"
            >
              <div className="p-1 bg-[#94C973]/20 text-[#94C973] rounded-lg shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-xs">
                <span className="font-extrabold text-white block line-clamp-1 leading-none">{profile.name}</span>
                <span className="text-[10px] text-white/40 font-semibold flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#94C973]" />
                  {profile.location}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Interactive Banner */}
      <div className="bg-[#122E23] border-b border-white/5" id="app-hero-banner">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              <Sparkles className="w-5.5 h-5.5 text-[#94C973] animate-pulse shrink-0" />
              {t("heroHeading")}
            </h2>
            <p className="text-xs text-white/60 max-w-xl leading-relaxed">
              {t("heroSubheading")}
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5" id="tabs-navigation-pills">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "dashboard"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("dashboard")}
            </button>
            <button
              onClick={() => setActiveTab("pathology")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "pathology"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("cropPathology")}
            </button>
            <button
              onClick={() => setActiveTab("yield")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "yield"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("yieldPredictions")}
            </button>
            <button
              onClick={() => setActiveTab("soil")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "soil"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("soilHealth")}
            </button>
            <button
              onClick={() => setActiveTab("weather")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "weather"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("liveWeather")}
            </button>
            <button
              onClick={() => setActiveTab("forum")}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                activeTab === "forum"
                  ? "bg-[#94C973] text-[#0A1F16] shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("qaForum")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8" id="main-content-section">
        {activeTab === "dashboard" && (
          <div className="space-y-6" id="dashboard-tab-view">
            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-quick-actions">
              <div
                onClick={() => setActiveTab("pathology")}
                className="bg-[#122E23] hover:bg-[#1a3d30] border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-[#94C973]/10 text-[#94C973] rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-snug">{t("scannerCardTitle")}</h4>
                    <p className="text-[10px] text-white/50 mt-1 leading-normal">{t("scannerCardDesc")}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94C973] font-extrabold flex items-center gap-0.5 mt-4">
                  {t("scannerCardAction")} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("yield")}
                className="bg-[#122E23] hover:bg-[#1a3d30] border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-[#94C973]/10 text-[#94C973] rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-snug">{t("yieldCardTitle")}</h4>
                    <p className="text-[10px] text-white/50 mt-1 leading-normal">{t("yieldCardDesc")}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94C973] font-extrabold flex items-center gap-0.5 mt-4">
                  {t("yieldCardAction")} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("soil")}
                className="bg-[#122E23] hover:bg-[#1a3d30] border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-[#94C973]/10 text-[#94C973] rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-snug">{t("soilCardTitle")}</h4>
                    <p className="text-[10px] text-white/50 mt-1 leading-normal">{t("soilCardDesc")}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94C973] font-extrabold flex items-center gap-0.5 mt-4">
                  {t("soilCardAction")} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("forum")}
                className="bg-[#122E23] hover:bg-[#1a3d30] border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-[#94C973]/10 text-[#94C973] rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-snug">{t("forumCardTitle")}</h4>
                    <p className="text-[10px] text-white/50 mt-1 leading-normal">{t("forumCardDesc")}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94C973] font-extrabold flex items-center gap-0.5 mt-4">
                  {t("forumCardAction")} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Farm specific metrics / Location banner */}
            <div className="bg-[#122E23] text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5" id="farm-meta-banner">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-[#94C973] tracking-wider">{t("activeLedger")}</span>
                <h3 className="text-base font-black leading-tight flex items-center gap-1">
                  <Landmark className="w-4 h-4 text-[#94C973]" />
                  {profile.farmName || "Sunrise Agritech Farms"}
                </h3>
                <p className="text-xs text-white/70">
                  {t("mainCropInterest")}: <strong className="font-extrabold text-white">{profile.mainCrops}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-2 bg-[#94C973] hover:bg-[#a8db87] text-[#0A1F16] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {t("modifyLedger")}
              </button>
            </div>

            {/* Bento block 2: Weather & Market Prices side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="weather-market-bento">
              <div className="lg:col-span-5">
                <WeatherWidget />
              </div>
              <div className="lg:col-span-7">
                <MarketPrices />
              </div>
            </div>
          </div>
        )}

        {activeTab === "pathology" && (
          <CropDiseaseScanner profile={profile} />
        )}

        {activeTab === "yield" && (
          <YieldPredictor profile={profile} />
        )}

        {activeTab === "soil" && (
          <SoilAnalyst profile={profile} />
        )}

        {activeTab === "weather" && (
          <LiveWeatherApp profile={profile} />
        )}

        {activeTab === "forum" && (
          <CommunityForum profile={profile} />
        )}
      </main>

      {/* Dynamic Profile config drawer modal */}
      {isProfileOpen && (
        <FarmerProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Global AI Multilingual Assistant & Chatbot */}
      <MultilingualAssistant
        profile={profile}
        languageCode={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />

      {/* Elegant minimalist footer */}
      <footer className="bg-[#122E23] border-t border-white/5 text-white/40 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <p>© 2026 Smart Agriculture Precision Portal. Cloud Firestore Database Active.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#94C973] cursor-pointer">Security Rules Audited</span>
            <span className="hover:text-[#94C973] cursor-pointer">Kisan Neural Indices</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
