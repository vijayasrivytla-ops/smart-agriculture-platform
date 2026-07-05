import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Activity, TrendingUp, Cloud, Droplets } from 'lucide-react';

function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Smart Agriculture Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-blue-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Operational</p>
            <p className="text-gray-600 text-sm">All systems running smoothly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Latest Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">4.8 Tons</p>
            <p className="text-gray-600 text-sm">Per acre average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="text-sky-500" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">28°C</p>
            <p className="text-gray-600 text-sm">Partly cloudy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="text-cyan-500" />
              Soil Moisture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">65%</p>
            <p className="text-gray-600 text-sm">Optimal level</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Smart Agriculture Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            This platform provides intelligent solutions for modern farming including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Disease Detection:</strong> AI-powered analysis of crop diseases using leaf images</li>
            <li><strong>Yield Prediction:</strong> Data-driven crop yield forecasting</li>
            <li><strong>Soil Analysis:</strong> Comprehensive soil health assessment</li>
            <li><strong>Farmer Chat:</strong> Interactive agronomist assistant</li>
            <li><strong>Weather Advisory:</strong> Personalized weather-based farming guidance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;