
import { User, Signal, MarketingAsset, StrategicReport, Project, Message } from "../types";

const DB_KEY = "consult_ai_vault";

export interface Consultation {
  id: string;
  userId: string;
  title: string;
  timestamp: string;
  messages: { role: 'user' | 'model'; content: string }[];
}

interface Vault {
  users: Record<string, { user: User; pass: string }>;
  session: string | null;
  signals: Signal[];
  assets: MarketingAsset[];
  reports: StrategicReport[];
  projects: Project[];
  consultations: Consultation[];
}

const getVault = (): Vault => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : { users: {}, session: null, signals: [], assets: [], reports: [], projects: [], consultations: [] };
};

const saveVault = (vault: Vault) => {
  localStorage.setItem(DB_KEY, JSON.stringify(vault));
};

export const db = {
  auth: {
    register: (user: User, pass: string) => {
      const v = getVault();
      v.users[user.email] = { user, pass };
      v.session = user.id;
      saveVault(v);
    },
    login: (email: string, pass: string): User | null => {
      const v = getVault();
      const entry = v.users[email];
      if (entry && entry.pass === pass) {
        v.session = entry.user.id;
        saveVault(v);
        return entry.user;
      }
      return null;
    },
    logout: () => {
      const v = getVault();
      v.session = null;
      saveVault(v);
    },
    getCurrentUser: (): User | null => {
      const v = getVault();
      if (!v.session) return null;
      return Object.values(v.users).find(u => u.user.id === v.session)?.user || null;
    },
    getSession: (): User | null => {
      const v = getVault();
      if (!v.session) return null;
      const userEntry = Object.values(v.users).find(u => u.user.id === v.session);
      return userEntry ? userEntry.user : null;
    },
    setSession: (user: User) => {
      const v = getVault();
      v.session = user.id;
      saveVault(v);
    },
    updateUser: (user: User) => {
      const v = getVault();
      if (v.users[user.email]) {
        v.users[user.email].user = user;
        saveVault(v);
      }
    }
  },
  projects: {
    list: async (userId: string): Promise<Project[]> => {
      const v = getVault();
      return v.projects || [];
    },
    create: async (userId: string, project: Project) => {
      const v = getVault();
      if (!v.projects) v.projects = [];
      v.projects.unshift(project);
      saveVault(v);
    },
    update: async (userId: string, project: Project) => {
      const v = getVault();
      v.projects = v.projects?.map(p => p.id === project.id ? project : p) || [];
      saveVault(v);
    },
    delete: async (userId: string, projectId: string) => {
      const v = getVault();
      v.projects = v.projects?.filter(p => p.id !== projectId) || [];
      saveVault(v);
    }
  },
  consultations: {
    list: (userId: string): Consultation[] => {
      const v = getVault();
      return (v.consultations || []).filter(c => c.userId === userId);
    },
    save: (consultation: Consultation) => {
      const v = getVault();
      if (!v.consultations) v.consultations = [];
      const index = v.consultations.findIndex(c => c.id === consultation.id);
      if (index >= 0) {
        v.consultations[index] = consultation;
      } else {
        v.consultations.unshift(consultation);
      }
      saveVault(v);
    },
    delete: (id: string) => {
      const v = getVault();
      v.consultations = (v.consultations || []).filter(c => c.id !== id);
      saveVault(v);
    }
  },
  artifacts: {
    listMarketingAssets: async (userId: string): Promise<MarketingAsset[]> => {
      const v = getVault();
      return v.assets || [];
    },
    saveMarketingAssets: async (userId: string, assets: MarketingAsset[]) => {
      const v = getVault();
      if (!v.assets) v.assets = [];
      v.assets = [...assets, ...v.assets];
      saveVault(v);
    },
    listReports: async (userId: string): Promise<StrategicReport[]> => {
      const v = getVault();
      return v.reports || [];
    },
    saveReport: async (userId: string, report: StrategicReport) => {
      const v = getVault();
      if (!v.reports) v.reports = [];
      v.reports.unshift(report);
      saveVault(v);
    }
  },
  signals: {
    save: (signals: Signal[]) => {
      const v = getVault();
      v.signals = signals;
      saveVault(v);
    },
    list: () => getVault().signals
  },
  assets: {
    save: (asset: MarketingAsset) => {
      const v = getVault();
      v.assets.unshift(asset);
      saveVault(v);
    },
    list: () => getVault().assets
  },
  reports: {
    save: (report: StrategicReport) => {
      const v = getVault();
      v.reports.unshift(report);
      saveVault(v);
    },
    list: () => getVault().reports
  }
};
