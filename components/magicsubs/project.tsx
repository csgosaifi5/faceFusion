"use client";

import { AlertCircle, UploadIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { handleTranscription, updateProject } from "@/lib/actions/magicsubs.action";
import { EditPlayer } from "./edit-player";
import { SubtitlesProvider } from "@/hooks/use-subtitles";
import { toast } from "sonner"


const Project = ({ project }: { project: any }) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoadingVideo(true);
        const video = await fetch(project.downloadUrl!);
        const videoBlob = await video.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);
      } catch (error) {
        try {
          const response = await fetch(
            `https://ec725t4zgzpzxikfok7jxnzasq0hdtit.lambda-url.ap-southeast-2.on.aws/get_download_link?object_key=${encodeURIComponent(
              project.objectKey || ""
            )}`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization: "Basic YWRtaW46c2VjcmV0",
              },
            }
          );
          const data = await response.json();
          const { download_url } = data;
          const video = await fetch(download_url);
          const videoBlob = await video.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          setVideoUrl(videoUrl);
          await updateProject(project.id, { downloadUrl: download_url });
        } catch (fetchError) {
          console.error("Error fetching video:", fetchError);
        }
      } finally {
        setLoadingVideo(false);
      }
    };

    if (project.objectKey) {
      fetchVideo();
    }
  }, [project.downloadUrl, project.objectKey, project.id]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setError("File is too large. Maximum size is 10MB.");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload a video file (mp4 or mov).");
      } else {
        setError("An error occurred while uploading the file. Please try again.");
      }
    } else {
      setError(null);
      validateVideo(acceptedFiles[0]);
    }
  }, []);

  const validateVideo = (file: File) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const isVertical = video.videoWidth < video.videoHeight;

      if (duration < 5 || duration > 30) {
        setError("Video length must be between 5 and 30 seconds.");
      } else if (!isVertical) {
        setError("Only vertically oriented videos are allowed.");
      } else {
        const videoType = file.type.split("/")[1];
        uploadVideo(file, videoType);
      }

      window.URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      setError("Error validating video. Please try again.");
    };

    video.src = URL.createObjectURL(file);
  };

  const uploadVideo = async (file: File, videoType: string) => {
    try {
      setIsUploading(true);

      const response1 = await fetch(
        `https://ec725t4zgzpzxikfok7jxnzasq0hdtit.lambda-url.ap-southeast-2.on.aws/get_video_upload_link?video_type=${videoType}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "Basic YWRtaW46c2VjcmV0",
          },
        }
      );
      const data1 = await response1.json();

      const { upload_url, obj_key } = data1;

      await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      setIsUploading(false);

      setIsTranscribing(true);

      const response2 = await fetch(
        `https://ec725t4zgzpzxikfok7jxnzasq0hdtit.lambda-url.ap-southeast-2.on.aws/get_download_link?object_key=${encodeURIComponent(
          obj_key
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "Basic YWRtaW46c2VjcmV0",
          },
        }
      );
      const data2 = await response2.json();
      const { download_url } = data2;

      const response3 = await fetch(
        `https://ec725t4zgzpzxikfok7jxnzasq0hdtit.lambda-url.ap-southeast-2.on.aws/transcribe_video?video_dl_url=${encodeURIComponent(
          download_url
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "Basic YWRtaW46c2VjcmV0",
          },
        }
      );
     
      
      if(response3.status === 500 && response3.statusText==="Internal Server Error"){
        toast.error("Your video does not have any english spoken word, Please check again and upload")
        setIsTranscribing(false);
        setIsProcessing(false);
        return;
      }
      const transcription = await response3.json();

      setIsTranscribing(false);

      setIsProcessing(true);
      const finalTranscription = JSON.parse(transcription).flatMap((item: any) => item.words);
      await handleTranscription(project._id, download_url, obj_key, JSON.stringify(finalTranscription));
      setIsProcessing(false);

      window.location.reload();
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      setError("An error occurred during video processing. Please try again.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  if (loadingVideo) {
    return <LoadingState message="Loading the video..." />;
  }

  if (isUploading) {
    return <LoadingState message="Uploading the video..." />;
  }

  if (isTranscribing) {
    return <LoadingState message="Transcribing the video..." />;
  }

  if (isProcessing) {
    return <LoadingState message="Updating the database..." />;
  }

  if (!project.objectKey || !project.downloadUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 rounded-lg cursor-pointer text-center ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {error ? (
            <AlertCircle className="size-8 mb-2 mx-auto text-red-500" />
          ) : (
            <UploadIcon className="size-8 mb-2 mx-auto text-gray-600" />
          )}
          {error ? (
            <p className="text-red-600 font-semibold">{error}</p>
          ) : isDragActive ? (
            <p>Drop the video file here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop a video file here, or click to select a file</p>
          )}
          <p className="text-sm text-gray-500 mt-2">(Only video files up to 10MB are accepted)</p>
        </div>
      </div>
    );
  }

  const transcription = project.transcription ? JSON.parse(project.transcription) : [];

  return (
    <SubtitlesProvider>
      <EditPlayer src={videoUrl || ""} transcription={transcription} />
    </SubtitlesProvider>
  );
};

export default Project;

const LoadingState = ({ message }: { message: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center">
    <Loader2 className="size-12 mb-4 text-blue-500 animate-spin" />
    <p className="text-lg font-semibold text-gray-700">{message}</p>
  </div>
);
