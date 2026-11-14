import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { profilesService } from "@/services/profiles.service";
import { useAuthStore } from "@/store/auth";
import { closetFromOrders, useOrdersStore } from "@/store/orders";
import { garmentFrom } from "@/lib/account";
import { tint } from "@/lib/color";
import { formatDate } from "@/lib/format";
import { DEFAULT_MEASUREMENTS } from "@/lib/sizing";
import { AvatarFigure } from "@/components/avatar/AvatarFigure";
import { DEFAULT_LOOK } from "@/components/avatar/looks";
import { GarmentArt } from "@/components/shop/GarmentArt";
import type { PublicProfile } from "@/types";

const profileQuery = (username: string) =>
  queryOptions({
    queryKey: ["profiles", username],
    queryFn: () => profilesService.getByUsername(username),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/profile/$username")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(profileQuery(params.username)),
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username}'s closet — SOLSTICE` },
      { name: "description", content: `See @${params.username}'s avatar and unlocked SOLSTICE wardrobe.` },
      { property: "og:title", content: `@${params.username}'s closet — SOLSTICE` },
      { property: "og:description", content: `See @${params.username}'s avatar and unlocked wardrobe.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { data: remote } = useSuspenseQuery(profileQuery(username));
  const user = useAuthStore((s) => s.user);
  const orders = useOrdersStore((s) => s.orders);

  // Your own profile is built from your session so it shows before the API knows about it.
  const own: PublicProfile | null =
    user && user.username === username
      ? {
          username: user.username,
          displayName: `${user.firstName} ${user.lastName.charAt(0)}.`,
          bio: "",
          avatar: user.avatar ?? { measurements: DEFAULT_MEASUREMENTS, look: DEFAULT_LOOK, updatedAt: user.createdAt },
          closet: closetFromOrders(orders.filter((o) => o.userId === user.id)),
          equippedKey: user.equippedKey,
          joinedAt: user.createdAt,
        }
      : null;
  const profile = own ?? remote;

  if (!profile) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl font-semibold">No closet at @{username}</h1>
        <Link to="/" className="mt-6 inline-block font-semibold underline">Back home</Link>
      </div>
    );
  }
  return <ProfileView profile={profile} isOwn={!!own} />;
}

function ProfileView({ profile, isOwn }: { profile: PublicProfile; isOwn: boolean }) {
  const [preview, setPreview] = useState<string | null>(profile.equippedKey);
  const worn = profile.closet.find((c) => c.key === preview) ?? null;

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[400px_1fr]">
      <div className="h-fit rounded-[2rem] bg-stage p-6 lg:sticky lg:top-24">
        <p className="eyebrow text-muted-foreground">@{profile.username}</p>
        <h1 className="mt-1 text-4xl font-semibold">{profile.displayName}</h1>
        {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
        <div className="mx-auto h-[440px]">
          <AvatarFigure measurements={profile.avatar.measurements} look={profile.avatar.look} garment={garmentFrom(worn)} label={`${profile.displayName}'s avatar`} />
        </div>
        <p className="text-center text-xs text-muted-foreground">Member since {formatDate(profile.joinedAt)}</p>
      </div>

      <div>
        <p className="eyebrow text-season-deep">Unlocked wardrobe</p>
        <h2 className="mt-2 text-3xl font-semibold">{profile.closet.length} {profile.closet.length === 1 ? "piece" : "pieces"}</h2>
        {profile.closet.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            {isOwn ? "Your delivered pieces will show up here." : "Nothing unlocked yet."}
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-3">
            {profile.closet.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => setPreview(c.key)}
                  data-active={c.key === preview}
                  className="w-full rounded-3xl bg-card p-4 text-left ring-1 ring-border transition hover:-translate-y-1 data-[active=true]:ring-2 data-[active=true]:ring-foreground"
                >
                  <div className="aspect-square rounded-2xl p-4" style={{ background: tint(c.color.hex, 24) }}>
                    <GarmentArt category={c.category} color={c.color.hex} graphic={c.graphic} />
                  </div>
                  <p className="mt-3 font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.color.name} · {c.size}</p>
                </button>
                <Link to="/product/$slug" params={{ slug: c.slug }} className="mt-2 block text-xs font-semibold underline">Shop this piece</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
