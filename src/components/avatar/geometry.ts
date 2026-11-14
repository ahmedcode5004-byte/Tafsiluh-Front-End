import type { Category, Measurements } from "@/types";

type Pt = [number, number];

export const VIEW_W = 320;
export const VIEW_H = 640;
const CX = VIEW_W / 2;
const FLOOR = 612;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Closed Catmull-Rom spline → cubic Béziers. Same point count ⇒ same command list, so paths morph smoothly. */
export function smoothClosed(points: Pt[], tension = 0.16): string {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n] as Pt;
  let d = `M${r1(at(0)[0])},${r1(at(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension];
    d += ` C${r1(c1[0])},${r1(c1[1])} ${r1(c2[0])},${r1(c2[1])} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return `${d} Z`;
}

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [2 * CX - x, y] as Pt);

export interface BodyGeometry {
  headCx: number;
  headCy: number;
  headR: number;
  neckHalf: number;
  shoulderY: number;
  chestY: number;
  waistY: number;
  hipY: number;
  crotchY: number;
  kneeY: number;
  ankleY: number;
  floor: number;
  shoulderHalf: number;
  chestHalf: number;
  waistHalf: number;
  hipHalf: number;
  armAnchor: number;
  armW: number;
  wristW: number;
  elbow: Pt;
  wrist: Pt;
  shoulderJoint: Pt;
  soft: number;
  body: string;
  armR: string;
  armL: string;
  pants: string;
  handR: Pt;
  handL: Pt;
}

export function buildBody(m: Measurements): BodyGeometry {
  const height = clamp(m.height, 140, 210);
  const bodyPx = 400 + (height - 140) * (170 / 70); // 400..570px
  const k = bodyPx / height; // px per cm
  const top = FLOOR - bodyPx;
  const bmi = m.weight / (height / 100) ** 2;
  const soft = clamp((bmi - 22) / 12, -0.3, 1.1);

  const headR = bodyPx * 0.082;
  const headCy = top + headR;
  const shoulderY = top + bodyPx * 0.205;
  const chestY = top + bodyPx * 0.28;
  const waistY = top + bodyPx * 0.41;
  const hipY = top + bodyPx * 0.5;
  const crotchY = top + bodyPx * 0.555;
  const kneeY = top + bodyPx * 0.76;
  const ankleY = FLOOR - 16;

  // Widths — slightly exaggerated around a baseline so changes read clearly.
  const exaggerate = (actual: number, base: number, f = 1.35) => base + (actual - base) * f;
  const shoulderHalf = (exaggerate(m.shoulder, 44) * k) / 2;
  const chestHalf = (exaggerate(m.chest, 96) / 3.05) * k * 0.5 + soft * 3;
  const waistHalf = (exaggerate(m.waist, 80) / 3.15) * k * 0.5 + soft * 5;
  const hipHalf = (exaggerate(m.hips, 98) / 3.0) * k * 0.5 + soft * 3;
  const neckHalf = headR * 0.36 + soft * 3;

  const legC = hipHalf * 0.5;
  const thighHalf = hipHalf * 0.5 + soft * 2;
  const kneeHalf = 13 + soft * 5 + (hipHalf - 42) * 0.12;
  const ankleHalf = 8 + soft * 2;
  const ankleC = legC * 0.92;

  const right: Pt[] = [
    [CX + neckHalf, shoulderY - 16],
    [CX + shoulderHalf - 10, shoulderY],
    [CX + shoulderHalf, shoulderY + 14],
    [CX + chestHalf, chestY + 8],
    [CX + waistHalf, waistY],
    [CX + hipHalf, hipY],
    [CX + legC + thighHalf - 1, crotchY + 26],
    [CX + legC + kneeHalf, kneeY],
    [CX + ankleC + ankleHalf, ankleY],
    [CX + ankleC - ankleHalf, ankleY],
    [CX + Math.max(legC - kneeHalf, 4), kneeY],
    [CX + Math.max(legC - thighHalf + 4, 3), crotchY + 26],
  ];
  const crotch: Pt = [CX, crotchY + 6];
  const body = smoothClosed([...right, crotch, ...mirror(right).reverse()]);

  // Arms
  const armW = 12 + soft * 6;
  const wristW = 7 + soft * 2;
  const armAnchor = Math.max(shoulderHalf - 4, chestHalf + 2);
  const shoulderJoint: Pt = [CX + armAnchor, shoulderY + 14];
  const elbowY = (shoulderY + hipY) / 2 + 8;
  const elbow: Pt = [CX + Math.max(armAnchor + 6, waistHalf + armW + 4), elbowY];
  const wristY = hipY + 30;
  const wrist: Pt = [CX + Math.max(armAnchor + 10, hipHalf + wristW + 8), wristY];
  const armPts: Pt[] = [
    [shoulderJoint[0] - armW * 0.7, shoulderY + 2],
    [shoulderJoint[0] + armW * 0.8, shoulderY + 10],
    [elbow[0] + armW * 0.85, elbow[1]],
    [wrist[0] + wristW, wrist[1]],
    [wrist[0] - wristW, wrist[1]],
    [elbow[0] - armW * 0.85, elbow[1] + 4],
    [CX + chestHalf - 4, chestY + 18],
  ];
  const armR = smoothClosed(armPts);
  const armL = smoothClosed(mirror(armPts));
  const handR: Pt = [wrist[0], wrist[1] + wristW * 1.1];
  const handL: Pt = [2 * CX - wrist[0], wrist[1] + wristW * 1.1];

  // Base pants (neutral joggers)
  const o = 2.5;
  const pantsRight: Pt[] = [
    [CX + waistHalf + o - 1, waistY + 18],
    [CX + hipHalf + o, hipY],
    [CX + legC + thighHalf + o - 1, crotchY + 26],
    [CX + legC + kneeHalf + o, kneeY],
    [CX + ankleC + ankleHalf + o, ankleY - 3],
    [CX + ankleC - ankleHalf - o, ankleY - 3],
    [CX + Math.max(legC - kneeHalf - o, 2), kneeY],
    [CX + Math.max(legC - thighHalf + 2, 2), crotchY + 26],
  ];
  const pants = smoothClosed([...pantsRight, [CX, crotchY + 8], ...mirror(pantsRight).reverse()], 0.12);

  return {
    headCx: CX,
    headCy,
    headR,
    neckHalf,
    shoulderY,
    chestY,
    waistY,
    hipY,
    crotchY,
    kneeY,
    ankleY,
    floor: FLOOR,
    shoulderHalf,
    chestHalf,
    waistHalf,
    hipHalf,
    armAnchor,
    armW,
    wristW,
    elbow,
    wrist,
    shoulderJoint,
    soft,
    body,
    armR,
    armL,
    pants,
    handR,
    handL,
  };
}

