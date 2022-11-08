import React, { useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

import { UserMediaRequest, useUserMedia } from "../hooks/use-user-media";
import { useOffsets } from "../hooks/use-offsets";

import { ReactProps } from "./types";
import "./index.css";

const ASPECT_RATIO = 1.586;

const CAPTURE_OPTIONS: UserMediaRequest = {
  audio: false,
  video: { facingMode: "environment" },
};

// Types
interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  checkVisibility: () => boolean;
}

type PossibleRefs = ExtendedHTMLVideoElement | HTMLCanvasElement;

type Container = {
  width: number;
  height: number;
};

type CameraCallbacks = {
  onCapture: (blob: Blob | null) => void;
  onClear: () => void;
};

// Utilities
/* `returnComponent` and `returnComponentWithRef` help creating semantic components to make the layout more readable.
 *
 * With this function, the following expression
 *		`const Wrapper = (props) => <div className="Wrapper" {...props} />;`
 * becomes
 *		`const Wrapper = returnComponent("div", "Wrapper");`
 *
 * `returnComponentWithRef` creates a component that allows a ref property.
 * For more info on ref forwarding, read: https://reactjs.org/docs/forwarding-refs.html .
 */
const returnComponent = (
  type: string,
  className: string
): React.FunctionComponent<ReactProps> => {
  const component = ({ children, ...rest }: ReactProps) =>
    React.createElement(type, { className: className, ...rest }, children);

  component.displayName = className;

  return component;
};

const returnComponentWithRef = (type: string, className: string) => {
  const component = React.forwardRef<PossibleRefs, ReactProps>(
    ({ children, ...rest }: ReactProps, ref) =>
      React.createElement(
        type,
        { ref: ref, className: className, ...rest },
        children
      )
  );

  component.displayName = className;

  return component;
};

// Semantic components
const Button = returnComponent("button", "Button");
const Flash = returnComponent("div", "Flash");
const Overlay = returnComponent("div", "Overlay");
const Wrapper = returnComponent("div", "Wrapper");

// Semantic components with ref
const Canvas = returnComponentWithRef("canvas", "Canvas");
const Container = returnComponentWithRef("div", "Container");
const Video = returnComponentWithRef("video", "Video");

const toPxString = (value: number | undefined): string | undefined => {
  if (value) return `${value}px`;
  return undefined;
};

//////////////////////////////////////////////////////////////////////
// Camera component
export const Camera = ({ onCapture, onClear }: CameraCallbacks) => {
  // Set references
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const videoRef = useRef<null | ExtendedHTMLVideoElement>(null);

  const { width, ref: resizeRef } = useResizeDetector();

  // Set states
  const [container, setContainer] = useState<Container>({
    width: 100,
    height: 300,
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Set extra utility variables
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);

  const offsets = useOffsets(
    videoRef.current?.videoWidth,
    videoRef.current?.videoHeight,
    container.width,
    container.height
  );

  // Handle container resizes
  useEffect(() => {
    if (width) {
      setContainer({
        width: width,
        height: Math.round(width / ASPECT_RATIO),
      });
    }
  }, [width]);

  // Update video reference
  useEffect(() => {
    if (
      mediaStream &&
      videoRef.current &&
      !videoRef.current.checkVisibility()
    ) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Callbacks
  const handleCanPlay = () => {
    setIsVideoPlaying(true);
    void videoRef.current?.play(); // TODO: handle error
  };

  const handleCapture = () => {
    if (videoRef.current === null) return;
    if (canvasRef.current === null) return;

    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height
    );

    canvasRef.current.toBlob(
      (blob: Blob | null) => onCapture(blob),
      "image/jpeg",
      1
    );
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  };

  const handleClear = () => {
    if (canvasRef.current === null) return;

    const context = canvasRef.current.getContext("2d");
    context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();
  };

  if (!mediaStream) {
    //alert("No media stream found. Check if your camera is active");
    return null;
  }

  return (
    <Wrapper>
      <Container
        ref={resizeRef}
        style={{
          height: `${container.height}px`,
          maxWidth: toPxString(videoRef.current?.videoWidth),
          maxHeight: toPxString(videoRef.current?.videoHeight),
        }}
      >
        <Video
          ref={videoRef}
          hidden={!isVideoPlaying}
          onCanPlay={handleCanPlay}
          autoPlay
          playsInline
          muted
          style={{
            top: `-${offsets.y}px`,
            left: `-${offsets.x}px`,
          }}
        />

        <Overlay hidden={!isVideoPlaying} />

        <Canvas
          ref={canvasRef}
          width={container.width}
          height={container.height}
        />

        {isFlashing && <Flash onAnimationEnd={() => setIsFlashing(false)} />}
      </Container>

      {isVideoPlaying && (
        <Button onClick={isCanvasEmpty ? handleCapture : handleClear}>
          {isCanvasEmpty ? "Take a picture" : "Take another picture"}
        </Button>
      )}
    </Wrapper>
  );
};
