export interface DiseaseResult {
  id?: string;
  timestamp: string;
  cropType: string;
  status: 'Healthy' | 'Diseased' | 'Unknown';
  diseaseName: string;
  confidenceScore: string;
  description: string;
  symptoms: string[];
  organicRemedies: string[];
  chemicalRemedies: string[];
  preventionTips: string[];
  imageUri?: string;
}

export interface YieldFactor {
  name: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  description: string;
}

export interface GrowthStage {
  stage: string;
  duration: string;
  tasks: string[];
}

export interface RiskMitigation {
  risk: string;
  mitigation: string;
}

export interface YieldResult {
  id?: string;
  timestamp: string;
  crop: string;
  region: string;
  areaSize: number;
  areaUnit: string;
  sowingMonth: string;
  rainfall: string;
  fertilizer: string;
  additionalNotes: string;
  estimatedYieldRange: string;
  yieldPerUnit: string;
  confidenceScore: string;
  factors: YieldFactor[];
  growthStages: GrowthStage[];
  riskMitigation: RiskMitigation[];
  optimizationTips: string[];
  detailedAnalysis: string;
}

export interface SoilRemedy {
  remedy: string;
  purpose: string;
  dosage: string;
}

export interface SoilResult {
  id?: string;
  timestamp: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  soilType: string;
  cropIntention: string;
  nutrientStatus: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
  phAnalysis: string;
  moistureEvaluation: string;
  suitableCrops: string[];
  unsuitableCrops: string[];
  soilConditioning: SoilRemedy[];
  fertilizerSchedule: string[];
  microbiologyInsights: string;
}

export interface ForumReply {
  authorName: string;
  content: string;
  timestamp: string;
  isAiExpert?: boolean;
}

export interface ForumPost {
  id?: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  farmLocation: string;
  timestamp: string; // ISO string for sorting convenience or Firestore timestamp
  likes: number;
  likedBy?: string[]; // list of farmer names who liked
  replies: ForumReply[];
}

export interface FarmerProfile {
  name: string;
  farmName: string;
  location: string;
  mainCrops: string;
}
