# 🌾 Smart Agriculture Platform - Streamlit Deployment Guide

This guide will help you deploy the Smart Agriculture Platform as a Streamlit app.

## Overview

The platform has been refactored to support Streamlit deployment:
- **Frontend**: Interactive Streamlit web application (`streamlit_app.py`)
- **Backend**: Python-based Gemini AI integration (`streamlit_backend.py`)
- **API**: Optional REST API endpoints for external integrations

## Features

### 🍃 Crop Disease Detection
- Upload plant/leaf images
- AI-powered disease diagnosis
- Treatment recommendations (organic & chemical)
- Prevention tips

### 📊 Crop Yield Prediction
- Predict yields based on field conditions
- Growth stage timeline
- Risk assessment and mitigation
- Optimization strategies

### 🌱 Soil Health Analysis
- Nutrient status evaluation
- pH and moisture analysis
- Suitable crops recommendations
- Conditioning and fertilizer schedule

### 💬 Farmer's AI Assistant
- Multi-language support (English, Hindi, Marathi, Tamil, etc.)
- Real-time agricultural advice
- Disease and pest management
- Best practices guidance

### 🌤️ Weather-Based Advisory
- Weather condition analysis
- Sowing/planting recommendations
- Pesticide spraying safety
- Disease and pest forecasts

## Prerequisites

- Python 3.8+
- Gemini API key (get free at https://ai.google.dev/)
- Docker (optional, for containerized deployment)

## Local Development

### 1. Clone the repository
```bash
git clone <repository-url>
cd smart-agriculture-platform
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up secrets
Create `.streamlit/secrets.toml`:
```toml
GEMINI_API_KEY = "your-gemini-api-key-here"
```

> **Note**: The `.streamlit` directory is in `.gitignore` to prevent accidental credential exposure.

### 5. Run the app
```bash
streamlit run streamlit_app.py
```

The app will be available at `http://localhost:8501`

## Deployment Options

### Option 1: Streamlit Cloud (Recommended for Testing)

1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Click "New app" and connect your GitHub repository
4. Select the `streamlit_app.py` file
5. Add secrets in the "Secrets" section:
   ```
   GEMINI_API_KEY = "your-gemini-api-key-here"
   ```
6. Deploy!

### Option 2: Docker Container (Recommended for Production)

#### Build the image
```bash
docker build -t smart-agriculture-platform .
```

#### Run locally
```bash
docker run -p 8501:8501 \
  -e GEMINI_API_KEY=your-api-key \
  smart-agriculture-platform
```

#### Push to Docker Hub
```bash
docker tag smart-agriculture-platform your-username/smart-agriculture-platform
docker push your-username/smart-agriculture-platform
```

### Option 3: Heroku

```bash
# Install Heroku CLI first
heroku login
heroku create your-app-name

# Create Procfile (already provided)
git push heroku main

# Set config vars
heroku config:set GEMINI_API_KEY=your-api-key
```

### Option 4: Google Cloud Run

```bash
# Install Google Cloud SDK
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy smart-agriculture-platform \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-api-key
```

### Option 5: DigitalOcean App Platform

1. Connect your GitHub repository
2. Create a new app
3. Configure build and run commands:
   - **Build**: `pip install -r requirements.txt`
   - **Run**: `streamlit run streamlit_app.py`
4. Set environment variables in the dashboard

## Environment Variables

### Required
- `GEMINI_API_KEY`: Your Google Gemini API key

### Optional
- `STREAMLIT_SERVER_PORT`: Port to run on (default: 8501)
- `STREAMLIT_SERVER_ADDRESS`: Server address (default: 0.0.0.0)

## Troubleshooting

### GEMINI_API_KEY not found
- Ensure `.streamlit/secrets.toml` exists in the correct location
- Check that the file has proper TOML syntax
- Restart the Streamlit app

### Image upload not working
- Ensure the uploaded file is in a supported format (jpg, jpeg, png, gif, webp)
- Check file size (should be under 10MB)

### Slow responses
- Gemini API calls may take 2-5 seconds
- Image processing adds additional latency

## File Structure

```
smart-agriculture-platform/
├── streamlit_app.py              # Main Streamlit app
├── streamlit_backend.py          # Python AI backend
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose config
├── Procfile                      # Heroku deployment
├── .streamlit/
│   └── config.toml              # Streamlit configuration
├── .streamlit/secrets.toml       # Secrets (gitignored)
├── streamlit_secrets.example.toml # Secrets template
└── STREAMLIT_DEPLOYMENT.md       # This file
```

## Next Steps

1. ✅ Set up local development environment
2. ✅ Configure Gemini API key
3. ✅ Test all features locally
4. ✅ Choose a deployment platform
5. ✅ Deploy to production
6. ✅ Monitor and optimize
7. ✅ Gather user feedback

## Support & Resources

- **Streamlit Docs**: https://docs.streamlit.io/
- **Google Gemini API**: https://ai.google.dev/
- **GitHub Issues**: Report bugs and feature requests

---

**Happy farming! 🌾🌱**