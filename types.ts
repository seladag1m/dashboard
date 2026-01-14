
export type BusinessModel = 'SaaS' | 'Services' | 'Ecommerce' | 'Marketplace' | 'Hybrid' | 'Manufacturing';
export type CompanySize = 'Solo (1)' | 'Startup (2-10)' | 'SME (11-50)' | 'Mid-Market (51-500)' | 'Enterprise (500+)';
export type CustomerType = 'B2B' | 'B2C' | 'Hybrid' | 'B2G';
export type GrowthStage = 'Early' | 'Scaling' | 'Mature' | 'At Risk';
export type StrategicPriority = 'Growth' | 'Efficiency' | 'Expansion' | 'Survival' | 'Defense' | 'Authority';

export interface BusinessDNA {
  companyName: string;
  industry: string;
  businessModel: BusinessModel;
  customerSegment: CustomerType;
  operatingMarkets: string[];
  size: CompanySize;
  stage: GrowthStage;
  strategicGoals: StrategicPriority[];
  riskTolerance: 'Low' | 'Medium' | 'High';
  manualCompetitors: string[];
  website?: string;
  description?: string;
  valueProposition?: string;
  toneOfVoice?: string;
  stockTicker?: string;
  stockExchange?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  enrichedData?: {
    marketContext: string;
    competitorIntel: string;
    lastScan: string;
    autoFilledFields?: string[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  dna: BusinessDNA;
}

export interface Signal {
  id: string;
  type: 'Opportunity' | 'Threat' | 'Caution' | 'Strike Zone';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  timestamp: string;
  strategicMove: string;
  category?: string;
  time?: string;
  desc?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: string;
  timeline: string;
  objective: string;
  constraints: string[];
  status: 'Active' | 'Paused' | 'Completed';
  createdAt: string;
  goal: string;
  type: string;
  timeframe: string;
  audience: string;
  files: ProjectFile[];
  tasks: ProjectTask[];
  kpis: any[];
  intent: string;
  lastActive: string;
  templateId?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  mimeType: string;
  content: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachments?: ProjectFile[];
  artifact?: ArtifactData;
  isError?: boolean;
}

export interface ArtifactData {
  type: 'chart' | 'framework' | 'kpi' | 'image_request' | 'image';
  title: string;
  data: any;
}

export interface MarketingAsset {
  id: string;
  channel: 'Email' | 'LinkedIn' | 'Twitter' | 'Instagram' | 'Blog' | 'Social Video';
  title: string;
  content: string;
  imageData?: string;
  videoUrl?: string;
  timestamp: string;
  tags: string[];
  aspectRatio?: '16:9' | '9:16';
  visualPrompt?: string;
}

export interface StrategicReport {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

export enum AppRoute {
  LANDING = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/dashboard',
  CHAT = '/chat',
}