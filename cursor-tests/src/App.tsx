import { useUpdateMyPresence, useOthers } from "@liveblocks/react";
import "./App.css";

function Cursor({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "10px",
        height: "10px",
        backgroundColor: "red",
      }}
    />
  );
}

function App() {
  const others = useOthers();
  const othersCursors = others.map((user) => user.presence?.cursor);
  const updateMyPresence = useUpdateMyPresence();

  return (
    <div className="App">
      <div
        style={{ width: "100vw", height: "100vh" }}
        onPointerMove={(e) =>
          updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } })
        }
      />
      {othersCursors.map((cursor) => (
        <Cursor key={cursor?.id} x={cursor?.x} y={cursor?.y} />
      ))}
    </div>
  );
}

export default App;
