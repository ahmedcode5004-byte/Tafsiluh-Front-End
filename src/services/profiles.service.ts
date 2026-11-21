import { COMMUNITY_PROFILES } from "@/data/community";
import type { PublicProfile } from "@/types";
import { ApiError, api } from "./api/client";
import { USE_MOCKS } from "./api/config";
import { ENDPOINTS } from "./api/endpoints";

export const profilesService = {
  async getByUsername(username: string): Promise<PublicProfile | null> {
    if (USE_MOCKS) return COMMUNITY_PROFILES.find((p) => p.username === username) ?? null;
    try {
      return await api.get<PublicProfile>(ENDPOINTS.profiles.byUsername(username));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  listFeatured(): PublicProfile[] {
    return COMMUNITY_PROFILES;
  },
};
