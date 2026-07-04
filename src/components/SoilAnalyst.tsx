import React, { useState, useEffect } from "react";
import { FlaskConical, Droplets, ArrowRight, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, History, Sparkles, Trash2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { SoilResult, FarmerProfile } from "../types";

interface SoilAnalystProps {
  profile: FarmerProfile;
}

const SOIL_TYPES = ["Sandy Soil", "Clay Soil", "Silt Soil", "Peat Soil", "Chalky Soil", "Loam Soil (Optimal)"];

export default function SoilAnalyst({ profile }: SoilAnalystProps) {
  const [nitrogen, setNitrogen] = useState<number>(45);
  const [phosphorus, setPhosphorus] = useState<number>(22);
  const [potassium, setPotassium] = useState<number>(140);
  const [ph, setPh] = useState<number>(6.5);
  const [moisture, setMoisture] = useState<number>(35);
  const [soilType, setSoilType] = useState<string>("Loam Soil (Optimal)");
  const [cropIntention, setCropIntention] = useState<string>(profile.mainCrops || "Wheat, Corn");

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>( "");

  // Soil history
  const [history, setHistory] = useState<SoilResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const collectionPath = "soil_analyses";
    try {
      const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const docsList: SoilResult[] = [];
      querySnapshot.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() } as SoilResult);
      });
      setHistory(docsList);
    } catch (err) {
      console.error("Error fetching soil history:", err);
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const response = await fetch("/api/soil-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nitrogen,
          phosphorus,
          potassium,
          ph,
          moisture,
          soilType,
          cropIntention,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server responded with an error");
      }

      const rawResult: SoilResult = await response.json();
      rawResult.timestamp = new Date().toISOString();

      setResult(rawResult);

      // Save to Firebase
      const collectionPath = "soil_analyses";
      let savedDocRef;
      try {
        savedDocRef = await addDoc(collection(db, collectionPath), {
          nitrogen,
          phosphorus,
          potassium,
          ph,
          moisture,
          soilType,
          cropIntention,
          nutrientStatus: rawResult.nutrientStatus,
          phAnalysis: rawResult.phAnalysis,
          moistureEvaluation: rawResult.moistureEvaluation,
          suitableCrops: rawResult.suitableCrops,
          unsuitableCrops: rawResult.unsuitableCrops,
          soilConditioning: rawResult.soilConditioning,
          fertilizerSchedule: rawResult.fertilizerSchedule,
          microbiologyInsights: rawResult.microbiologyInsights,
          timestamp: rawResult.timestamp,
          farmerName: profile.name || "Anonymous Farmer",
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, collectionPath);
      }

      rawResult.id = savedDocRef.id;
      setHistory((prev) => [rawResult, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze soil sample. Please inspect chemistry values.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSoil = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docPath = `soil_analyses/${id}`;
    try {
      await deleteDoc(doc(db, "soil_analyses", id));
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (result && result.id === id) {
        setResult(null);
      }
    } catch (err) {
      console.error("Failed to delete soil report:", err);
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  const getNutrientBadgeColor = (status: string) => {
    switch (status) {
      case "Low": return "bg-red-50 text-red-700 border-red-100";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      case "High": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Optimal": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getPhRating = (val: number) => {
    if (val < 5.5) return { text: "Strongly Acidic", color: "text-red-600 bg-red-50 border-red-100" };
    if (val >= 5.5 && val < 6.0) return { text: "Moderately Acidic", color: "text-orange-600 bg-orange-50 border-orange-100" };
    if (val >= 6.0 && val <= 7.2) return { text: "Optimal Neutral", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
    if (val > 7.2 && val <= 8.5) return { text: "Mildly Alkaline", color: "text-teal-600 bg-teal-50 border-teal-100" };
    return { text: "Highly Alkaline", color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
  };

  const currentPhRating = getPhRating(ph);

  return (
    <div className="space-y-6" id="soil-analyst-root">
      {/* Parameters Entry Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Soil Health & Nutrient Assessor</h3>
            <p className="text-xs text-slate-500">Provide Nitrogen, Phosphorus, Potassium (N-P-K), pH, and moisture parameters to get biochemical conditioning recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* N-P-K Ranges */}
            <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nutrient Levels (mg/kg)</h4>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Nitrogen (N)</span>
                  <span className="font-extrabold text-emerald-700">{nitrogen} mg/kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  id="soil-n-range"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Phosphorus (P)</span>
                  <span className="font-extrabold text-emerald-700">{phosphorus} mg/kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  id="soil-p-range"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Potassium (K)</span>
                  <span className="font-extrabold text-emerald-700">{potassium} mg/kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={potassium}
                  onChange={(e) => setPotassium(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  id="soil-k-range"
                />
              </div>
            </div>

            {/* pH & Moisture Ranges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Soil pH</span>
                  <span className="font-extrabold text-emerald-700">{ph.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mb-2"
                  id="soil-ph-range"
                />
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block ${currentPhRating.color}`}>
                  {currentPhRating.text}
                </span>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Moisture (%)</span>
                  <span className="font-extrabold text-emerald-700">{moisture}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={(e) => setMoisture(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  id="soil-moisture-range"
                />
                <span className="text-[9px] text-slate-400 font-semibold block mt-1.5 flex items-center gap-0.5">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  Field capacity index
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="soil-type-select"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Crop Intention</label>
                <input
                  type="text"
                  placeholder="e.g. Tomato, Chili, Paddy"
                  value={cropIntention}
                  onChange={(e) => setCropIntention(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="soil-crop-intention"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-sm ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Soil Samples...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Perform Biochemical Analysis
                </span>
              )}
            </button>
          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {result ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4" id="soil-result-panel">
                {/* N-P-K Status Badges */}
                <div className="grid grid-cols-3 gap-2 text-center" id="result-npk-badges">
                  <div className={`p-3 rounded-xl border ${getNutrientBadgeColor(result.nutrientStatus?.nitrogen)}`}>
                    <span className="text-[9px] uppercase font-bold block mb-0.5">Nitrogen (N)</span>
                    <span className="text-sm font-black tracking-tight">{result.nutrientStatus?.nitrogen}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${getNutrientBadgeColor(result.nutrientStatus?.phosphorus)}`}>
                    <span className="text-[9px] uppercase font-bold block mb-0.5">Phosphorus (P)</span>
                    <span className="text-sm font-black tracking-tight">{result.nutrientStatus?.phosphorus}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${getNutrientBadgeColor(result.nutrientStatus?.potassium)}`}>
                    <span className="text-[9px] uppercase font-bold block mb-0.5">Potassium (K)</span>
                    <span className="text-sm font-black tracking-tight">{result.nutrientStatus?.potassium}</span>
                  </div>
                </div>

                {/* pH & Moisture Analyses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">pH Compatibility</h5>
                    <p className="text-xs text-slate-600 leading-normal">{result.phAnalysis}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Moisture Capacity</h5>
                    <p className="text-xs text-slate-600 leading-normal">{result.moistureEvaluation}</p>
                  </div>
                </div>

                {/* Crop suitability split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                    <h5 className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Highly Compatible Crops
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suitableCrops?.map((c) => (
                        <span key={c} className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100/50">
                    <h5 className="text-xs font-bold text-red-800 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Non-Compatible / Inimical Crops
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {result.unsuitableCrops?.map((c) => (
                        <span key={c} className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-md border border-red-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conditioning recommendations */}
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <h5 className="text-xs font-bold text-slate-700 mb-2.5">Biochemical Soil Conditioning & Remedies</h5>
                  <div className="space-y-2">
                    {result.soilConditioning?.map((cond, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/60 text-xs">
                        <div>
                          <strong className="text-slate-800 block">{cond.remedy}</strong>
                          <span className="text-[10px] text-slate-400">{cond.purpose}</span>
                        </div>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md text-right shrink-0">
                          Dosage: {cond.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fertilization Calendar */}
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3.5">
                  <h5 className="text-xs font-bold text-indigo-900 mb-1.5">Ideal Nitrogen / Compost Schedule</h5>
                  <ul className="list-disc pl-4 text-xs text-indigo-950 space-y-0.5">
                    {result.fertilizerSchedule?.map((sched, idx) => (
                      <li key={idx}>{sched}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                  "{result.microbiologyInsights}"
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center min-h-[300px]">
                <FlaskConical className="w-10 h-10 text-emerald-500/40 animate-pulse mb-3" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">Soil Diagnostics Pending</h4>
                <p className="text-xs text-slate-400 max-w-sm">Adjust slide controls representing Nitrogen, Phosphorus, Potassium, Soil pH, and Moisture percentage. Press "Perform Biochemical Analysis" to render chemical insights.</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* History Ledger card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-emerald-600" />
          Saved Soil Health Reports History ({history.length})
        </h3>

        {loadingHistory ? (
          <div className="flex justify-center items-center py-6">
            <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin mr-2" />
            <span className="text-xs text-slate-500">Retrieving soil records...</span>
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No previous soil reports found on the cloud database. Analyze some soil metrics to log reports here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="history-soil-grid">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => setResult(h)}
                className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 transition cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800">{(h.soilType || "Unknown").split(" ")[0]} soil</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      pH: {h.ph}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Nutrients N-P-K: {h.nitrogen}-{h.phosphorus}-{h.potassium}</p>
                  <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => h.id && handleDeleteSoil(h.id, e)}
                  className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition"
                  title="Delete soil report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
