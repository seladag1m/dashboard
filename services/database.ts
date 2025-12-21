
import { User, Project, StrategicReport, MarketingAsset } from '../types';

const KEYS = {
  USERS: 'consult_ai_db_users',
  SESSION: 'consult_ai_db_session',
  PROJECTS: 'consult_ai_db_projects',
  CHATS: 'consult_ai_db_chats',
  REPORTS: 'consult_ai_db_reports',
  MARKETING: 'consult_ai_db_marketing'
};

const safeParse = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    return JSON.parse(item);
  } catch (e) {
    return defaultVal;
  }
};

const safeSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("DB Save Failed", e);
  }
};

export const db = {
  auth: {
    async register(user: User, password: string): Promise<User> {
      const users = safeParse<Record<string, { user: User; passwordHash: string }>>(KEYS.USERS, {});
      if (users[user.email]) throw new Error("Entity already exists.");
      users[user.email] = { user, passwordHash: btoa(password) };
      safeSave(KEYS.USERS, users);
      this.setSession(user);
      return user;
    },
    async login(email: string, password: string): Promise<User> {
      const users = safeParse<Record<string, { user: User; passwordHash: string }>>(KEYS.USERS, {});
      const entry = users[email];
      if (!entry || entry.passwordHash !== btoa(password)) throw new Error("Access Denied: Invalid Credentials.");
      this.setSession(entry.user);
      return entry.user;
    },
    async logout() { localStorage.removeItem(KEYS.SESSION); },
    getSession(): User | null { return safeParse<User | null>(KEYS.SESSION, null); },
    setSession(user: User) { safeSave(KEYS.SESSION, user); }
  },
  projects: {
    async list(userId: string): Promise<Project[]> {
      const all = safeParse<Record<string, Project[]>>(KEYS.PROJECTS, {});
      return all[userId] || [];
    },
    async create(userId: string, project: Project): Promise<Project> {
      const all = safeParse<Record<string, Project[]>>(KEYS.PROJECTS, {});
      const userProjects = all[userId] || [];
      userProjects.unshift(project);
      all[userId] = userProjects;
      safeSave(KEYS.PROJECTS, all);
      return project;
    },
    async delete(userId: string, projectId: string) {
      const all = safeParse<Record<string, Project[]>>(KEYS.PROJECTS, {});
      if (all[userId]) {
        all[userId] = all[userId].filter(p => p.id !== projectId);
        safeSave(KEYS.PROJECTS, all);
      }
    }
  },
  artifacts: {
    async saveReport(userId: string, report: StrategicReport) {
      const all = safeParse<Record<string, StrategicReport[]>>(KEYS.REPORTS, {});
      const userReports = all[userId] || [];
      userReports.unshift(report);
      all[userId] = userReports;
      safeSave(KEYS.REPORTS, all);
    },
    async listReports(userId: string): Promise<StrategicReport[]> {
      const all = safeParse<Record<string, StrategicReport[]>>(KEYS.REPORTS, {});
      return all[userId] || [];
    },
    async saveMarketingAssets(userId: string, assets: MarketingAsset[]) {
      const all = safeParse<Record<string, MarketingAsset[]>>(KEYS.MARKETING, {});
      const userAssets = all[userId] || [];
      const combined = [...assets, ...userAssets];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      all[userId] = unique;
      safeSave(KEYS.MARKETING, all);
    },
    async listMarketingAssets(userId: string): Promise<MarketingAsset[]> {
      const all = safeParse<Record<string, MarketingAsset[]>>(KEYS.MARKETING, {});
      return all[userId] || [];
    }
  }
};
