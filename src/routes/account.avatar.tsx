import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { closetFromOrders, useOrdersStore } from "@/store/orders";
import { garmentFrom } from "@/lib/account";
import { toastSuccess } from "@/lib/alerts";
import { AvatarStudio } from "@/components/avatar/AvatarStudio";

export const Route = createFileRoute("/account/avatar")({
  component: AvatarPage,
});

function AvatarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const saveAvatar = useAuthStore((s) => s.saveAvatar);
  const orders = useOrdersStore((s) => s.orders);
  const [saving, setSaving] = useState(false);
  const closet = closetFromOrders(orders.filter((o) => o.userId === user.id));
  const worn = closet.find((c) => c.key === user.equippedKey);

  return (
    <AvatarStudio
      initialMeasurements={user.avatar?.measurements}
      initialLook={user.avatar?.look}
      garment={garmentFrom(worn)}
      saving={saving}
      onSave={async (measurements, look) => {
        setSaving(true);
        await saveAvatar({ measurements, look });
        setSaving(false);
        void toastSuccess("Avatar saved");
      }}
      secondaryAction={{ label: "Open my closet", onClick: () => void navigate({ to: "/account/closet" }) }}
    />
  );
}
