import { loadFont } from "@/components/magicsubs/load-font";
import React, { createContext, useState, useEffect, useContext } from "react";


export type SubtitleProp = {
  word: string;
  start: number;
  end: number;
  transition?: string;
  broll?: string;
};

type SubtitlesContextType = {
  subtitles: SubtitleProp[];
  setSubtitles: React.Dispatch<React.SetStateAction<SubtitleProp[]>>;
};

const SubtitlesContext = createContext<SubtitlesContextType | undefined>(
  undefined
);

export const SubtitlesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);

  useEffect(() => {
    loadFont();
  }, []);

  return (
    <SubtitlesContext.Provider value={{ subtitles, setSubtitles }}>
      {children}
    </SubtitlesContext.Provider>
  );
};

export const useSubtitles = () => {
  const context = useContext(SubtitlesContext);
  if (context === undefined) {
    throw new Error("useSubtitles must be used within a SubtitlesProvider");
  }
  return context;
};
