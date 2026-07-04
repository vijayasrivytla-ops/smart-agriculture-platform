import React, { useState } from "react";
import { User, MapPin, Landmark, Sprout, Check, X, HelpCircle, Info } from "lucide-react";
import { FarmerProfile } from "../types";

interface FarmerProfileModalProps {
  profile: FarmerProfile;
  onSave: (p: FarmerProfile) => void;
  onClose: () => void;
}

export default function FarmerProfileModal({ profile, onSave, onClose }: FarmerProfileModalProps) {
  const [name, setName] = useState<string>(profile.name);
  const [farmName, setFarmName] = useState<string>(profile.farmName);
  const [location, setLocation] = useState<string>(profile.location);
  const [mainCrops, setMainCrops] = useState<string>(profile.mainCrops);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || "Farmer Friend",
      farmName: farmName.trim() || "Sunrise Farms",
      location: location.trim() || "Punjab, India",
      mainCrops: mainCrops.trim() || "Wheat, Rice"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="farmer-profile-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Configure Farmer Profile</h3>
              <p className="text-[10px] text-emerald-200">Personalize your cloud agricultural ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farmer Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Ramesh Singh, John Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="profile-name-input"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farm Name</label>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Green Valley Farm"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="profile-farm-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Geographic Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Iowa, USA or Punjab, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="profile-location-input"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Main Crops Cultivated</label>
            <div className="relative">
              <Sprout className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Corn, Soybeans, Wheat"
                value={mainCrops}
                onChange={(e) => setMainCrops(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="profile-crops-input"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 flex gap-2 text-[10px] text-emerald-800 leading-relaxed">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              Your profile values are cached in local browser storage and used to securely tag plant pathology diagnoses, yield predictive summaries, and forum postings.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 transition"
            id="profile-save-btn"
          >
            <Check className="w-4 h-4" />
            Apply Profile Settings
          </button>
        </form>
      </div>
    </div>
  );
}
