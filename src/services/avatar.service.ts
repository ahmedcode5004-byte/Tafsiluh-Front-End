import type { AvatarProfile } from "@/types";
import { api } from "./api/client";
import { USE_MOCKS } from "./api/config";
import { ENDPOINTS } from "./api/endpoints";
import { wait } from "./mock/storage";

export const avatarService = {
  async save(avatar: AvatarProfile): Promise<AvatarProfile> {
    if (USE_MOCKS) {
      await wait(250);
      return avatar;
    }
    return api.put<AvatarProfile>(ENDPOINTS.avatar.me, avatar);
  },
};
