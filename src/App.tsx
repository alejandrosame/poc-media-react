import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import "./App.css";

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  height: "100%",
}));

function FullWidthGrid() {
  return (
    <Grid className="Grid" container spacing={2} sx={{ height: "100%" }}>
      <Grid item xs={6}>
        <Item sx={{ backgroundColor: "yellow" }}>
          <p>Left</p>
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item sx={{ backgroundColor: "green" }}>
          <p>Right</p>
        </Item>
      </Grid>
    </Grid>
  );
}

function App() {
  return (
    <div className="App">
      <FullWidthGrid />
    </div>
  );
}

export default App;
