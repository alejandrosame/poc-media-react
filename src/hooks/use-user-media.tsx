import { useState, useEffect } from "react";

export interface UserMediaVideoOptions {
  facingMode?: string;
}

export interface UserMediaRequest {
  audio?: boolean;
  video?: boolean | UserMediaVideoOptions;
}

interface MediaStreamTrack {
  stop: () => void;
}

export function useUserMedia(
  requestedMedia: UserMediaRequest
): MediaStream | null {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function enableVideoStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          requestedMedia
        );
        setMediaStream(stream);
      } catch (err) {
        // Handle the error
        console.log(err);
      }
    }

    if (!mediaStream) {
      void enableVideoStream();
    } else {
      return function cleanup() {
        mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      };
    }
  }, [mediaStream, requestedMedia]);

  return mediaStream;
}
