import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Upload, Loader } from 'lucide-react';

function DiseaseDetection() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState('');
  const [userNotes, setUserNotes] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    try {
      const base64Data = image.split(',')[1];
      const response = await fetch('/api/disease-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          mimeType: 'image/jpeg',
          cropHint,
          userNotes,
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Disease Detection</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Leaf Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {image ? (
                <img src={image} alt="Uploaded" className="max-h-64 mx-auto rounded" />
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800 font-semibold">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>

            <input
              type="text"
              placeholder="Crop type (optional, e.g., 'Wheat', 'Rice')"
              value={cropHint}
              onChange={(e) => setCropHint(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <textarea
              placeholder="Additional observations or symptoms (optional)"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />

            <button
              onClick={analyzeImage}
              disabled={!image || loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={20} className="animate-spin" /> Analyzing...</> : 'Analyze Image'}
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
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700">Crop Type</p>
                  <p className="text-lg text-gray-900">{result.cropType}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Health Status</p>
                  <p className={`text-lg font-bold ${result.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.status}
                  </p>
                </div>
                {result.diseaseName && result.status === 'Diseased' && (
                  <div>
                    <p className="font-semibold text-gray-700">Disease</p>
                    <p className="text-lg text-gray-900">{result.diseaseName}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-700">Confidence</p>
                  <p className="text-lg text-gray-900">{result.confidenceScore}</p>
                </div>
                {result.organicRemedies && result.organicRemedies.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700">Organic Remedies</p>
                    <ul className="list-disc list-inside text-gray-900">
                      {result.organicRemedies.map((remedy: string, idx: number) => (
                        <li key={idx}>{remedy}</li>
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

export default DiseaseDetection;