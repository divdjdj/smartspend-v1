import { StaticImageData } from "next/image";

export type Category =
  | "AI"
  | "Professional"
  | "Creative"
  | "Developer"
  | "Productivity"
  | "Marketing"
  | "Credits"
  | "Product/Marketing"
  | "Business/Operations"
  | "OTT";

export type Tool = {
  name: string;
  slug: string; // simpleicons slug or custom brand slug
  color?: string; // brand hex without #
  category: Category;
  logo?: StaticImageData; // optional explicit image reference (imported statically or custom component)
  domain?: string; // brand domain for favicon/logo fallback (e.g. "linear.app")
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  screenshots?: { src: StaticImageData; alt: string }[];
};
