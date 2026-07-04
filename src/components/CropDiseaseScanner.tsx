import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, BookOpen, Trash2, History } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { DiseaseResult, FarmerProfile } from "../types";

interface CropDiseaseScannerProps {
  profile: FarmerProfile;
}

const CROP_CATEGORIES = [
  {
    name: "Vegetables",
    icon: "🥦",
    crops: ["Tomato", "Potato", "Pepper", "Cucumber", "Lettuce", "Cabbage", "Onion"]
  },
  {
    name: "Fruits",
    icon: "🍎",
    crops: ["Apple", "Grape", "Strawberry", "Mango", "Banana", "Peach", "Citrus"]
  },
  {
    name: "Grains & Crops",
    icon: "🌾",
    crops: ["Wheat", "Corn/Maize", "Rice", "Soybeans", "Cotton", "Barley", "Sugarcane"]
  }
];

export default function CropDiseaseScanner({ profile }: CropDiseaseScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>("");
  const [cropHint, setCropHint] = useState<string>("Tomato");
  const [customCrop, setCustomCrop] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Vegetables");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Camera integration states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Diagnostic history from Firebase
  const [history, setHistory] = useState<DiseaseResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    fetchScanHistory();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchScanHistory = async () => {
    setLoadingHistory(true);
    const collectionPath = "disease_diagnoses";
    try {
      const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const docsList: DiseaseResult[] = [];
      querySnapshot.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() } as DiseaseResult);
      });
      setHistory(docsList);
    } catch (err) {
      console.error("Error fetching diagnosis history:", err);
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCameraActive(false);
      stopCamera();
    }
  };

  // Turn on device camera
  const startCamera = async () => {
    setErrorMsg("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // prefer rear camera for leaves
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setErrorMsg("Unable to access camera. Please upload an image instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Grab snapshot from video frame
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreviewUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Convert blob/url to base64
  const fileToBase64 = (fileOrUrl: File | string): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      if (typeof fileOrUrl === "string") {
        // base64 dataUrl string
        const parts = fileOrUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        resolve({ base64: parts[1], mimeType: mime });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrUrl);
        reader.onload = () => {
          const resultStr = reader.result as string;
          const base64 = resultStr.split(",")[1];
          resolve({ base64, mimeType: fileOrUrl.type });
        };
        reader.onerror = (error) => reject(error);
      }
    });
  };

  const handleScanSubmit = async () => {
    if (!previewUrl) {
      setErrorMsg("Please select a leaf photo or snap one using the camera.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg("");
    setResult(null);

    try {
      // 1. Convert image to base64
      let fileInput = selectedFile ? selectedFile : previewUrl;
      const { base64, mimeType } = await fileToBase64(fileInput);

      const chosenCrop = cropHint === "Other" ? customCrop : cropHint;

      // 2. Call server API
      const response = await fetch("/api/disease-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: mimeType,
          cropHint: chosenCrop,
          userNotes: userNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server responded with an error");
      }

      const scanResult: DiseaseResult = await response.json();
      scanResult.timestamp = new Date().toISOString();
      scanResult.imageUri = previewUrl; // cache image preview locally

      setResult(scanResult);

      // 3. Save diagnostic record to Firestore
      const collectionPath = "disease_diagnoses";
      let savedDocRef;
      try {
        savedDocRef = await addDoc(collection(db, collectionPath), {
          cropType: scanResult.cropType,
          status: scanResult.status,
          diseaseName: scanResult.diseaseName,
          confidenceScore: scanResult.confidenceScore,
          description: scanResult.description,
          symptoms: scanResult.symptoms,
          organicRemedies: scanResult.organicRemedies,
          chemicalRemedies: scanResult.chemicalRemedies,
          preventionTips: scanResult.preventionTips,
          timestamp: scanResult.timestamp,
          farmerName: profile.name || "Anonymous Farmer",
          farmLocation: profile.location || "General Farm",
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, collectionPath);
      }

      scanResult.id = savedDocRef.id;
      
      // Update history list
      setHistory((prev) => [scanResult, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze leaf image. Ensure the image is clear.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteScan = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docPath = `disease_diagnoses/${scanId}`;
    try {
      await deleteDoc(doc(db, "disease_diagnoses", scanId));
      setHistory((prev) => prev.filter((item) => item.id !== scanId));
      if (result && result.id === scanId) {
        setResult(null);
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  return (
    <div className="space-y-6" id="crop-disease-scanner-root">
      {/* Upper Module Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Camera className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Crop Leaf Pathologist</h3>
            <p className="text-xs text-slate-500">Scan plant leaves instantly to recognize pathogenic damage, fungal streaks, or nutritional deficiencies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sorter & Selector controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Typing Crop Name Text Box */}
            <div className="space-y-1.5" id="typed-crop-name-wrapper">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Type Crop Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tomato, Corn, Wheat, Potato..."
                value={cropHint === "Other" ? customCrop : cropHint}
                onChange={(e) => {
                  setCustomCrop(e.target.value);
                  setCropHint("Other");
                }}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400 shadow-sm"
              />
            </div>

            {/* Input Options (Camera vs File Upload) */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-500 uppercase">Capture / Input Photo</span>
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    isCameraActive
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Live Camera
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold cursor-pointer text-center">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Symptoms Description / Question Text Box */}
            <div className="space-y-1.5" id="symptoms-notes-input-wrapper">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Describe leaf symptoms or ask a question
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g., Yellow spots on edges, white powder on underside, or ask: 'Why is my potato leaf turning brown?'"
                rows={3}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400 shadow-sm resize-none"
              />
            </div>

            {/* Select Crop Type Shortcuts by Category */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Select Crop Type Category Shortcut
                </label>
                {/* Category Tabs */}
                <div className="flex gap-1.5 mb-2.5 overflow-x-auto pb-1" id="crop-category-tabs">
                  {CROP_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer border whitespace-nowrap transition-all ${
                        selectedCategory === cat.name
                          ? "bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-crops within selected category */}
                <div className="grid grid-cols-3 gap-1.5" id="crop-category-shortcuts">
                  {CROP_CATEGORIES.find((cat) => cat.name === selectedCategory)?.crops.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => {
                        setCropHint(crop);
                        setCustomCrop("");
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                        cropHint === crop
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600"
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCropHint("Other");
                      setCustomCrop("");
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                      cropHint === "Other"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Camera Viewfinder */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-900 aspect-video" id="camera-viewfinder">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                  <button
                    onClick={captureSnapshot}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1"
                  >
                    Take Snapshot
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview Box */}
            {previewUrl && (
              <div className="space-y-2" id="leaf-preview-container">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Selected Leaf Target:</span>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 max-w-sm mx-auto">
                  <img
                    src={previewUrl}
                    alt="Leaf Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleScanSubmit}
              disabled={analyzing || !previewUrl}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-sm ${
                analyzing
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : !previewUrl
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow"
              }`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI Model Diagnosing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Run Pathological Diagnosis
                </span>
              )}
            </button>
          </div>

          {/* Results Output Screen */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {result ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4" id="scan-result-panel">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crop Diagnosis Result</h4>
                    <h2 className="text-base font-black text-slate-900 leading-tight">
                      {result.cropType} — <span className={result.status === "Healthy" ? "text-emerald-600" : "text-red-500"}>{result.diseaseName}</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase block text-slate-400">Confidence</span>
                    <span className="inline-block px-2.5 py-0.5 text-xs font-black bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
                      {result.confidenceScore}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
                  result.status === "Healthy"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-red-50 text-red-800 border border-red-100"
                }`}>
                  {result.status === "Healthy" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>The plant appears overall healthy. Keep up optimal watering and fertilization routines.</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Pathological disease detected. Take defensive measures immediately to avoid contagion.</span>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-1">Diagnostic Summary:</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{result.description}</p>
                  </div>

                  {result.symptoms && result.symptoms.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 mb-1">Key Symptoms Identified:</h5>
                      <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                        {result.symptoms.map((sym, idx) => (
                          <li key={idx}>{sym}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100/60">
                    <div>
                      <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Organic Treatments
                      </h5>
                      <ul className="list-none space-y-1 text-xs text-slate-600">
                        {result.organicRemedies.map((rem, idx) => (
                          <li key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                            {rem}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Chemical Remedies
                      </h5>
                      <ul className="list-none space-y-1 text-xs text-slate-600">
                        {result.chemicalRemedies.map((rem, idx) => (
                          <li key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                            {rem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3">
                    <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                      Future Preventative Agronomy
                    </h5>
                    <ul className="list-disc pl-4 text-xs text-indigo-950 space-y-0.5">
                      {result.preventionTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center min-h-[300px]">
                <Sparkles className="w-10 h-10 text-emerald-500/40 animate-pulse mb-3" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">AI Diagnostic Report Waiting</h4>
                <p className="text-xs text-slate-400 max-w-sm">Select a crop, snap/upload a clear photo of the leaf, and press Diagnose to view detailed health suggestions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnosis History Log from Firestore */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" id="scan-history-panel">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-emerald-600" />
          Recent Plant Diagnoses History ({history.length})
        </h3>

        {loadingHistory ? (
          <div className="flex justify-center items-center py-6">
            <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin mr-2" />
            <span className="text-xs text-slate-500">Retrieving diagnostic ledgers...</span>
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No past diagnostic records found on the cloud database. Be the first to analyze a leaf!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="history-scans-grid">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => setResult(h)}
                className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 transition cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800">{h.cropType}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      h.status === "Healthy" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 line-clamp-1">{h.diseaseName}</p>
                  <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</p>
                </div>
                <button
                  onClick={(e) => h.id && handleDeleteScan(h.id, e)}
                  className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition"
                  title="Delete diagnosis from ledger"
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
