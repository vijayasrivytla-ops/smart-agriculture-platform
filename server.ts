import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in secrets or .env.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Crop Disease Detection (Multimodal analysis of leaf image)
app.post("/api/disease-detect", async (req, res) => {
  try {
    const { image, mimeType, cropHint, userNotes } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mimeType" });
    }

    const ai = getGeminiClient();

    const prompt = `You are an elite, world-class agricultural pathologist and crop health scientist.
Analyze this leaf/plant image. ${cropHint ? `The user indicates the crop type is likely: ${cropHint}.` : ""}
${userNotes ? `The user provided the following observations or symptoms: "${userNotes}"` : ""}

Determine:
1. Crop Type
2. Health Status (Healthy vs Diseased)
3. Disease Name (if any)
4. Confidence level of diagnosis
5. Pathogen/Cause details
6. Symptoms visible in image
7. Organic and non-chemical remedies
8. Chemical remedies/pesticides (provide specific advice, precautions, and instructions)
9. Future prevention guidelines

Provide the response in the following strict JSON schema format:
{
  "cropType": "string",
  "status": "Healthy" | "Diseased" | "Unknown",
  "diseaseName": "string or 'None'",
  "confidenceScore": "string (e.g. 92%)",
  "description": "A brief overview of the finding",
  "symptoms": ["string"],
  "organicRemedies": ["string"],
  "chemicalRemedies": ["string"],
  "preventionTips": ["string"]
}

Return ONLY raw JSON. Do not include any markdown backticks or block formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: image,
            mimeType: mimeType,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropType: { type: Type.STRING },
            status: { type: Type.STRING },
            diseaseName: { type: Type.STRING },
            confidenceScore: { type: Type.STRING },
            description: { type: Type.STRING },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            organicRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
            chemicalRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["cropType", "status", "diseaseName", "confidenceScore", "description", "symptoms", "organicRemedies", "chemicalRemedies", "preventionTips"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in disease detection:", error);
    res.status(500).json({ error: error.message || "An error occurred during disease analysis" });
  }
});

// 3. Crop Yield Prediction (Data-driven prediction)
app.post("/api/yield-predict", async (req, res) => {
  try {
    const { crop, region, areaSize, areaUnit, sowingMonth, rainfall, fertilizer, additionalNotes } = req.body;
    
    if (!crop || !areaSize) {
      return res.status(400).json({ error: "Missing required parameters crop or areaSize" });
    }

    const ai = getGeminiClient();

    const prompt = `You are an advanced agricultural predictive model and agronomy data scientist.
Calculate and predict the crop yield based on the following input parameters:
- Crop: ${crop}
- Geographic Region/Soil context: ${region || "Not specified"}
- Land Size: ${areaSize} ${areaUnit || "Acres"}
- Sowing Month/Season: ${sowingMonth || "Not specified"}
- Expected Rainfall/Water source: ${rainfall || "Average"}
- Fertilizer input: ${fertilizer || "Standard organic/chemical usage"}
- Additional Context/Notes: ${additionalNotes || "None"}

Provide a highly accurate, realistic yield prediction (in metric tons or kg) backed by agronomic data. Include the growth timeline, major risks, and actionable optimization strategies.

Provide the response in the following strict JSON schema format:
{
  "estimatedYieldRange": "string (e.g. 4.2 - 5.0 Tons)",
  "yieldPerUnit": "string (e.g. 2.3 Tons per Acre)",
  "confidenceScore": "string (e.g. 85% - Moderate)",
  "factors": [
    {
      "name": "string (e.g. Sowing Window)",
      "impact": "Positive" | "Negative" | "Neutral",
      "description": "string"
    }
  ],
  "growthStages": [
    {
      "stage": "string",
      "duration": "string",
      "tasks": ["string"]
    }
  ],
  "riskMitigation": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ],
  "optimizationTips": ["string"],
  "detailedAnalysis": "string (A descriptive summary of the prediction logic, soil impact, and recommendations)"
}

Return ONLY raw JSON. Do not include any markdown backticks or block formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedYieldRange: { type: Type.STRING },
            yieldPerUnit: { type: Type.STRING },
            confidenceScore: { type: Type.STRING },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["name", "impact", "description"],
              },
            },
            growthStages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["stage", "duration", "tasks"],
              },
            },
            riskMitigation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                },
                required: ["risk", "mitigation"],
              },
            },
            optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedAnalysis: { type: Type.STRING },
          },
          required: ["estimatedYieldRange", "yieldPerUnit", "confidenceScore", "factors", "growthStages", "riskMitigation", "optimizationTips", "detailedAnalysis"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in yield prediction:", error);
    res.status(500).json({ error: error.message || "An error occurred during yield prediction" });
  }
});

