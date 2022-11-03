import React, { useRef, useState } from "react";

import { Camera } from "./Camera";

import "./App.css";

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
    </main>
  );
}

export default App;
