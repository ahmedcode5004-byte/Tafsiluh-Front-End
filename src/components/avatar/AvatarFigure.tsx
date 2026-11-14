import { AnimatePresence, motion } from "framer-motion";
import { useId, useMemo } from "react";
import type { AvatarLook, Category, Measurements, ProductColor } from "@/types";
import { isLight, shade } from "@/lib/color";
import { cn } from "@/lib/utils";
import { VIEW_H, VIEW_W, buildBody, buildGarment, type BodyGeometry } from "./geometry";

export interface AvatarGarment {
  key: string;
  category: Category;
  color: ProductColor;
  graphic?: string | undefined;
}

interface Props {
  measurements: Measurements;
  look: AvatarLook;
  garment?: AvatarGarment | null;
  className?: string;
  idle?: boolean;
  label?: string;
}

const morph = { type: "spring", stiffness: 120, damping: 18, mass: 0.8 } as const;
const UNDERSHIRT: AvatarGarment = {
  key: "base",
  category: "tshirt",
  color: { name: "Base", hex: "#D9D4CA" },
};

export function AvatarFigure({ measurements, look, garment, className, idle = true, label }: Props) {
  const g = useMemo(() => buildBody(measurements), [measurements]);
  const worn = garment ?? UNDERSHIRT;
  const gid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={cn("h-full w-full overflow-visible", className)}
      role="img"
      aria-label={label ?? "Avatar preview"}
    >
      <defs>
        <radialGradient id={`skin-${gid}`} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor={look.skin} />
          <stop offset="100%" stopColor={shade(look.skin, 88)} />
        </radialGradient>
      </defs>

      <motion.ellipse
        cx={VIEW_W / 2}
        initial={false}
        animate={{ cy: g.floor + 6, rx: g.hipHalf + 40, ry: 10 }}
        transition={morph}
        fill="var(--avatar-shadow)"
      />

      <motion.g
        animate={idle ? { y: [0, -3, 0] } : { y: 0 }}
        transition={idle ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <HairBack g={g} look={look} />

        {/* skin */}
        <motion.path initial={false} animate={{ d: g.armL }} transition={morph} fill={`url(#skin-${gid})`} />
        <motion.path initial={false} animate={{ d: g.armR }} transition={morph} fill={`url(#skin-${gid})`} />
        <motion.path initial={false} animate={{ d: g.body }} transition={morph} fill={`url(#skin-${gid})`} />

        {/* base layer */}
        <motion.path initial={false} animate={{ d: g.pants }} transition={morph} fill="var(--avatar-pants)" />
        <Shoes g={g} />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.g
            key={worn.key}
            initial={{ opacity: 0, y: -46, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            style={{ transformOrigin: "160px 260px" }}
          >
            <Garment g={g} garment={worn} />
          </motion.g>
        </AnimatePresence>

        {/* hands */}
        <motion.circle
          initial={false}
          animate={{ cx: g.handR[0], cy: g.handR[1], r: g.wristW * 1.35 }}
          transition={morph}
          fill={look.skin}
        />
        <motion.circle
          initial={false}
          animate={{ cx: g.handL[0], cy: g.handL[1], r: g.wristW * 1.35 }}
          transition={morph}
          fill={look.skin}
        />

        <Head g={g} look={look} gid={gid} />
      </motion.g>
    </svg>
  );
}

function Garment({ g, garment }: { g: BodyGeometry; garment: AvatarGarment }) {
  const geo = useMemo(() => buildGarment(g, garment.category), [g, garment.category]);
  const base = garment.color.hex;
  const dark = shade(base, 80);
  const graphicFill = isLight(base) ? "var(--ink)" : "var(--ink-foreground)";

  return (
    <g>
      {geo.hood && (
        <motion.path initial={false} animate={{ d: geo.hood }} transition={morph} style={{ fill: dark }} />
      )}
      <motion.path initial={false} animate={{ d: geo.sleeveL }} transition={morph} style={{ fill: base }} />
      <motion.path initial={false} animate={{ d: geo.sleeveR }} transition={morph} style={{ fill: base }} />
      <motion.path initial={false} animate={{ d: geo.torso }} transition={morph} style={{ fill: base }} />
      <motion.path
        initial={false}
        animate={{ d: geo.neckline }}
        transition={morph}
        fill="none"
        style={{ stroke: dark }}
        strokeWidth={garment.category === "hoodie" ? 7 : 5}
        strokeLinecap="round"
      />
      <motion.path
        initial={false}
        animate={{ d: geo.hem }}
        transition={morph}
        style={garment.category === "tshirt" ? { stroke: dark, fill: "none" } : { fill: dark }}
        strokeWidth={2}
        opacity={0.9}
      />
      {geo.pocket && (
        <motion.path
          initial={false}
          animate={{ d: geo.pocket }}
          transition={morph}
          fill="none"
          style={{ stroke: dark }}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      {garment.category === "hoodie" && (
        <g style={{ stroke: dark }} strokeWidth={2.5} strokeLinecap="round">
          <motion.line
            initial={false}
            animate={{ x1: 152, y1: g.shoulderY + 2, x2: 150, y2: g.chestY + 26 }}
            transition={morph}
          />
          <motion.line
            initial={false}
            animate={{ x1: 168, y1: g.shoulderY + 2, x2: 170, y2: g.chestY + 30 }}
            transition={morph}
          />
        </g>
      )}
      {geo.cuffR && <motion.path initial={false} animate={{ d: geo.cuffR }} transition={morph} style={{ fill: dark }} />}
      {geo.cuffL && <motion.path initial={false} animate={{ d: geo.cuffL }} transition={morph} style={{ fill: dark }} />}
      {garment.graphic && (
        <motion.text
          initial={false}
          animate={{ y: g.chestY + 30 }}
          transition={morph}
          x={160}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontWeight={800}
          fontSize={Math.min(22, (g.chestHalf * 2.1) / Math.max(4, garment.graphic.length * 0.62))}
          letterSpacing="0.04em"
          fill={graphicFill}
        >
          {garment.graphic}
        </motion.text>
      )}
    </g>
  );
}

function Shoes({ g }: { g: BodyGeometry }) {
  const legC = g.hipHalf * 0.5 * 0.92;
  return (
    <g fill="var(--avatar-shoe)">
      <motion.ellipse initial={false} animate={{ cx: 160 + legC + 3, cy: g.floor - 6, rx: 17, ry: 9 }} transition={morph} />
      <motion.ellipse initial={false} animate={{ cx: 160 - legC - 3, cy: g.floor - 6, rx: 17, ry: 9 }} transition={morph} />
    </g>
  );
}

function Head({ g, look, gid }: { g: BodyGeometry; look: AvatarLook; gid: string }) {
  const { headCx: cx, headCy: cy, headR: r } = g;
  return (
    <g>
      <motion.circle initial={false} animate={{ cx: cx - r * 0.98, cy: cy + r * 0.12, r: r * 0.2 }} transition={morph} fill={shade(look.skin, 92)} />
      <motion.circle initial={false} animate={{ cx: cx + r * 0.98, cy: cy + r * 0.12, r: r * 0.2 }} transition={morph} fill={shade(look.skin, 92)} />
      <motion.circle initial={false} animate={{ cx, cy, r }} transition={morph} fill={`url(#skin-${gid})`} />

      {/* blush */}
      <motion.ellipse initial={false} animate={{ cx: cx - r * 0.52, cy: cy + r * 0.38, rx: r * 0.16, ry: r * 0.09 }} transition={morph} fill="var(--destructive)" opacity={0.14} />
      <motion.ellipse initial={false} animate={{ cx: cx + r * 0.52, cy: cy + r * 0.38, rx: r * 0.16, ry: r * 0.09 }} transition={morph} fill="var(--destructive)" opacity={0.14} />

      {/* eyes with blink */}
      {[-1, 1].map((s) => (
        <motion.g
          key={s}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1], delay: s === 1 ? 0.02 : 0 }}
          style={{ transformOrigin: `${cx + s * r * 0.36}px ${cy + r * 0.08}px` }}
        >
          <motion.ellipse initial={false} animate={{ cx: cx + s * r * 0.36, cy: cy + r * 0.08, rx: r * 0.1, ry: r * 0.14 }} transition={morph} fill="var(--ink)" />
          <motion.circle initial={false} animate={{ cx: cx + s * r * 0.36 + r * 0.035, cy: cy + r * 0.03, r: r * 0.035 }} transition={morph} fill="var(--ink-foreground)" />
        </motion.g>
      ))}

      {/* brows */}
      {[-1, 1].map((s) => (
        <motion.path
          key={`b${s}`}
          initial={false}
          animate={{ d: `M${cx + s * r * 0.22},${cy - r * 0.2} Q${cx + s * r * 0.36},${cy - r * 0.28} ${cx + s * r * 0.5},${cy - r * 0.2}` }}
          transition={morph}
          fill="none"
          stroke={look.hair}
          strokeWidth={r * 0.06}
          strokeLinecap="round"
        />
      ))}

      <motion.path
        initial={false}
        animate={{ d: `M${cx - r * 0.2},${cy + r * 0.42} Q${cx},${cy + r * 0.6} ${cx + r * 0.2},${cy + r * 0.42}` }}
        transition={morph}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={r * 0.06}
        strokeLinecap="round"
      />
      <HairFront g={g} look={look} />
    </g>
  );
}

function HairBack({ g, look }: { g: BodyGeometry; look: AvatarLook }) {
  const { headCx: cx, headCy: cy, headR: r } = g;
  if (look.hairStyle === "long") {
    const d = `M${cx - r * 1.12},${cy - r * 0.1} C${cx - r * 1.2},${cy + r * 1.2} ${cx - r * 1.05},${g.shoulderY + 30} ${cx - r * 0.8},${g.shoulderY + 44} L${cx + r * 0.8},${g.shoulderY + 44} C${cx + r * 1.05},${g.shoulderY + 30} ${cx + r * 1.2},${cy + r * 1.2} ${cx + r * 1.12},${cy - r * 0.1} Z`;
    return <motion.path initial={false} animate={{ d }} transition={morph} fill={look.hair} />;
  }
  if (look.hairStyle === "bun") {
    return <motion.circle initial={false} animate={{ cx, cy: cy - r * 1.05, r: r * 0.42 }} transition={morph} fill={look.hair} />;
  }
  return null;
}

function HairFront({ g, look }: { g: BodyGeometry; look: AvatarLook }) {
  const { headCx: cx, headCy: cy, headR: r } = g;
  switch (look.hairStyle) {
    case "buzz": {
      const d = `M${cx - r},${cy - r * 0.05} C${cx - r * 1.02},${cy - r * 1.12} ${cx + r * 1.02},${cy - r * 1.12} ${cx + r},${cy - r * 0.05} C${cx + r * 0.72},${cy - r * 0.62} ${cx - r * 0.72},${cy - r * 0.62} ${cx - r},${cy - r * 0.05} Z`;
      return <motion.path initial={false} animate={{ d }} transition={morph} fill={look.hair} opacity={0.92} />;
    }
    case "curly":
      return (
        <g fill={look.hair}>
          {[-0.85, -0.5, -0.15, 0.2, 0.55, 0.88].map((t, i) => (
            <motion.circle
              key={i}
              initial={false}
              animate={{ cx: cx + t * r, cy: cy - r * (0.72 + (i % 2) * 0.16) + Math.abs(t) * r * 0.32, r: r * 0.34 }}
              transition={morph}
            />
          ))}
          <motion.circle initial={false} animate={{ cx: cx - r * 0.98, cy: cy - r * 0.05, r: r * 0.26 }} transition={morph} />
          <motion.circle initial={false} animate={{ cx: cx + r * 0.98, cy: cy - r * 0.05, r: r * 0.26 }} transition={morph} />
        </g>
      );
    default: {
      // short, long and bun share a swept fringe
      const d = `M${cx - r * 1.06},${cy + r * 0.15} C${cx - r * 1.14},${cy - r * 1.3} ${cx + r * 1.14},${cy - r * 1.3} ${cx + r * 1.06},${cy + r * 0.15} C${cx + r * 0.92},${cy - r * 0.42} ${cx - r * 0.1},${cy - r * 0.62} ${cx - r * 1.06},${cy + r * 0.15} Z`;
      return <motion.path initial={false} animate={{ d }} transition={morph} fill={look.hair} />;
    }
  }
}
