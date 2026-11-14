import type { User } from "@/types";
import { ApiError, api } from "./api/client";
import { USE_MOCKS } from "./api/config";
import { ENDPOINTS } from "./api/endpoints";
import { readMock, sha256, wait, writeMock } from "./mock/storage";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const MOCK_USERS = "solstice.mock.users";
type MockRecord = { user: User; passwordHash: string };

export function usernameFrom(first: string, last: string) {
  const base = `${first}.${last.charAt(0)}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
  return base || "member";
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!USE_MOCKS) return api.post<AuthResponse>(ENDPOINTS.auth.register, payload);
    await wait();
    const db = readMock<Record<string, MockRecord>>(MOCK_USERS, {});
    const email = payload.email.trim().toLowerCase();
    if (db[email]) throw new ApiError("An account with this email already exists.", 409);

    const taken = new Set(Object.values(db).map((r) => r.user.username));
    let username = usernameFrom(payload.firstName, payload.lastName);
    for (let n = 2; taken.has(username); n++) username = `${usernameFrom(payload.firstName, payload.lastName)}${n}`;

    const user: User = {
      id: `u_${crypto.randomUUID().slice(0, 8)}`,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email,
      phone: payload.phone.trim(),
      username,
      createdAt: new Date().toISOString(),
      avatar: null,
      equippedKey: null,
    };
    db[email] = { user, passwordHash: await sha256(payload.password) };
    writeMock(MOCK_USERS, db);
    return { user, token: `mock.${user.id}` };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!USE_MOCKS) return api.post<AuthResponse>(ENDPOINTS.auth.login, { email, password });
    await wait();
    const db = readMock<Record<string, MockRecord>>(MOCK_USERS, {});
    const record = db[email.trim().toLowerCase()];
    if (!record || record.passwordHash !== (await sha256(password))) {
      throw new ApiError("Email or password is incorrect.", 401);
    }
    return { user: record.user, token: `mock.${record.user.id}` };
  },

  /** Persist profile changes (avatar, equipped item) so a later login restores them. */
  async saveUser(user: User): Promise<User> {
    if (!USE_MOCKS) return api.patch<User>(ENDPOINTS.auth.me, user);
    const db = readMock<Record<string, MockRecord>>(MOCK_USERS, {});
    const record = db[user.email];
    if (record) {
      db[user.email] = { ...record, user };
      writeMock(MOCK_USERS, db);
    }
    return user;
  },

  async logout(): Promise<void> {
    if (!USE_MOCKS) await api.post(ENDPOINTS.auth.logout);
  },
};
