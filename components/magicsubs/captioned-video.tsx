import React, { useState } from "react";
import { AbsoluteFill, OffthreadVideo, useVideoConfig, Video } from "remotion";
import Subtitle from "./subtitle";
import { useSubtitles } from "@/hooks/use-subtitles";
import { useEffect } from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";

// This component is used to render the video with subtitles.
export const CaptionedVideo: React.FC<{
  src: string;
  setDurationInFrames: (duration: number) => void;
}> = ({ src, setDurationInFrames }) => {
  const { subtitles } = useSubtitles();
  const { fps, width, height } = useVideoConfig();
  const [videoError, setVideoError] = useState<string | null>(null);

  const getDurationInFrames = () => {
    subtitles.sort((a, b) => a.start - b.start);
    const duration = Math.floor(subtitles[subtitles.length - 1].end * fps);
    setDurationInFrames(duration + 1);
  };

  useEffect(() => {
    if (subtitles.length > 0) {
      getDurationInFrames();
    }
  }, [subtitles]);

  const getTransition = (transitionString: string) => {
    switch (transitionString) {
      case "Wipe":
        return wipe();
      case "Flip":
        return flip();
      case "Slide":
        return slide();
      case "ClockWipe":
        return clockWipe({ width, height });
      case "default":
        return null;
    }
  };

  const handleVideoError = (error: Error, videoType: string) => {
    console.error(`Error playing ${videoType}:`, error);
    setVideoError(`Error playing ${videoType}: ${error.message}`);
  };

  if (videoError) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div>{videoError}</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(error) => handleVideoError(error, "Main Video")}
      />
      <TransitionSeries>
        {subtitles.map((subtitle, index) => {
          const nextSubtitle = subtitles[index + 1] ?? null;
          const subtitleStartFrame = subtitle.start * fps;
          const subtitleEndFrame = Math.min(
            nextSubtitle ? nextSubtitle.start * fps : Infinity,
            subtitleStartFrame + fps
          );
          const durationInFrames = subtitleEndFrame - subtitleStartFrame;
          if (durationInFrames <= 0) {
            return null;
          }

          const transition = subtitle.transition
            ? getTransition(subtitle.transition)
            : null;

          return (
            <React.Fragment key={index}>
              {transition && (
                <TransitionSeries.Transition
                  // @ts-ignore
                  presentation={transition}
                  timing={linearTiming({ durationInFrames: 6 })}
                />
              )}

              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <AbsoluteFill>
                  {subtitle.broll && (
                    <Video
                      src={subtitle.broll}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(error) => handleVideoError(error, "Broll")}
                    />
                  )}
                  <Subtitle text={subtitle.word} />
                </AbsoluteFill>
              </TransitionSeries.Sequence>

              {transition && (
                <TransitionSeries.Transition
                  // @ts-ignore
                  presentation={transition}
                  timing={linearTiming({ durationInFrames: 6 })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
