import React, { useState, useRef } from "react";
import Measure from "react-measure";
import { useUserMedia } from "../hooks/use-user-media";
import { useCardRatio } from "../hooks/use-card-ratio";
import { useOffsets } from "../hooks/use-offsets";

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: "environment" },
};

const Wrapper = (props) => (
  <div className="Wrapper" {...props}>
    {props.children}
  </div>
);
const Container = (props) => (
  <div className="Container" {...props}>
    {props.children}
  </div>
);
const Canvas = (props) => (
  <canvas className="Canvas" {...props}>
    {props.children}
  </canvas>
);
const Video = (props) => (
  <video className="Video" {...props}>
    {props.children}
  </video>
);
const Overlay = (props) => (
  <div className="Overlay" {...props}>
    {props.children}
  </div>
);
const Flash = (props) => (
  <div className="Flash" {...props}>
    {props.children}
  </div>
);
const Button = (props) => (
  <button className="Container" {...props}>
    {props.children}
  </button>
);

export const Camera = ({ onCapture, onClear }) => {
  const canvasRef = useRef();
  const videoRef = useRef();

  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  const handleResize = (contentRect) => {
    setContainer({
      width: contentRect.bounds.width,
      height: Math.round(contentRect.bounds.width / aspectRatio),
    });
  };

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
    return null;
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <div ref={measureRef} className="container">
          {JSON.stringify(container)}
        </div>
      )}
    </Measure>
  );
  /*
  containerMaxHeight={videoRef.current && videoRef.current.videoHeight}
  containetMaxWidth={videoRef.current && videoRef.current.videoWidth}
  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Wrapper>
          <Container
            ref={measureRef}
            style={{
              height: `${container.height}px`,
              max-width: ${() => containerMaxWidth && `${containerMaxWidth}px`};
              max-height: ${({ maxHeight }) => containerMaxHeight && `${containerMaxHeight}px`};  
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
              style={${({ flash }) => {
                  if (flash) {
                    return css`
                      animation: ${flashAnimation} 750ms ease-out;
                    `;
                  }
                }}}
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
      )}
    </Measure>
  );
  */
};
