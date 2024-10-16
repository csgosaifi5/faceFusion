import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { TheBoldFont } from "./load-font";
import { fitText } from "@remotion/layout-utils";
import {
  makeTransform,
  scale,
  translateY,
  rotate,
  translateX,
} from "@remotion/animation-utils";
import { useSubtitle } from "@/hooks/use-subtitle";

const fontFamily = TheBoldFont;

// This component is used to render a single word on the screen.
// It defines the style of the word and how it should be animated.
export const Word: React.FC<{
  enterProgress: number;
  text: string;
  stroke: boolean;
}> = ({ enterProgress, text, stroke }) => {
  const { width } = useVideoConfig();
  const { textColor, strokeColor, animationType, fontSize } = useSubtitle();

  const fittedText = fitText({
    fontFamily,
    text,
    withinWidth: width * 0.8,
  });

  const calculatedFontSize = Math.min(fontSize, fittedText.fontSize);

  const getTransform = () => {
    switch (animationType) {
      case "scale":
        return makeTransform([
          scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
          translateY(interpolate(enterProgress, [0, 1], [50, 0])),
        ]);
      case "slide":
        return makeTransform([
          translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          translateX(interpolate(enterProgress, [0, 1], [-100, 0])),
        ]);
      case "translate":
        return makeTransform([
          translateY(interpolate(enterProgress, [0, 1], [100, 0])),
        ]);
      default:
        return makeTransform([
          scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
          translateY(interpolate(enterProgress, [0, 1], [50, 0])),
        ]);
    }
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: undefined,
        bottom: 350,
        height: 150,
      }}
    >
      <div
        style={{
          fontSize: calculatedFontSize,
          color: textColor,
          WebkitTextStroke: stroke ? `20px ${strokeColor}` : undefined,
          transform: getTransform(),
          fontFamily,
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
