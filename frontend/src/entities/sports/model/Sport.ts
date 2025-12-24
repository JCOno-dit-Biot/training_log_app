export type SportType = 'dryland' | 'on-snow';

export interface Sport {
  id: number;
  name: string;
  type: SportType;
  display_mode: string;
}

export const TYPE_BASE: Record<SportType, string> = {
  "dryland": "#2F5D50", // deep forest
  "on-snow": "#2B6CB0",    // rich blue
};

// shades for outer ring (sports) per type
export const TYPE_SHADES: Record<SportType, string[]> = {
  "dryland": [
    "#1F4D3F", // deep forest
    "#2F6B57", // forest
    "#4E8A74", // sage
    "#7FB8A0", // light sage
    "#B8E0D2", // minty (use rarely)
  ],
  "on-snow": [
    "#1E4E8C", // deep blue
    "#2E73B8", // blue
    "#59A6E8", // sky
    "#A9D8FF", // icy
  ],
};
