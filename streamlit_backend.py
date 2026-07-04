"""
Streamlit-compatible Python backend for Smart Agriculture Platform
This replaces the Node.js Express server for Streamlit deployment.
"""

import os
from typing import Optional, List, Dict, Any
import json
from dotenv import load_dotenv
import google.generativeai as genai
from pathlib import Path
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Initialize Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class AgriculturalAI:
    """Main class for agricultural AI operations"""
    
    def __init__(self):
        self.model_name = "gemini-2.5-flash"
    
    def detect_crop_disease(
        self,
        image_data: str,
        mime_type: str,
        crop_hint: Optional[str] = None,
        user_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detect crop diseases from image using Gemini Vision API
        
        Args:
            image_data: Base64 encoded image
            mime_type: MIME type of the image (e.g., "image/jpeg")
            crop_hint: Optional crop type hint
            user_notes: Optional user observations
            
        Returns:
            Disease analysis result
        """
        if not GEMINI_API_KEY:
            return {"error": "GEMINI_API_KEY not configured"}
        
        try:
            prompt = f"""You are an elite, world-class agricultural pathologist and crop health scientist.
Analyze this leaf/plant image. {f'The user indicates the crop type is likely: {crop_hint}.' if crop_hint else ''}
{f'The user provided the following observations or symptoms: "{user_notes}"' if user_notes else ''}

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
{{
  "cropType": "string",
  "status": "Healthy" | "Diseased" | "Unknown",
  "diseaseName": "string or 'None'",
  "confidenceScore": "string (e.g. 92%)",
  "description": "A brief overview of the finding",
  "symptoms": ["string"],
  "organicRemedies": ["string"],
  "chemicalRemedies": ["string"],
  "preventionTips": ["string"]
}}

Return ONLY raw JSON. Do not include any markdown backticks or block formatting."""
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            
            # Create Gemini request with image
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(
                [
                    prompt,
                    {
                        "mime_type": mime_type,
                        "data": image_data
                    }
                ]
            )
            
            result_text = response.text.strip()
            # Remove markdown formatting if present
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            result_text = result_text.strip()
            
            return json.loads(result_text)
        
        except Exception as e:
            return {"error": f"Disease detection failed: {str(e)}"}
    
    def predict_crop_yield(
        self,
        crop: str,
        region: Optional[str] = None,
        area_size: float = 1.0,
        area_unit: str = "Acres",
        sowing_month: Optional[str] = None,
        rainfall: Optional[str] = None,
        fertilizer: Optional[str] = None,
        additional_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Predict crop yield based on conditions
        """
        if not GEMINI_API_KEY:
            return {"error": "GEMINI_API_KEY not configured"}
        
        try:
            prompt = f"""You are an advanced agricultural predictive model and agronomy data scientist.
Calculate and predict the crop yield based on the following input parameters:
- Crop: {crop}
- Geographic Region/Soil context: {region or 'Not specified'}
- Land Size: {area_size} {area_unit or 'Acres'}
- Sowing Month/Season: {sowing_month or 'Not specified'}
- Expected Rainfall/Water source: {rainfall or 'Average'}
- Fertilizer input: {fertilizer or 'Standard organic/chemical usage'}
- Additional Context/Notes: {additional_notes or 'None'}

Provide a highly accurate, realistic yield prediction (in metric tons or kg) backed by agronomic data.

Return a JSON object with estimatedYieldRange, yieldPerUnit, confidenceScore, factors, growthStages, riskMitigation, optimizationTips, and detailedAnalysis."""
            
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            
            result_text = response.text.strip()
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            result_text = result_text.strip()
            
            return json.loads(result_text)
        
        except Exception as e:
            return {"error": f"Yield prediction failed: {str(e)}"}
    
    def analyze_soil(
        self,
        ph: float,
        nitrogen: Optional[float] = None,
        phosphorus: Optional[float] = None,
        potassium: Optional[float] = None,
        moisture: Optional[float] = None,
        soil_type: Optional[str] = None,
        crop_intention: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze soil health and provide recommendations
        """
        if not GEMINI_API_KEY:
            return {"error": "GEMINI_API_KEY not configured"}
        
        try:
            prompt = f"""You are an expert Agricultural Soil Scientist and Biochemist.
Analyze the following soil sample parameters:
- Nitrogen (N): {f'{nitrogen} mg/kg' if nitrogen is not None else 'Not tested'}
- Phosphorus (P): {f'{phosphorus} mg/kg' if phosphorus is not None else 'Not tested'}
- Potassium (K): {f'{potassium} mg/kg' if potassium is not None else 'Not tested'}
- Soil pH: {ph}
- Moisture: {f'{moisture}%' if moisture is not None else 'Not tested'}
- Soil Type: {soil_type or 'Not specified'}
- Target Crop(s) to grow: {crop_intention or 'General Crops / Vegetable garden'}

Provide nutrientStatus, phAnalysis, moistureEvaluation, suitableCrops, unsuitableCrops, soilConditioning, fertilizerSchedule, and microbiologyInsights in JSON format."""
            
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            
            result_text = response.text.strip()
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            result_text = result_text.strip()
            
            return json.loads(result_text)
        
        except Exception as e:
            return {"error": f"Soil analysis failed: {str(e)}"}
    
    def farmer_chat(
        self,
        message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        language: str = "English"
    ) -> Dict[str, str]:
        """
        Agronomist AI assistant for farmer questions
        """
        if not GEMINI_API_KEY:
            return {"error": "GEMINI_API_KEY not configured"}
        
        try:
            system_instruction = f"""You are "KisanAI / AgroExpert", a helpful, empathetic, highly knowledgeable Senior Agronomist.
Your target audience is farmers facing actual field problems.

Rules:
1. Write your reply entirely in {language}.
2. Provide highly practical, step-by-step, actionable advice.
3. Maintain an empathetic, encouraging tone.
4. Use simple, jargon-free explanations.
5. Highlight low-cost and organic alternatives.
6. Format responses with clear structure."""
            
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(system_instruction + "\n\n" + message)
            
            return {"text": response.text}
        
        except Exception as e:
            return {"error": f"Chat failed: {str(e)}"}
    
    def weather_advisory(
        self,
        temperature: float,
        condition: str,
        wind_speed: float,
        humidity: float,
        location: Optional[str] = None,
        crop_interest: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate weather-based agricultural advisory
        """
        if not GEMINI_API_KEY:
            return {"error": "GEMINI_API_KEY not configured"}
        
        try:
            prompt = f"""You are a professional agricultural meteorologist and expert agronomy advisor.
Analyze the following real-time weather details for location: {location or 'Unknown Location'}.
Crop interest profile: {crop_interest or 'General Crops'}.

Current Weather Details:
- Temperature: {temperature} °C
- Weather Condition: {condition}
- Wind Speed: {wind_speed} km/h
- Relative Humidity: {humidity} %

Generate agricultural guidelines in JSON with sowingStatus, sowingAdvice, sprayingStatus, sprayingAdvice, harvestingStatus, harvestingAdvice, diseaseRisk, pestForecast, irrigationAlert, and generalSummary."""
            
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            
            result_text = response.text.strip()
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            result_text = result_text.strip()
            
            return json.loads(result_text)
        
        except Exception as e:
            return {"error": f"Weather advisory failed: {str(e)}"}


# Initialize the AI system
agricultural_ai = AgriculturalAI()