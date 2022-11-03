import React, { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Webcam from "react-webcam";

import { Camera } from "./Camera";

import "./App.css";

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  height: "100%",
}));

function FullWidthGrid() {
  const [isShowVideo, setIsShowVideo] = useState(false);
  const videoElement: any = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const startCam = () => {
    setIsShowVideo(true);
  };

  const stopCam = () => {
    if (videoElement.current == null) return;

    let stream = videoElement.current.stream;
    const tracks = stream.getTracks();
    tracks.forEach((track: any) => track.stop());
    setIsShowVideo(false);
  };

  return (
    <Grid className="Grid" container spacing={2} sx={{ height: "100%" }}>
      <Grid item xs={6}>
        <Item sx={{ backgroundColor: "#DDD8D4" }}>
          <div className="camView">
            {isShowVideo && (
              <Webcam
                audio={false}
                ref={videoElement}
                videoConstraints={videoConstraints}
              />
            )}
          </div>
          <p>Commands</p>
          <button onClick={startCam}>Start Video</button>
          <button onClick={stopCam}>Stop Video</button>
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item sx={{ backgroundColor: "#DDD8D4" }}>Right</Item>
      </Grid>
    </Grid>
  );
}

function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();

  return (
    <main className="App">
      {isCameraOpen && (
        <Camera
          onCapture={(blob: any) => setCardImage(blob)}
          onClear={() => setCardImage(undefined)}
        />
      )}
      {cardImage && (
        <div>
          <h2>Preview</h2>
          <img
            className="Preview"
            src={cardImage && URL.createObjectURL(cardImage)}
          />
        </div>
      )}
      <footer>
        <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
        <button
          onClick={() => {
            setIsCameraOpen(false);
            setCardImage(undefined);
          }}
        >
          Close Camera
        </button>
      </footer>
      {/*<FullWidthGrid />*/}
    </main>
  );
}

export default App;
