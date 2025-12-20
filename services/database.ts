
import { User, ChatSession, Project } from '../types';

const KEYS = {
  USERS: 'consult_ai_db_users',
  CHATS: 'consult_ai_db_chats',
  SESSION: 'consult_ai_db_session',
  PROJECTS: 'consult_ai_db_projects',
};

interface StoredUser {
  user: User;
  passwordHash: string; 
}

interface UserDatabase {
  [email: string]: StoredUser;
}

interface ChatDatabase {
  [userId: string]: ChatSession[];
}

interface ProjectDatabase {
  [userId: string]: Project[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const safeParse = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

export const db = {
  auth: {
    async register(user: User, password: string): Promise<User> {
      await delay(500);
      const users: UserDatabase = safeParse(KEYS.USERS, {});
      if (users[user.email]) throw new Error("Email registered.");
      users[user.email] = { user, passwordHash: btoa(password) };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      this.setSession(user);
      return user;
    },

    async login(email: string, password: string): Promise<User> {
      await delay(500);
      const users: UserDatabase = safeParse(KEYS.USERS, {});
      const stored = users[email];
      if (!stored || stored.passwordHash !== btoa(password)) throw new Error("Invalid credentials.");
      this.setSession(stored.user);
      return stored.user;
    },

    async updateProfile(user: User): Promise<User> {
      await delay(300);
      const users: UserDatabase = safeParse(KEYS.USERS, {});
      if (!users[user.email]) throw new Error("User not found");
      users[user.email] = { ...users[user.email], user: user };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      this.setSession(user);
      return user;
    },

    async logout(): Promise<void> {
      localStorage.removeItem(KEYS.SESSION);
    },

    getSession(): User | null {
      return safeParse(KEYS.SESSION, null);
    },

    setSession(user: User) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    }
  },

  chats: {
    async list(userId: string): Promise<ChatSession[]> {
      const allChats: ChatDatabase = safeParse(KEYS.CHATS, {});
      return allChats[userId] || [];
    },

    async save(userId: string, session: ChatSession): Promise<void> {
      const allChats: ChatDatabase = safeParse(KEYS.CHATS, {});
      let userChats = allChats[userId] || [];
      userChats = userChats.filter(s => s.id !== session.id);
      userChats.unshift(session);
      allChats[userId] = userChats;
      localStorage.setItem(KEYS.CHATS, JSON.stringify(allChats));
    },

    async delete(userId: string, sessionId: string): Promise<void> {
      const allChats: ChatDatabase = safeParse(KEYS.CHATS, {});
      if (!allChats[userId]) return;
      allChats[userId] = allChats[userId].filter(s => s.id !== sessionId);
      localStorage.setItem(KEYS.CHATS, JSON.stringify(allChats));
    }
  },

  projects: {
    async list(userId: string): Promise<Project[]> {
      const allProjects: ProjectDatabase = safeParse(KEYS.PROJECTS, {});
      return allProjects[userId] || [];
    },

    async create(userId: string, project: Project): Promise<Project> {
      const allProjects: ProjectDatabase = safeParse(KEYS.PROJECTS, {});
      const userProjects = allProjects[userId] || [];
      userProjects.unshift(project);
      allProjects[userId] = userProjects;
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(allProjects));
      return project;
    },

    async update(userId: string, project: Project): Promise<Project> {
       const allProjects: ProjectDatabase = safeParse(KEYS.PROJECTS, {});
       let userProjects = allProjects[userId] || [];
       userProjects = userProjects.map(p => p.id === project.id ? project : p);
       allProjects[userId] = userProjects;
       localStorage.setItem(KEYS.PROJECTS, JSON.stringify(allProjects));
       return project;
    },

    async delete(userId: string, projectId: string): Promise<void> {
      const allProjects: ProjectDatabase = safeParse(KEYS.PROJECTS, {});
      if (!allProjects[userId]) return;
      allProjects[userId] = allProjects[userId].filter(p => p.id !== projectId);
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(allProjects));
    }
  }
};
