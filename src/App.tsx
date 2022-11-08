import React, { useState } from "react";

import { Camera } from "./Camera";

import "./App.css";

function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState<Blob | null>(null);

  return (
    <main className="App">
      {isCameraOpen && (
        <Camera
          onCapture={(blob: Blob | null) => setCardImage(blob)}
          onClear={() => setCardImage(null)}
        />
      )}
      {cardImage && (
        <div>
          <h2>Preview</h2>
          <img
            className="Preview"
            alt="Screeshot preview"
            src={cardImage && URL.createObjectURL(cardImage)}
          />
        </div>
      )}
      <footer>
        <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
        <button
          onClick={() => {
            setIsCameraOpen(false);
            setCardImage(null);
          }}
        >
          Close Camera
        </button>
      </footer>
    </main>
  );
}

export default App;
