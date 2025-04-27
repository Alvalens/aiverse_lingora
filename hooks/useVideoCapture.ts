import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoCaptureProps {
  fps?: number;
}

interface UseVideoCaptureReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  permission: "granted" | "denied" | "prompt";
  requestCameraPermission: () => Promise<boolean>;
  stopCamera: () => void;
}

export function useVideoCapture({
  fps = 15,
}: UseVideoCaptureProps = {}): UseVideoCaptureReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">(
    "prompt"
  );

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = useCallback(async () => {
    try {
      console.log("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: fps },
        },
        audio: false,
      });

      console.log("Camera permission granted, stream acquired");

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = stream;

      // Directly attach stream to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Force video play with muted attribute to bypass autoplay restrictions
        videoRef.current.muted = true;

        try {
          await videoRef.current.play();
          console.log("Video is now playing");
        } catch (playError) {
          console.error("Error playing video:", playError);
        }
      } else {
        console.error("Video element reference not available");
      }

      setPermission("granted");
      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermission("denied");
      return false;
    }
  }, [fps]);

  const stopCamera = useCallback(() => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Detach from video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setPermission("prompt");
  }, []);

  return {
    videoRef,
    permission,
    requestCameraPermission,
    stopCamera,
  };
}
