import streamlit as st
import requests
import json
import base64
from pathlib import Path
from typing import Optional
import os

# Load environment variables with graceful fallback
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, continue without it
    # Environment variables can still be accessed via os.environ
    st.warning("python-dotenv not installed. Using system environment variables only.")
    pass

# Page configuration
st.set_page_config(
    page_title="Smart Agriculture Platform",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        margin: 1rem 0;
    }
    .metric-card {
        background: #f0f2f6;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    .success-box {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #28a745;
    }
    .warning-box {
        background: #fff3cd;
        color: #856404;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #ffc107;
    }
    .danger-box {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #dc3545;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# Sidebar Navigation
st.sidebar.title("🌾 Smart Agriculture")
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "Choose Feature:",
    [
        "🏠 Home",
        "🍃 Disease Detection",
        "📊 Yield Prediction",
        "🌱 Soil Analysis",
        "💬 Farmer's AI Assistant",
        "🌤️ Weather Advisory"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**Help farmers through AI-powered agriculture insights.**\n\n"
    "- Detect crop diseases from images\n"
    "- Predict crop yields\n"
    "- Analyze soil health\n"
    "- Get weather-based recommendations"
)

# Home Page
if page == "🏠 Home":
    st.title("🌾 Smart Agriculture Platform")
    st.markdown(
        "Empowering farmers with AI-driven insights for better crop management and increased yields."
    )
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="card">
            <h3>🍃 Disease Detection</h3>
            <p>Identify crop diseases from leaf images using AI</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="card">
            <h3>📊 Yield Prediction</h3>
            <p>Forecast crop yields based on conditions</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="card">
            <h3>🌱 Soil Analysis</h3>
            <p>Get soil health recommendations</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="card">
            <h3>💬 Farmer's AI Assistant</h3>
            <p>Ask an agronomist anything about farming</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="card">
            <h3>🌤️ Weather Advisory</h3>
            <p>Weather-based farming recommendations</p>
        </div>
        """, unsafe_allow_html=True)

# Disease Detection
elif page == "🍃 Disease Detection":
    st.title("🍃 Crop Disease Detection")
    st.markdown("Upload a plant/leaf image to detect diseases and get treatment recommendations.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        uploaded_file = st.file_uploader(
            "Upload leaf/plant image",
            type=["jpg", "jpeg", "png", "gif", "webp"],
            help="Upload a clear image of the affected crop leaf or plant"
        )
    
    with col2:
        crop_hint = st.text_input(
            "Crop type (optional)",
            placeholder="e.g., Tomato, Wheat, Rice"
        )
    
    user_notes = st.text_area(
        "Observed symptoms (optional)",
        placeholder="Describe what you observe: spots, discoloration, wilting, etc."
    )
    
    if uploaded_file is not None:
        # Display uploaded image
        st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)
        
        # Convert image to base64
        image_data = base64.b64encode(uploaded_file.read()).decode("utf-8")
        mime_type = f"image/{uploaded_file.type.split('/')[-1]}"
        
        if st.button("🔍 Analyze Image", key="disease_detect"):
            with st.spinner("Analyzing image..."):
                try:
                    payload = {
                        "image": image_data,
                        "mimeType": mime_type,
                        "cropHint": crop_hint,
                        "userNotes": user_notes
                    }
                    
                    # Import backend
                    from streamlit_backend import agricultural_ai
                    result = agricultural_ai.detect_crop_disease(
                        image_data=image_data,
                        mime_type=mime_type,
                        crop_hint=crop_hint,
                        user_notes=user_notes
                    )
                    
                    if "error" in result:
                        st.error(result["error"])
                    else:
                        st.success("✅ Analysis Complete!")
                        col1, col2 = st.columns(2)
                        with col1:
                            st.metric("Crop Type", result.get("cropType", "Unknown"))
                            st.metric("Status", result.get("status", "Unknown"))
                        with col2:
                            st.metric("Disease", result.get("diseaseName", "None"))
                            st.metric("Confidence", result.get("confidenceScore", "N/A"))
                        
                        st.markdown(f"**Description:** {result.get('description', 'N/A')}")
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.subheader("🌿 Organic Remedies")
                            for remedy in result.get("organicRemedies", []):
                                st.write(f"• {remedy}")
                        
                        with col2:
                            st.subheader("⚗️ Chemical Remedies")
                            for remedy in result.get("chemicalRemedies", []):
                                st.write(f"• {remedy}")
                        
                        st.subheader("🛡️ Prevention Tips")
                        for tip in result.get("preventionTips", []):
                            st.write(f"• {tip}")
                    
                except Exception as e:
                    st.error(f"Error: {str(e)}")

# Yield Prediction
elif page == "📊 Yield Prediction":
    st.title("📊 Crop Yield Prediction")
    st.markdown("Predict your crop yield based on field conditions and management practices.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        crop = st.selectbox(
            "Crop Type",
            ["Wheat", "Rice", "Maize", "Tomato", "Potato", "Cotton", "Other"]
        )
        
        region = st.text_input(
            "Geographic Region",
            placeholder="e.g., Punjab, Maharashtra"
        )
        
        area_size = st.number_input(
            "Land Size",
            min_value=0.1,
            value=1.0,
            step=0.1
        )
        
        area_unit = st.selectbox("Unit", ["Acres", "Hectares", "Bighas"])
    
    with col2:
        sowing_month = st.selectbox(
            "Sowing Month",
            ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]
        )
        
        rainfall = st.selectbox(
            "Expected Rainfall",
            ["Low (< 500mm)", "Medium (500-1000mm)", "High (> 1000mm)", "Average"]
        )
        
        fertilizer = st.selectbox(
            "Fertilizer Type",
            ["Organic", "Chemical", "Mixed", "Standard"]
        )
    
    additional_notes = st.text_area(
        "Additional Information",
        placeholder="Any other relevant details about your farm..."
    )
    
    if st.button("📈 Predict Yield", key="yield_predict"):
        with st.spinner("Calculating yield prediction..."):
            try:
                from streamlit_backend import agricultural_ai
                result = agricultural_ai.predict_crop_yield(
                    crop=crop,
                    region=region,
                    area_size=area_size,
                    area_unit=area_unit,
                    sowing_month=sowing_month,
                    rainfall=rainfall,
                    fertilizer=fertilizer,
                    additional_notes=additional_notes
                )
                
                if "error" in result:
                    st.error(result["error"])
                else:
                    st.success("✅ Yield Prediction Complete!")
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("Estimated Yield Range", result.get("estimatedYieldRange", "N/A"))
                    with col2:
                        st.metric("Yield Per Unit", result.get("yieldPerUnit", "N/A"))
                    
                    st.metric("Confidence Score", result.get("confidenceScore", "N/A"))
                    
                    st.subheader("📊 Impact Factors")
                    for factor in result.get("factors", []):
                        emoji = "📈" if factor["impact"] == "Positive" else "📉" if factor["impact"] == "Negative" else "➡️"
                        st.write(f"{emoji} **{factor['name']}** ({factor['impact']}): {factor['description']}")
                    
                    st.subheader("🌱 Growth Stages")
                    for stage in result.get("growthStages", []):
                        with st.expander(f"{stage['stage']} ({stage['duration']})"):
                            for task in stage.get("tasks", []):
                                st.write(f"• {task}")
                    
                    st.subheader("⚠️ Risk Mitigation")
                    for risk_item in result.get("riskMitigation", []):
                        st.write(f"**Risk:** {risk_item['risk']}")
                        st.write(f"**Mitigation:** {risk_item['mitigation']}")
                    
                    st.subheader("💡 Optimization Tips")
                    for tip in result.get("optimizationTips", []):
                        st.write(f"• {tip}")
                    
                    with st.expander("📋 Detailed Analysis"):
                        st.write(result.get("detailedAnalysis", "N/A"))
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Soil Analysis
elif page == "🌱 Soil Analysis":
    st.title("🌱 Soil Health Analysis")
    st.markdown("Analyze soil nutrient levels and get recommendations for crop selection.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Soil Nutrients (mg/kg)")
        nitrogen = st.number_input("Nitrogen (N)", min_value=0.0, value=25.0)
        phosphorus = st.number_input("Phosphorus (P)", min_value=0.0, value=15.0)
        potassium = st.number_input("Potassium (K)", min_value=0.0, value=200.0)
    
    with col2:
        st.subheader("Soil Properties")
        ph = st.slider("Soil pH", 0.0, 14.0, 7.0, 0.1)
        moisture = st.slider("Soil Moisture (%)", 0, 100, 50)
        soil_type = st.selectbox(
            "Soil Type",
            ["Clay", "Sandy", "Loamy", "Silty", "Unknown"]
        )
    
    crop_intention = st.text_input(
        "Target Crop(s)",
        placeholder="e.g., Wheat, Tomato, Vegetables"
    )
    
    if st.button("🔬 Analyze Soil", key="soil_analyze"):
        with st.spinner("Analyzing soil composition..."):
            try:
                from streamlit_backend import agricultural_ai
                result = agricultural_ai.analyze_soil(
                    ph=ph,
                    nitrogen=nitrogen,
                    phosphorus=phosphorus,
                    potassium=potassium,
                    moisture=moisture,
                    soil_type=soil_type,
                    crop_intention=crop_intention
                )
                
                if "error" in result:
                    st.error(result["error"])
                else:
                    st.success("✅ Soil Analysis Complete!")
                    
                    st.subheader("🧪 Nutrient Status")
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Nitrogen", result["nutrientStatus"]["nitrogen"])
                    with col2:
                        st.metric("Phosphorus", result["nutrientStatus"]["phosphorus"])
                    with col3:
                        st.metric("Potassium", result["nutrientStatus"]["potassium"])
                    
                    st.markdown(f"**pH Analysis:** {result['phAnalysis']}")
                    st.markdown(f"**Moisture Evaluation:** {result['moistureEvaluation']}")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.subheader("✅ Suitable Crops")
                        for crop in result.get("suitableCrops", []):
                            st.write(f"• {crop}")
                    
                    with col2:
                        st.subheader("❌ Unsuitable Crops")
                        for crop in result.get("unsuitableCrops", []):
                            st.write(f"• {crop}")
                    
                    st.subheader("🔧 Soil Conditioning")
                    for conditioning in result.get("soilConditioning", []):
                        with st.expander(f"{conditioning['remedy']}"):
                            st.write(f"**Purpose:** {conditioning['purpose']}")
                            st.write(f"**Dosage:** {conditioning['dosage']}")
                    
                    st.subheader("📅 Fertilizer Schedule")
                    for schedule in result.get("fertilizerSchedule", []):
                        st.write(f"• {schedule}")
                    
                    st.markdown(f"**Microbiology Insights:** {result['microbiologyInsights']}")
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Farmer's AI Assistant
elif page == "💬 Farmer's AI Assistant":
    st.title("💬 Ask AgroExpert")
    st.markdown("Chat with an AI agronomist about your farming questions and challenges.")
    
    language = st.selectbox(
        "Response Language",
        ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Gujarati", "Punjabi"]
    )
    
    # Chat interface
    chat_container = st.container(border=True)
    
    with chat_container:
        for msg in st.session_state.chat_history:
            if msg["sender"] == "user":
                st.chat_message("user").write(msg["text"])
            else:
                st.chat_message("assistant").write(msg["text"])
    
    # Input field
    user_input = st.chat_input("Ask about farming, crops, diseases, soil, weather...")
    
    if user_input:
        # Add user message to history
        st.session_state.chat_history.append({
            "sender": "user",
            "text": user_input
        })
        st.chat_message("user").write(user_input)
        
        with st.spinner("Thinking..."):
            try:
                from streamlit_backend import agricultural_ai
                result = agricultural_ai.farmer_chat(
                    message=user_input,
                    chat_history=st.session_state.chat_history[:-1],
                    language=language
                )
                
                if "error" in result:
                    st.error(result["error"])
                else:
                    response = result.get("text", "No response")
                    st.session_state.chat_history.append({
                        "sender": "bot",
                        "text": response
                    })
                    st.chat_message("assistant").write(response)
                    st.rerun()
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Weather Advisory
elif page == "🌤️ Weather Advisory":
    st.title("🌤️ Weather-Based Agricultural Advisory")
    st.markdown("Get farming recommendations based on current weather conditions.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        location = st.text_input(
            "Location",
            placeholder="e.g., New Delhi, Mumbai"
        )
        
        st.subheader("Current Weather")
        temp = st.number_input("Temperature (°C)", value=25.0)
        humidity = st.number_input("Humidity (%)", min_value=0, max_value=100, value=60)
    
    with col2:
        crop_interest = st.text_input(
            "Crop Interest",
            placeholder="e.g., Wheat, Rice, Tomato"
        )
        
        st.subheader("")
        condition = st.selectbox(
            "Weather Condition",
            ["Clear", "Cloudy", "Rainy", "Windy", "Thunderstorm", "Foggy"]
        )
        wind_speed = st.number_input("Wind Speed (km/h)", min_value=0.0, value=10.0)
    
    if st.button("📋 Get Advisory", key="weather_advisory"):
        with st.spinner("Generating weather advisory..."):
            try:
                from streamlit_backend import agricultural_ai
                result = agricultural_ai.weather_advisory(
                    temperature=temp,
                    condition=condition,
                    wind_speed=wind_speed,
                    humidity=humidity,
                    location=location,
                    crop_interest=crop_interest
                )
                
                if "error" in result:
                    st.error(result["error"])
                else:
                    st.success("✅ Weather Advisory Generated!")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        with st.expander("🌱 Sowing/Planting", expanded=True):
                            st.write(f"**Status:** {result.get('sowingStatus', 'N/A')}")
                            st.write(f"**Advice:** {result.get('sowingAdvice', 'N/A')}")
                        
                        with st.expander("💨 Spraying", expanded=False):
                            st.write(f"**Status:** {result.get('sprayingStatus', 'N/A')}")
                            st.write(f"**Advice:** {result.get('sprayingAdvice', 'N/A')}")
                        
                        with st.expander("🌾 Harvesting", expanded=False):
                            st.write(f"**Status:** {result.get('harvestingStatus', 'N/A')}")
                            st.write(f"**Advice:** {result.get('harvestingAdvice', 'N/A')}")
                    
                    with col2:
                        with st.expander("🦠 Disease Risk", expanded=False):
                            st.write(result.get('diseaseRisk', 'N/A'))
                        
                        with st.expander("🐛 Pest Forecast", expanded=False):
                            st.write(result.get('pestForecast', 'N/A'))
                        
                        with st.expander("💧 Irrigation Alert", expanded=False):
                            st.write(result.get('irrigationAlert', 'N/A'))
                    
                    st.subheader("📝 General Summary")
                    st.info(result.get('generalSummary', 'N/A'))
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")

# Footer
st.markdown("---")
st.markdown(
    "<p style='text-align: center; color: gray;'>🌾 Smart Agriculture Platform | Helping Farmers Grow Better 🌱</p>",
    unsafe_allow_html=True
)