// 4. Soil Health Analysis
app.post("/api/soil-analyze", async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, ph, moisture, soilType, cropIntention } = req.body;

    if (ph === undefined) {
      return res.status(400).json({ error: "Soil pH is a required parameter" });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert Agricultural Soil Scientist and Biochemist.
Analyze the following soil sample parameters:
- Nitrogen (N): ${nitrogen !== undefined ? `${nitrogen} mg/kg` : "Not tested"}
- Phosphorus (P): ${phosphorus !== undefined ? `${phosphorus} mg/kg` : "Not tested"}
- Potassium (K): ${potassium !== undefined ? `${potassium} mg/kg` : "Not tested"}
- Soil pH: ${ph}
- Moisture: ${moisture !== undefined ? `${moisture}%` : "Not tested"}
- Soil Type: ${soilType || "Not specified"}
- Target Crop(s) to grow: ${cropIntention || "General Crops / Vegetable garden"}

Provide a comprehensive nutrient evaluation, soil conditioning recommendations, and rotational crops best suited for this soil context.

Provide the response in the following strict JSON schema format:
{
  "nutrientStatus": {
    "nitrogen": "Low" | "Medium" | "High" | "Optimal" | "Untested",
    "phosphorus": "Low" | "Medium" | "High" | "Optimal" | "Untested",
    "potassium": "Low" | "Medium" | "High" | "Optimal" | "Untested"
  },
  "phAnalysis": "string (evaluation of the pH level and crop compatibility)",
  "moistureEvaluation": "string (evaluation of moisture and irrigation tips)",
  "suitableCrops": ["string"],
  "unsuitableCrops": ["string"],
  "soilConditioning": [
    {
      "remedy": "string (e.g. Lime application, organic manure)",
      "purpose": "string",
      "dosage": "string"
    }
  ],
  "fertilizerSchedule": ["string"],
  "microbiologyInsights": "string"
}

Return ONLY raw JSON. Do not include any markdown backticks or block formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nutrientStatus: {
              type: Type.OBJECT,
              properties: {
                nitrogen: { type: Type.STRING },
                phosphorus: { type: Type.STRING },
                potassium: { type: Type.STRING },
              },
              required: ["nitrogen", "phosphorus", "potassium"],
            },
            phAnalysis: { type: Type.STRING },
            moistureEvaluation: { type: Type.STRING },
            suitableCrops: { type: Type.ARRAY, items: { type: Type.STRING } },
            unsuitableCrops: { type: Type.ARRAY, items: { type: Type.STRING } },
            soilConditioning: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  remedy: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                },
                required: ["remedy", "purpose", "dosage"],
              },
            },
            fertilizerSchedule: { type: Type.ARRAY, items: { type: Type.STRING } },
            microbiologyInsights: { type: Type.STRING },
          },
          required: ["nutrientStatus", "phAnalysis", "moistureEvaluation", "suitableCrops", "unsuitableCrops", "soilConditioning", "fertilizerSchedule", "microbiologyInsights"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in soil analysis:", error);
    res.status(500).json({ error: error.message || "An error occurred during soil analysis" });
  }
});