export interface GarmentGeometry {
  torso: string;
  sleeveR: string;
  sleeveL: string;
  neckline: string;
  hem: string;
  cuffR: string | null;
  cuffL: string | null;
  hood: string | null;
  pocket: string | null;
  chestY: number;
  chestHalf: number;
}

/** Garment shapes derived from the same body geometry so clothes follow the avatar's proportions. */
export function buildGarment(g: BodyGeometry, category: Category): GarmentGeometry {
  const ease = category === "tshirt" ? 5 : 8; // looser for fleece
  const hemDrop = category === "tshirt" ? 16 : category === "sweatshirt" ? 20 : 26;
  const hemY = g.hipY + hemDrop;
  const boxW = Math.max(g.waistHalf, g.chestHalf * 0.94, g.hipHalf * 0.98) + ease;

  const right: Pt[] = [
    [CX + g.neckHalf + 4, g.shoulderY - 12],
    [CX + g.shoulderHalf - 6, g.shoulderY - 2],
    [CX + Math.max(g.shoulderHalf, g.armAnchor) + ease * 0.6, g.shoulderY + 14],
    [CX + g.chestHalf + ease, g.chestY + 12],
    [CX + boxW, g.waistY + 4],
    [CX + boxW + 1, hemY],
  ];
  const torso = smoothClosed([...right, [CX, hemY + 2], ...mirror(right).reverse(), [CX, g.shoulderY - 6]], 0.1);

  const sj = g.shoulderJoint;
  const short = category === "tshirt";
  const sleeveEnd: Pt = short
    ? [sj[0] + (g.elbow[0] - sj[0]) * 0.55, sj[1] + (g.elbow[1] - sj[1]) * 0.55]
    : g.wrist;
  const sleeveW = short ? g.armW + 6 : g.armW + ease * 0.5;
  const endW = short ? g.armW + 4 : g.wristW + 4;
  const sleevePts: Pt[] = short
    ? [
        [sj[0] - g.armW, g.shoulderY - 2],
        [sj[0] + sleeveW, g.shoulderY + 8],
        [sleeveEnd[0] + endW + 2, sleeveEnd[1]],
        [sleeveEnd[0] - endW + 2, sleeveEnd[1] + 6],
        [CX + g.chestHalf + 2, g.chestY + 22],
      ]
    : [
        [sj[0] - g.armW, g.shoulderY - 2],
        [sj[0] + sleeveW, g.shoulderY + 10],
        [g.elbow[0] + sleeveW, g.elbow[1]],
        [sleeveEnd[0] + endW, sleeveEnd[1] - 4],
        [sleeveEnd[0] - endW, sleeveEnd[1] - 4],
        [g.elbow[0] - sleeveW + 2, g.elbow[1] + 6],
        [CX + g.chestHalf + 2, g.chestY + 22],
      ];
  const sleeveR = smoothClosed(sleevePts, 0.12);
  const sleeveL = smoothClosed(mirror(sleevePts), 0.12);

  const cuff = (w: Pt, sign: 1 | -1) =>
    `M${r1(w[0] - endW * sign)},${r1(w[1] - 14)} L${r1(w[0] + endW * sign)},${r1(w[1] - 14)} L${r1(w[0] + endW * sign)},${r1(w[1] - 3)} L${r1(w[0] - endW * sign)},${r1(w[1] - 3)} Z`;
  const wristL: Pt = [2 * CX - g.wrist[0], g.wrist[1]];

  const nY = g.shoulderY - 12;
  const nW = g.neckHalf + 5;
  const neckline =
    category === "hoodie"
      ? `M${r1(CX - nW - 6)},${r1(nY)} Q${CX},${r1(nY + 30)} ${r1(CX + nW + 6)},${r1(nY)}`
      : `M${r1(CX - nW)},${r1(nY)} Q${CX},${r1(nY + 16)} ${r1(CX + nW)},${r1(nY)}`;

  const hemBand = category === "tshirt" ? 0 : 10;
  const hem =
    hemBand > 0
      ? `M${r1(CX - boxW - 1)},${r1(hemY - hemBand)} L${r1(CX + boxW + 1)},${r1(hemY - hemBand)} L${r1(CX + boxW + 1)},${r1(hemY)} Q${CX},${r1(hemY + 3)} ${r1(CX - boxW - 1)},${r1(hemY)} Z`
      : `M${r1(CX - boxW)},${r1(hemY - 3)} Q${CX},${r1(hemY)} ${r1(CX + boxW)},${r1(hemY - 3)}`;

  const hood =
    category === "hoodie"
      ? smoothClosed(
          [
            [CX - g.neckHalf - 18, g.shoulderY - 6],
            [CX - g.headR * 1.05, g.headCy + g.headR * 0.55],
            [CX - g.headR * 0.8, g.headCy + g.headR * 1.05],
            [CX, g.headCy + g.headR * 1.25],
            [CX + g.headR * 0.8, g.headCy + g.headR * 1.05],
            [CX + g.headR * 1.05, g.headCy + g.headR * 0.55],
            [CX + g.neckHalf + 18, g.shoulderY - 6],
            [CX, g.shoulderY + 10],
          ],
          0.14,
        )
      : null;

  const pw = boxW * 0.62;
  const py = g.waistY + 8;
  const pocket =
    category === "hoodie"
      ? `M${r1(CX - pw)},${r1(hemY - 12)} L${r1(CX - pw + 10)},${r1(py)} L${r1(CX + pw - 10)},${r1(py)} L${r1(CX + pw)},${r1(hemY - 12)} Z`
      : null;

  return {
    torso,
    sleeveR,
    sleeveL,
    neckline,
    hem,
    cuffR: short ? null : cuff(g.wrist, 1),
    cuffL: short ? null : cuff(wristL, -1),
    hood,
    pocket,
    chestY: g.chestY,
    chestHalf: g.chestHalf,
  };
}
