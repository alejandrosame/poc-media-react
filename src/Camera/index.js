import React, { useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

import { useUserMedia } from "../hooks/use-user-media";
import { useCardRatio } from "../hooks/use-card-ratio";
import { useOffsets } from "../hooks/use-offsets";

import "./index.css";

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: "environment" },
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
const returnComponent = (type, className) => {
  return ({ children, ...rest }) =>
    React.createElement(type, { className: className, ...rest }, children);
};

const returnComponentWithRef = (type, className) => {
  return React.forwardRef(({ children, ...rest }, ref) =>
    React.createElement(
      type,
      { ref: ref, className: className, ...rest },
      children
    )
  );
};

/* `setIfExists`s allows receiving a transformed value if a property exists in an object.
 *
 * With this function, the following expression
 *     setIfExists(videoRef.current, "videoWidth", (value)=>`${value}px`)
 * becomes
 *     videoRef.current && videoRef.current.videoWidth && `${videoRef.current.videoWidth}px`
 */
const setIfExists = (object, property, transform) => {
  if (object === undefined) return undefined;
  else {
    const child = object[property];
    if (child !== undefined) {
      return transform(child);
    }
  }
  return undefined;
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

//////////////////////////////////////////////////////////////////////
// Camera component
export const Camera = ({ onCapture, onClear }) => {
  // Set references
  const canvasRef = useRef();
  const videoRef = useRef();
  const { width, ref: resizeRef } = useResizeDetector();

  // Set states
  const [container, setContainer] = useState({ width: 100, height: 300 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  // Set extra utility variables
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  // Handle container resizes
  useEffect(() => {
    if (width) {
      setContainer({
        width: width,
        height: Math.round(width / aspectRatio),
      });
    }
  }, [aspectRatio, width]);

  // Update video reference
  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  // Callbacks
  const handleCanPlay = () => {
    calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    setIsVideoPlaying(true);
    videoRef.current.play();
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext("2d");

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

    canvasRef.current.toBlob((blob) => onCapture(blob), "image/jpeg", 1);
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  };

  const handleClear = () => {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();
  };

  if (!mediaStream) {
    //alert("No media stream found. Check if your camera is active");
    return null;
  }

  /*
  style={${({ flash }) => {
                    if (flash) {
                      return css`
                        animation: ${flashAnimation} 750ms ease-out;
                      `;
                    }
                  }}}
  */
  return (
    <Wrapper>
      <Container
        ref={resizeRef}
        style={{
          height: `${container.height}px`,
          maxWidth: () =>
            setIfExists(
              videoRef.current,
              "videoWidth",
              (value) => `${value}px`
            ),
          maxHeight: () =>
            setIfExists(
              videoRef.current,
              "videoHeight",
              (value) => `${value}px`
            ),
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

        <Flash
          flash={isFlashing.toString()}
          onAnimationEnd={() => setIsFlashing(false)}
        />
      </Container>

      {isVideoPlaying && (
        <Button onClick={isCanvasEmpty ? handleCapture : handleClear}>
          {isCanvasEmpty ? "Take a picture" : "Take another picture"}
        </Button>
      )}
    </Wrapper>
  );
};
