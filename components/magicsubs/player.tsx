"use client";

import { Player, PlayerRef } from "@remotion/player";
import { LegacyRef, useCallback, useState } from "react";
import { CaptionedVideo } from "./captioned-video";

// Component that renders the video player with or without subtitles
// Takes a prop to determine whether subtitles should be displayed
// Player is remotion's built-in player component that helps render video compositions
export default function VideoPlayer({
  src,
  playerRef,
  controls,
}: {
  src: string;
  playerRef: LegacyRef<PlayerRef>;
  controls: boolean;
}) {
  const [durationInFrames, setDurationInFrames] = useState<number>(350);

  const errorFallback = useCallback(({ error }: { error: Error }) => {
    console.error("Remotion Player error:", error);
    return <div>Error loading video: {error.message}</div>;
  }, []);

  return (
    <Player
      // ref={playerRef}
      component={CaptionedVideo}
      inputProps={{
        src,
        setDurationInFrames: (duration: number) =>
          setDurationInFrames(duration),
      }}
      compositionWidth={1080}
      durationInFrames={durationInFrames}
      compositionHeight={1920}
      fps={30}
      controls={controls}
      errorFallback={errorFallback}
      style={{
        width: "350px",
      }}
      className="rounded-3xl mt-4"
    />
  );
}
