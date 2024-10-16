import { create } from "zustand";

interface SubtitleState {
  fontSize: number;
  textColor: string;
  strokeColor: string;
  animationType: string;
  setFontSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setAnimationType: (type: string) => void;
}

export const useSubtitle = create<SubtitleState>((set) => ({
  fontSize: 120,
  textColor: "#FFFFFF",
  strokeColor: "#000000",
  animationType: "scale",
  setFontSize: (size) => set({ fontSize: size }),
  setTextColor: (color) => set({ textColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setAnimationType: (type) => set({ animationType: type }),
}));
