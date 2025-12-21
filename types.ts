
export type ConsultingField = 'Strategy' | 'Marketing' | 'Operations' | 'Finance' | 'Product';
export type BusinessType = 'SME' | 'Startup' | 'Enterprise' | 'Freelancer' | 'Non-Profit';
export type CompanySize = 'Solo (1)' | 'Startup (2-10)' | 'SME (11-50)' | 'Mid-Market (51-500)' | 'Enterprise (500+)';
export type Region = 'North America' | 'Europe' | 'Asia Pacific' | 'LATAM' | 'MEA' | 'Global';
export type CustomerType = 'B2B' | 'B2C' | 'Hybrid' | 'B2G';
export type CompetitorPreference = 'Global' | 'Regional' | 'Specific Country';
export type BusinessModel = 'SaaS' | 'Services' | 'Ecommerce' | 'Marketplace' | 'Hybrid' | 'Manufacturing';
export type MarketIntensity = 'Low' | 'Medium' | 'High';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface StrategicPriority {
  id: string;
  label: string;
  selected: boolean;
}

export interface CompanyDNA {
  website?: string;
  productSummary: string;
  targetCustomer: CustomerType;
  businessModel: BusinessModel;
  industry: string;
  subIndustry?: string;
  marketScope: 'Global' | 'Regional' | 'Local';
  growthRegions: string[];
  competitiveIntensity: MarketIntensity;
  strategicPriorities: string[];
  confidenceLevel: ConfidenceLevel;
  pricingModel: string;
  primaryGoal: string;
  secondaryGoal?: string;
  brandIdentity: {
    tone: string;
    colors: string;
    vibe: string;
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  competitorPreference: CompetitorPreference;
  challenges: string[];
  permissions: {
    allowWebScraping: boolean;
    allowCompetitorAnalysis: boolean;
    allowRealTimeAlerts: boolean;
  };
  lastAnalysisDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  industry: string;
  size: CompanySize;
  region: Region;
  country: string;
  dna: CompanyDNA;
  language: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  content: string; 
  mimeType: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  goal: string;
  timeframe: string;
  audience: string;
  budget: string;
  website?: string;
  kpis: string[];
  intent: string;
  files: ProjectFile[];
  tasks: ProjectTask[];
  createdAt: string;
  lastActive: string;
}

export interface MarketingAsset {
  id: string;
  channel: 'Email' | 'LinkedIn' | 'Twitter' | 'Instagram' | 'Blog' | 'Ad';
  title: string;
  content: string; 
  visualPrompt?: string; 
  tags: string[];
  status: 'Ready' | 'Draft' | 'Published';
  timestamp: string;
  isNew?: boolean;
  isImage?: boolean;
  imageData?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date | string;
  isError?: boolean;
  artifact?: ArtifactData;
  groundingMetadata?: any;
  attachments?: ProjectFile[];
}

export interface StrategicReport {
  id: string;
  title: string;
  date: string;
  type: 'Risk' | 'Opportunity' | 'Market Shift';
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  summary: string;
  content: string; 
  companiesInvolved: string[];
}

export type ArtifactType = 'chart' | 'framework' | 'kpi' | 'image_request' | 'image';
export interface ArtifactData {
  type: ArtifactType;
  title: string;
  data: any;
}

export enum AppRoute {
  LOGIN = '/login',
  REGISTER = '/register',
  CHAT = '/chat',
}
