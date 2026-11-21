import type { ClosetItem } from "@/types";
import type { AvatarGarment } from "@/components/avatar/AvatarFigure";

export const garmentFrom = (item: ClosetItem | null | undefined): AvatarGarment | null =>
  item
    ? {
        key: item.key,
        category: item.category,
        color: item.color,
        graphic: item.graphic,
        design: item.design,
      }
    : null;
