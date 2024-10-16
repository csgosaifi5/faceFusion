"use client";

import VideoPlayer from "./player";
import { useSubtitle } from "@/hooks/use-subtitle";
import { Button } from "@/components/ui/button";
import { DownloadIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Subtitles from "./subtitles";
import { useSubtitles } from "@/hooks/use-subtitles";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerRef } from "@remotion/player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const EditPlayer = ({
  src,
  transcription,
}: {
  src: string;
  transcription: any;
}) => {
  const {
    animationType,
    fontSize,
    setFontSize,
    setAnimationType,
    textColor,
    setTextColor,
    strokeColor,
    setStrokeColor,
  } = useSubtitle();
  const { setSubtitles } = useSubtitles();
  const ffmpeg = createFFmpeg({ log: true });

  useEffect(() => {
    setSubtitles(transcription);
  }, [transcription, setSubtitles]);

  const [previewText, setPreviewText] = useState("Preview Text");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isControlsTrue, setIsControlsTrue] = useState(true);

  const triggerPreview = (type: string) => {
    setAnimationType(type);
    setIsAnimating(true);
    setPreviewText("");
    setTimeout(() => {
      setPreviewText("Preview Text");
      setIsAnimating(false);
    }, 50);
  };

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 10, 170));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 10, 60));
  };

  const playerRef = useRef<PlayerRef>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const downloadVideo = useCallback(async () => {
    if (!playerRef.current || !videoPlayerRef.current) return;

    const player = playerRef.current;
    const videoElement = videoPlayerRef.current.querySelector("video");

    if (!videoElement) {
      console.error("Video element not found");
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
        },
      });

      // @ts-ignore
      const audioStream = videoElement.captureStream();
      const audioTrack = audioStream.getAudioTracks()[0];

      if (audioTrack) {
        displayStream.addTrack(audioTrack);
      }

      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: "video/webm",
        videoBitsPerSecond: 8000000,
      });
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        await ffmpeg.load();
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        ffmpeg.FS("writeFile", "input.webm", await fetchFile(url));
        await ffmpeg.run("-i", "input.webm", "-c:v", "copy", "output.mp4");
        const mp4 = ffmpeg.FS("readFile", "output.mp4");
        ffmpeg.FS("unlink", "output.mp4");
        const blob2 = new Blob([mp4.buffer], { type: "video/mp4" });
        const url2 = URL.createObjectURL(blob2);
        a.href = url2;
        a.download = "recorded-video.mp4";
        a.click();
        URL.revokeObjectURL(url);
      };

      await player.requestFullscreen();
      setIsControlsTrue(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      mediaRecorder.start();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      player.play();

      const handleVideoEnd = () => {
        mediaRecorder.stop();
        displayStream.getTracks().forEach((track) => track.stop());
        document.exitFullscreen();
        player.pause();
        player.seekTo(0);
        player.removeEventListener("ended", handleVideoEnd);
      };

      player.addEventListener("ended", handleVideoEnd);
    } catch (error) {
      console.error("Error during video recording:", error);
    }
  }, [ffmpeg]);

  const [showDownloadMethod, setShowDownloadMethod] = useState(false);

  const openDownloadMethodDialog = () => {
    setShowDownloadMethod(true);
  };

  return (
    <div className="w-full h-full flex flex-col max-md:items-center overflow-auto">
      <div className="flex flex-col md:flex-row justify-around mt-4 h-full">
        <div className="flex flex-col items-center justify-center gap-4 mb-4 md:mb-0">
          <Tabs defaultValue="font" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 rounded-full">
              <TabsTrigger value="font" className="rounded-full">
                Font
              </TabsTrigger>
              <TabsTrigger value="animation" className="rounded-full">
                Animation
              </TabsTrigger>
              <TabsTrigger value="subtitles" className="rounded-full">
                Subtitles
              </TabsTrigger>
            </TabsList>
            <TabsContent value="font">
              <div className="flex flex-col gap-y-6 items-center mt-4">
                <div className="flex flex-col gap-y-2 items-center">
                  <h2 className="text-lg font-semibold">Font Size:</h2>
                  <div className="flex gap-x-2">
                    <Button
                      onClick={decreaseFontSize}
                      size="icon"
                      disabled={fontSize <= 60}
                      className="h-8 w-8"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center justify-center w-12 text-lg font-medium">
                      {fontSize}
                    </span>
                    <Button
                      onClick={increaseFontSize}
                      size="icon"
                      disabled={fontSize >= 170}
                      className="h-8 w-8"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-y-4 items-center">
                  <div className="flex items-center gap-x-3">
                    <label htmlFor="textColor" className="text-sm font-medium">
                      Text Color:
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        id="textColor"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-full border-4 border-black cursor-pointer appearance-none"
                      />
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ backgroundColor: textColor }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium uppercase">
                      {textColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <label
                      htmlFor="strokeColor"
                      className="text-sm font-medium"
                    >
                      Stroke Color:
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        id="strokeColor"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer appearance-none"
                      />
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ backgroundColor: strokeColor }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium uppercase">
                      {strokeColor}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="animation">
              <div className="text-center mt-4">
                <h1>Animation Type:</h1>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  <Button
                    onClick={() => triggerPreview("scale")}
                    disabled={animationType === "scale"}
                    size="sm"
                  >
                    Scale
                  </Button>
                  <Button
                    onClick={() => triggerPreview("slide")}
                    disabled={animationType === "slide"}
                    size="sm"
                  >
                    Slide
                  </Button>
                  <Button
                    onClick={() => triggerPreview("translate")}
                    disabled={animationType === "translate"}
                    size="sm"
                  >
                    Translate
                  </Button>
                </div>
                <div className="mt-4 h-16 flex items-center justify-center overflow-hidden">
                  <div
                    className={`bg-gray-200 dark:bg-gray-700 p-2 rounded transition-all duration-500 ease-in-out ${
                      isAnimating ? "opacity-0" : "opacity-100"
                    } ${
                      animationType === "scale" ? "scale-0 animate-scale" : ""
                    } ${
                      animationType === "slide"
                        ? "-translate-x-full animate-slide"
                        : ""
                    } ${
                      animationType === "translate"
                        ? "translate-y-full animate-translate"
                        : ""
                    }`}
                  >
                    {previewText}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="subtitles">
              <Subtitles />
            </TabsContent>
          </Tabs>
        </div>
        <div
          ref={videoPlayerRef}
          className="w-full md:w-1/4 flex flex-col items-center gap-y-3"
        >
          <VideoPlayer
            src={src}
            playerRef={playerRef}
            controls={isControlsTrue}
          />
          <div className="flex gap-x-2">
            <Button className="rounded-full" onClick={openDownloadMethodDialog}>
              <InfoIcon className="size-4 mr-2" />
              Info to Download
            </Button>
            <Button className="rounded-full" onClick={downloadVideo}>
              <DownloadIcon className="size-4 mr-2" />
              Download Video
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDownloadMethod} onOpenChange={setShowDownloadMethod}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Download the Video</DialogTitle>
            <DialogDescription>
              When the screen recorder asks you to select an option, please
              choose the &quot;Window&quot; option and select the current
              website tab. This will ensure that the video is recorded correctly
              with all the subtitles and animations.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="mt-2">Got it</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};
