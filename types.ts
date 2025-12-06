

export type ConsultingField = 
  | 'Strategy' 
  | 'Marketing' 
  | 'Operations' 
  | 'HR' 
  | 'IT' 
  | 'Finance' 
  | 'Legal' 
  | 'Product' 
  | 'Customer Experience' 
  | 'Sustainability';

export type BusinessType = 'SME' | 'Startup' | 'Enterprise' | 'Freelancer' | 'Non-Profit';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
export type Region = 'North America' | 'Europe' | 'Asia Pacific' | 'LATAM' | 'MEA';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert';
export type MainGoal = 'Improve Revenue' | 'Analyze Competitors' | 'Explore Market' | 'Boost Marketing' | 'Everything';

export interface PersonalizationSettings {
  industry: string;
  businessType: BusinessType;
  toneValue: number; // 0-100
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Professional Profile
  companyName: string;
  industry: string;
  size: CompanySize;
  region: Region;
  description?: string; // New: Company description for deeper AI context
  // Strategic Profile
  goal: MainGoal;
  skillLevel: SkillLevel;
  // System
  language: string;
}

export type ArtifactType = 'chart' | 'swot' | 'kpi' | 'roadmap' | 'image_request' | 'image' | 'framework';

export interface ArtifactData {
  type: ArtifactType;
  title: string;
  data: any;
}

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
  }>;
  webSearchQueries?: string[];
}

export interface StreamChunk {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date | string;
  isError?: boolean;
  artifact?: ArtifactData;
  groundingMetadata?: GroundingMetadata;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}

export interface StrategicReport {
  id: string;
  title: string;
  date: string;
  type: 'Risk' | 'Opportunity' | 'Market Shift';
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  summary: string;
  content: string; // Markdown content
  companiesInvolved: string[];
}

export enum AppRoute {
  LOGIN = '/login',
  REGISTER = '/register',
  CHAT = '/chat',
}

// --- REAL TIME DATA MODELS ---

export interface OverviewMetrics {
  marketPosition: { score: number; rank: string; change: string; context: string };
  opportunityIndex: { score: number; level: string; topSector: string; heatMap: number[] };
  strategyFit: { score: number; alignment: string; gap: string };
  campaignForecast: { score: number; predictedReach: string; sentiment: string; trend: number[] };
}

export interface CompetitorData {
  id: string;
  name: string;
  marketShare: number;
  sentiment: number;
  growth: number;
  pricingStatus: 'stable' | 'increased' | 'decreased';
  lastUpdate: Date;
  location?: { lat: number; lng: number; city: string }; // New: Geolocation
}

export interface MarketMetric {
  label: string;
  value: number; // Raw value
  displayValue: string; // Formatted
  change: number;
  trend: 'up' | 'down' | 'neutral';
  history: number[]; // For sparklines
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  source: 'market' | 'competitor' | 'internal';
  read: boolean;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: 'LinkedIn' | 'Twitter' | 'Email' | 'Instagram';
  status: 'draft' | 'scheduled' | 'active';
  content: string;
  targetAudience: string;
}