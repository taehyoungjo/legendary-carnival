import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import DailyIFrame from "@daily-co/daily-js";

import "./index.css";

import { createClient } from "@liveblocks/client";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
const client = createClient({
  publicApiKey: "pk_live_mqtNaciTdLcpU-PSAe-zIjnc",
});

ReactDOM.render(
  <React.StrictMode>
    <LiveblocksProvider client={client}>
      <RoomProvider id="test-room-id">
        {DailyIFrame.supportedBrowser().supported ? (
          <App />
        ) : (
          <div>Browser not supported</div>
        )}
      </RoomProvider>
    </LiveblocksProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
