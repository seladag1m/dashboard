
import { User, ChatSession } from '../types';

// Storage Keys
const KEYS = {
  USERS: 'consult_ai_db_users',
  CHATS: 'consult_ai_db_chats',
  SESSION: 'consult_ai_db_session',
};

// Types for internal storage
interface StoredUser {
  user: User;
  passwordHash: string; // In a real app, this would be hashed. Storing plain/simple for mock.
}

interface UserDatabase {
  [email: string]: StoredUser;
}

interface ChatDatabase {
  [userId: string]: ChatSession[];
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  auth: {
    async register(user: User, password: string): Promise<User> {
      await delay(800);
      
      const users: UserDatabase = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}');
      
      if (users[user.email]) {
        throw new Error("An account with this email already exists.");
      }

      // Save User
      users[user.email] = {
        user,
        passwordHash: btoa(password), // Simple encoding for mock purposes
      };
      
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      
      // Set Session
      this.setSession(user);
      return user;
    },

    async login(email: string, password: string): Promise<User> {
      await delay(800);
      
      const users: UserDatabase = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}');
      const stored = users[email];

      if (!stored) {
        throw new Error("Invalid email or password.");
      }

      if (stored.passwordHash !== btoa(password)) {
         throw new Error("Invalid email or password.");
      }

      // Set Session
      this.setSession(stored.user);
      return stored.user;
    },

    async updateProfile(user: User): Promise<User> {
      await delay(500);
      const users: UserDatabase = JSON.parse(localStorage.getItem(KEYS.USERS) || '{}');
      
      // We assume email doesn't change for this simple mock ID logic
      if (!users[user.email]) throw new Error("User not found");
      
      users[user.email] = {
        ...users[user.email],
        user: user
      };
      
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      this.setSession(user);
      return user;
    },

    async logout(): Promise<void> {
      await delay(200);
      localStorage.removeItem(KEYS.SESSION);
    },

    getSession(): User | null {
      try {
        const json = localStorage.getItem(KEYS.SESSION);
        return json ? JSON.parse(json) : null;
      } catch (e) {
        return null;
      }
    },

    setSession(user: User) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    }
  },

  chats: {
    async list(userId: string): Promise<ChatSession[]> {
      try {
        const allChats: ChatDatabase = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
        return allChats[userId] || [];
      } catch (e) {
        return [];
      }
    },

    async getLatest(userId: string): Promise<ChatSession | null> {
      const chats = await this.list(userId);
      return chats.length > 0 ? chats[0] : null;
    },

    async save(userId: string, session: ChatSession): Promise<void> {
      const allChats: ChatDatabase = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
      let userChats = allChats[userId] || [];
      
      // Remove if exists (to re-insert at top)
      userChats = userChats.filter(s => s.id !== session.id);
      
      // Add to top (Most recent)
      userChats.unshift(session);
      
      allChats[userId] = userChats;
      localStorage.setItem(KEYS.CHATS, JSON.stringify(allChats));
    },

    async delete(userId: string, sessionId: string): Promise<void> {
      const allChats: ChatDatabase = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
      if (!allChats[userId]) return;

      allChats[userId] = allChats[userId].filter(s => s.id !== sessionId);
      localStorage.setItem(KEYS.CHATS, JSON.stringify(allChats));
    },

    async clearAll(userId: string): Promise<void> {
      const allChats: ChatDatabase = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
      delete allChats[userId];
      localStorage.setItem(KEYS.CHATS, JSON.stringify(allChats));
    }
  },

  // Developer/Production Utilities
  utils: {
    clearAll: async () => {
       localStorage.removeItem(KEYS.USERS);
       localStorage.removeItem(KEYS.CHATS);
       localStorage.removeItem(KEYS.SESSION);
       await delay(500);
    }
  }
};