// 5. Agronomist Problem Solving AI Assistant
app.post("/api/farmer-chat", async (req, res) => {
  try {
    const { message, chatHistory, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    const formattedHistory = (chatHistory || []).map((msg: { sender: "user" | "bot"; text: string }) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      };
    });

    const targetLang = language || "English";
    const systemInstruction = `You are "KisanAI / AgroExpert", a helpful, empathetic, highly knowledgeable Senior Agronomist and Rural Extension Agent.
Your target audience is farmers facing actual field problems (pests, diseases, irrigation difficulties, low budget, weather disasters, credit options, organic farming transitions, harvesting techniques).
Rules:
1. IMPORTANT: You MUST write your reply entirely in the language: ${targetLang}. For example, if the language is Hindi, write your entire reply in Hindi; if Spanish, write in Spanish.
2. Provide highly practical, step-by-step, actionable advice that is realistic for small-to-medium scale farmers.
3. Maintain an empathetic, encouraging tone.
4. Use simple, jargon-free explanations, but do not sacrifice scientific accuracy.
5. Highlight low-cost and organic alternatives where relevant.
6. List warning signs and preventative steps.
7. Format your responses elegantly in neat Markdown (with bullet points, bold text, and numbered steps).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] },
      ],
    });

    const reply = response.text || "I apologize, but I could not formulate a response. Can you please describe your query or problem in more detail?";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Error in farmer chat:", error);
    res.status(500).json({ error: error.message || "An error occurred in AI Agronomist assistant" });
  }
});

// 6. Weather Proxy
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat or lon parameter" });
    }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in weather proxy:", error);
    res.status(502).json({ error: error.message || "Failed to fetch weather from upstream" });
  }
});

// 7. Geocoding Proxy
app.get("/api/weather/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Missing name parameter" });
    }
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(String(name))}&count=1&language=en&format=json`;
    const response = await fetch(geoUrl);
    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in geocoding proxy:", error);
    res.status(502).json({ error: error.message || "Failed to fetch location from upstream" });
  }
});

// 8. Agricultural Weather Advisor
app.post("/api/weather-advisory", async (req, res) => {
  try {
    const { temp, condition, windSpeed, humidity, location, cropInterest } = req.body;
    
    const ai = getGeminiClient();
    const prompt = `You are a professional agricultural meteorologist and expert agronomy advisor.
Analyze the following real-time weather details for location: ${location || "Unknown Location"}.
Crop interest profile: ${cropInterest || "General Crops"}.

Current Weather Details:
- Temperature: ${temp ?? "N/A"} °C
- Weather Condition: ${condition || "N/A"}
- Wind Speed: ${windSpeed ?? "N/A"} km/h
- Relative Humidity: ${humidity ?? "N/A"} %

Please generate high-precision agricultural guidelines for:
1. Sowing / Planting: Status ("Optimal", "Fair", "Sub-optimal", "Critical") and advice.
2. Pesticide/Herbicide Spraying: Status ("Safe", "Caution", "Unsafe" based on wind & humidity) and advice.
3. Harvesting: Status ("Optimal", "Caution", "Avoid") and advice.
4. Disease Risk: Risk level ("Low", "Medium", "High" based on humidity/wetness) and details.
5. Pest Forecast: Anticipated pest activities and prevention advice.
6. Irrigation Alert: Watering needs based on current heat & dryness.
7. General Summary: Short motivational or cautious summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sowingStatus: { type: Type.STRING },
            sowingAdvice: { type: Type.STRING },
            sprayingStatus: { type: Type.STRING },
            sprayingAdvice: { type: Type.STRING },
            harvestingStatus: { type: Type.STRING },
            harvestingAdvice: { type: Type.STRING },
            diseaseRisk: { type: Type.STRING },
            pestForecast: { type: Type.STRING },
            irrigationAlert: { type: Type.STRING },
            generalSummary: { type: Type.STRING }
          },
          required: [
            "sowingStatus",
            "sowingAdvice",
            "sprayingStatus",
            "sprayingAdvice",
            "harvestingStatus",
            "harvestingAdvice",
            "diseaseRisk",
            "pestForecast",
            "irrigationAlert",
            "generalSummary"
          ]
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error generating weather advisory:", error);
    res.status(500).json({ error: error.message || "Failed to generate agricultural weather advisory" });
  }
});

// ==========================================
// VITE DEV / PRODUCTION CONFIG
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Agriculture Portal Server running on http://localhost:${PORT}`);
  });
}

startServer();
