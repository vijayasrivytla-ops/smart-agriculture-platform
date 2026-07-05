import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loader } from 'lucide-react';

function SoilAnalysis() {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    moisture: '',
    soilType: '',
    cropIntention: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const analyzeSoil = async () => {
    if (!formData.ph) {
      setError('Please fill in required field: Soil pH');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/soil-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen) : undefined,
          phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : undefined,
          potassium: formData.potassium ? parseFloat(formData.potassium) : undefined,
          ph: parseFloat(formData.ph),
          moisture: formData.moisture ? parseFloat(formData.moisture) : undefined,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Soil Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Soil Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="number"
              name="nitrogen"
              placeholder="Nitrogen (N) - mg/kg"
              value={formData.nitrogen}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="phosphorus"
              placeholder="Phosphorus (P) - mg/kg"
              value={formData.phosphorus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="potassium"
              placeholder="Potassium (K) - mg/kg"
              value={formData.potassium}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="ph"
              placeholder="Soil pH (0-14)*"
              step="0.1"
              value={formData.ph}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="moisture"
              placeholder="Moisture (%)"
              value={formData.moisture}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Soil Type</option>
              <option value="Loamy">Loamy</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Silty">Silty</option>
            </select>
            <input
              type="text"
              name="cropIntention"
              placeholder="Target crop(s)"
              value={formData.cropIntention}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={analyzeSoil}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={20} className="animate-spin" /> Analyzing...</> : 'Analyze Soil'}
            </button>
          </CardContent>
        </Card>

        <div>
          {error && (
            <Card className="border-red-300 mb-4">
              <CardContent className="text-red-600 p-4">Error: {error}</CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Nutrient Status</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="font-semibold">N</p>
                      <p className="text-xs">{result.nutrientStatus?.nitrogen || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="font-semibold">P</p>
                      <p className="text-xs">{result.nutrientStatus?.phosphorus || 'N/A'}</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="font-semibold">K</p>
                      <p className="text-xs">{result.nutrientStatus?.potassium || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                {result.phAnalysis && (
                  <div>
                    <p className="font-semibold text-gray-700">pH Analysis</p>
                    <p className="text-gray-900">{result.phAnalysis.substring(0, 100)}...</p>
                  </div>
                )}
                {result.suitableCrops && result.suitableCrops.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700">Suitable Crops</p>
                    <p className="text-gray-900">{result.suitableCrops.slice(0, 3).join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SoilAnalysis;