import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { TrendingUp, Loader } from 'lucide-react';

function YieldPrediction() {
  const [formData, setFormData] = useState({
    crop: '',
    region: '',
    areaSize: '',
    areaUnit: 'Acres',
    sowingMonth: '',
    rainfall: '',
    fertilizer: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const predictYield = async () => {
    if (!formData.crop || !formData.areaSize) {
      setError('Please fill in required fields: Crop and Area Size');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/yield-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Prediction failed');
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Yield Prediction</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              name="crop"
              placeholder="Crop type (e.g., Wheat, Rice)*"
              value={formData.crop}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="region"
              placeholder="Region/Soil context"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="areaSize"
                placeholder="Area size*"
                value={formData.areaSize}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                name="areaUnit"
                value={formData.areaUnit}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Acres</option>
                <option>Hectares</option>
                <option>Square meters</option>
              </select>
            </div>
            <input
              type="text"
              name="sowingMonth"
              placeholder="Sowing month/season"
              value={formData.sowingMonth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="rainfall"
              placeholder="Expected rainfall"
              value={formData.rainfall}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="fertilizer"
              placeholder="Fertilizer input"
              value={formData.fertilizer}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              name="additionalNotes"
              placeholder="Additional notes"
              value={formData.additionalNotes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
            <button
              onClick={predictYield}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={20} className="animate-spin" /> Predicting...</> : <><TrendingUp size={20} /> Predict Yield</>
              }
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
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700">Estimated Yield Range</p>
                  <p className="text-lg font-bold text-green-600">{result.estimatedYieldRange}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Yield Per Unit</p>
                  <p className="text-lg text-gray-900">{result.yieldPerUnit}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Confidence Score</p>
                  <p className="text-lg text-gray-900">{result.confidenceScore}</p>
                </div>
                {result.optimizationTips && result.optimizationTips.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700">Optimization Tips</p>
                    <ul className="list-disc list-inside text-sm text-gray-900">
                      {result.optimizationTips.slice(0, 3).map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
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

export default YieldPrediction;