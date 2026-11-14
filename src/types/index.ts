export type Season = "winter" | "summer" | "autumn";
export type Category = "tshirt" | "hoodie" | "sweatshirt";
export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL";
export type FitStyle = "regular" | "relaxed" | "oversized";

export interface ProductColor {
  name: string;
  /** Garment dye color — product data, rendered into illustrations and the avatar. */
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  seasons: Season[];
  price: number;
  colors: ProductColor[];
  sizes: Size[];
  fit: FitStyle;
  fabric: string;
  weight: string;
  description: string;
  details: string[];
  graphic?: string;
  badge?: string;
}

export interface Measurements {
  height: number; // cm
  weight: number; // kg
  shoulder: number; // cm, shoulder breadth
  chest: number; // cm, circumference
  waist: number; // cm, circumference
  hips: number; // cm, circumference
}

export type HairStyle = "short" | "long" | "buzz" | "curly" | "bun";

export interface AvatarLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
}

export interface AvatarProfile {
  measurements: Measurements;
  look: AvatarLook;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  createdAt: string;
  avatar: AvatarProfile | null;
  /** Closet item key currently worn by the avatar. */
  equippedKey: string | null;
}

export type FitMode = "avatar" | "custom";

export interface FitChoice {
  mode: FitMode;
  measurements: Measurements;
}

export interface CartItem {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  color: ProductColor;
  size: Size;
  quantity: number;
  fit: FitChoice;
  graphic?: string;
}

export type OrderStatus = "placed" | "shipped" | "out_for_delivery" | "delivered";

export interface ShippingDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = "card" | "cod";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  shipping: ShippingDetails;
  payment: PaymentMethod;
  createdAt: string;
  deliveredAt: string | null;
}

export interface ClosetItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  category: Category;
  color: ProductColor;
  size: Size;
  graphic?: string;
  unlockedAt: string;
}

export interface PublicProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: AvatarProfile;
  closet: ClosetItem[];
  equippedKey: string | null;
  joinedAt: string;
}
