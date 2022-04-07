import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { createClient } from "@liveblocks/client";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
const client = createClient({
  publicApiKey: "pk_live_mqtNaciTdLcpU-PSAe-zIjnc",
});

ReactDOM.render(
  <React.StrictMode>
    <LiveblocksProvider client={client}>
      <RoomProvider id="my-room-id">
        <App />
      </RoomProvider>
    </LiveblocksProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
