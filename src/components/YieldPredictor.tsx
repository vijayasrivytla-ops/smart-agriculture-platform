import React, { useState, useEffect } from "react";
import { Calculator, ArrowRight, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, History, Sparkles, Trash2, ShieldAlert } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { YieldResult, FarmerProfile } from "../types";

interface YieldPredictorProps {
  profile: FarmerProfile;
}

const CROPS = ["Wheat", "Corn (Maize)", "Rice (Paddy)", "Soybeans", "Cotton", "Barley", "Canola", "Sorghum", "Potatoes", "Sugarcane"];
const WATER_SOURCES = ["High Rainfall (Rainfed)", "Average Rainfall", "Arid / Low Rainfall", "Drip Irrigation", "Flood/Canal Irrigation", "Sprinkler Irrigation"];
const SOWING_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function YieldPredictor({ profile }: YieldPredictorProps) {
  const [crop, setCrop] = useState<string>("Wheat");
  const [region, setRegion] = useState<string>(profile.location || "");
  const [areaSize, setAreaSize] = useState<number>(5);
  const [areaUnit, setAreaUnit] = useState<string>("Acres");
  const [sowingMonth, setSowingMonth] = useState<string>("November");
  const [rainfall, setRainfall] = useState<string>("Average Rainfall");
  const [fertilizer, setFertilizer] = useState<string>("Standard Nitrogen-Phosphorus-Potassium application");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Predictions history
  const [history, setHistory] = useState<YieldResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const collectionPath = "yield_predictions";
    try {
      const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const docsList: YieldResult[] = [];
      querySnapshot.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() } as YieldResult);
      });
      setHistory(docsList);
    } catch (err) {
      console.error("Error fetching yield predictions history:", err);
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
      const response = await fetch("/api/yield-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          region,
          areaSize,
          areaUnit,
          sowingMonth,
          rainfall,
          fertilizer,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error during computation");
      }

      const rawResult: YieldResult = await response.json();
      rawResult.timestamp = new Date().toISOString();

      setResult(rawResult);

      // Save to Firebase
      const collectionPath = "yield_predictions";
      let savedDocRef;
      try {
        savedDocRef = await addDoc(collection(db, collectionPath), {
          crop,
          region,
          areaSize,
          areaUnit,
          sowingMonth,
          rainfall,
          fertilizer,
          additionalNotes,
          estimatedYieldRange: rawResult.estimatedYieldRange,
          yieldPerUnit: rawResult.yieldPerUnit,
          confidenceScore: rawResult.confidenceScore,
          factors: rawResult.factors,
          growthStages: rawResult.growthStages,
          riskMitigation: rawResult.riskMitigation,
          optimizationTips: rawResult.optimizationTips,
          detailedAnalysis: rawResult.detailedAnalysis,
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
      setErrorMsg(err.message || "Failed to project crop yield. Please verify parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrediction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docPath = `yield_predictions/${id}`;
    try {
      await deleteDoc(doc(db, "yield_predictions", id));
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (result && result.id === id) {
        setResult(null);
      }
    } catch (err) {
      console.error("Failed to delete yield prediction:", err);
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  return (
    <div className="space-y-6" id="yield-predictor-root">
      {/* Parameters Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Calculator className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Yield Estimator & Growth Planner</h3>
            <p className="text-xs text-slate-500">Calculate harvest projections and optimize irrigation windows based on real agronomy neural indices.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-crop-select"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Farm Region / Soil Type</label>
                <input
                  type="text"
                  placeholder="e.g. Clay Loam, Iowa Plains"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-region-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cultivated Land Size</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={areaSize}
                  onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-area-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Area Measurement Unit</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-unit-select"
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Bighas">Bighas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sowing Month</label>
                <select
                  value={sowingMonth}
                  onChange={(e) => setSowingMonth(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-month-select"
                >
                  {SOWING_MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Watering Source index</label>
                <select
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  id="yield-water-select"
                >
                  {WATER_SOURCES.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fertilizers / Soil Nutrition (N-P-K)</label>
              <input
                type="text"
                placeholder="e.g. Urea + organic compost weekly"
                value={fertilizer}
                onChange={(e) => setFertilizer(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                id="yield-fert-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Additional Farming Notes (Optional)</label>
              <textarea
                placeholder="e.g. Facing slight crop pest pressure last year, high temperature index..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 min-h-[70px] resize-y"
                id="yield-notes-input"
              />
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
                  Running Predictive Calculations...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Project Harvest Estimates
                </span>
              )}
            </button>
          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {result ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4" id="yield-result-panel">
                {/* Header metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Harvest Yield</span>
                    <h3 className="text-xl font-black text-emerald-700 tracking-tight">{result.estimatedYieldRange}</h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yield Density</span>
                    <h4 className="text-sm font-extrabold text-slate-800">{result.yieldPerUnit}</h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Score</span>
                    <span className="inline-block px-2 py-0.5 mt-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
                      {result.confidenceScore}
                    </span>
                  </div>
                </div>

                {/* Growth Stage Progression Cards */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Estimated Sowing Timeline & Interventions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {result.growthStages?.map((g, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-3xs space-y-1">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded inline-block">
                          {g.stage}
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold">Duration: {g.duration}</p>
                        <div className="border-t border-slate-50 pt-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Primary Duties:</p>
                          <ul className="list-disc pl-3 text-[9px] text-slate-600 space-y-0.5">
                            {g.tasks?.slice(0, 2).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Factors Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-700 mb-2">Influential Risk & Benefits</h5>
                    <div className="space-y-1.5">
                      {result.factors?.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold text-slate-600 truncate">{f.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 rounded ${
                            f.impact === "Positive"
                              ? "bg-emerald-100 text-emerald-800"
                              : f.impact === "Negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                      Critical Risk Mitigations
                    </h5>
                    {result.riskMitigation?.slice(0, 2).map((r, i) => (
                      <div key={i} className="text-[10px] leading-relaxed">
                        <strong className="text-indigo-950 block">{r.risk}:</strong>
                        <span className="text-slate-500">{r.mitigation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimizations & Analyst Summary */}
                <div className="space-y-2">
                  <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3">
                    <h5 className="text-xs font-bold text-amber-900 mb-1">Expert Tips to Maximize Harvest Yield:</h5>
                    <ul className="list-disc pl-4 text-[11px] text-amber-950 space-y-0.5">
                      {result.optimizationTips?.slice(0, 3).map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                    "{result.detailedAnalysis}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center min-h-[300px]">
                <Calculator className="w-10 h-10 text-emerald-500/40 animate-pulse mb-3" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">Yield Estimations Pending</h4>
                <p className="text-xs text-slate-400 max-w-sm">Define your crop species, acreage, water sources, and nutrients. Press "Project Harvest Estimates" to calculate predictive summaries.</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* History panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-emerald-600" />
          Saved Yield Predictions Log ({history.length})
        </h3>

        {loadingHistory ? (
          <div className="flex justify-center items-center py-6">
            <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin mr-2" />
            <span className="text-xs text-slate-500">Retrieving harvest registers...</span>
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No previous yield estimations found on the cloud. Create a prediction above to store it in history.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="history-yield-grid">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => setResult(h)}
                className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 transition cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800">{h.crop}</span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      {h.areaSize} {h.areaUnit}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-600 line-clamp-1">Expected: {h.estimatedYieldRange}</p>
                  <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => h.id && handleDeletePrediction(h.id, e)}
                  className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition"
                  title="Delete prediction"
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
