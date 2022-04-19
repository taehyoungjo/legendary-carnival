import { useCallback, useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall, DailyEvent } from "@daily-co/daily-js";
import { useUpdateMyPresence } from "@liveblocks/react";
import { DailyProvider } from "@daily-co/daily-react-hooks";

import api from "./api";
import CallObjectContext from "./CallObjectContext";
import StartButton from "./StartButton";
import Call from "./Call";
import { useQuery } from "../Live";

const STATE_IDLE = "STATE_IDLE";
const STATE_CREATING = "STATE_CREATING";
const STATE_JOINING = "STATE_JOINING";
const STATE_JOINED = "STATE_JOINED";
const STATE_LEAVING = "STATE_LEAVING";
const STATE_ERROR = "STATE_ERROR";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function Presence() {
  const [appState, setAppState] = useState<string>(STATE_IDLE);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  let query = useQuery();
  const decoded = decodeURIComponent(query.get("url") || "");

  const updateMyPresence = useUpdateMyPresence();

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    if (!decoded) return;
    updateMyPresence({
      url: decoded,
    });
  }, [decoded]);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const createCall = useCallback(() => {
    setAppState(STATE_CREATING);

    return api
      .createRoom()
      .then((room) => room.url)
      .catch((error) => {
        console.log("error creating room", error);
        setRoomUrl(null);
        setAppState(STATE_IDLE);
      });
  }, []);

  const startJoiningCall = useCallback((url: string) => {
    const newCallObject = DailyIframe.createCallObject();
    setRoomUrl(url);
    setCallObject(newCallObject);
    setAppState(STATE_JOINING);
    newCallObject.join({ url });
  }, []);

  const startLeavingCall = useCallback(() => {
    if (!callObject) return;
    // If we're in the error state, we've already "left", so just clean up
    if (appState === STATE_ERROR) {
      callObject.destroy().then(() => {
        setRoomUrl(null);
        setCallObject(null);
        setAppState(STATE_IDLE);
      });
    } else {
      setAppState(STATE_LEAVING);
      callObject.leave();
    }
  }, [callObject, appState]);

  useEffect(() => {
    if (!callObject) return;

    const events: DailyEvent[] = ["joined-meeting", "left-meeting", "error"];

    function handleNewMeetingState() {
      switch (callObject!.meetingState()) {
        case "joined-meeting":
          setAppState(STATE_JOINED);
          break;
        case "left-meeting":
          callObject!.destroy().then(() => {
            setRoomUrl(null);
            setCallObject(null);
            setAppState(STATE_IDLE);
          });
          break;
        case "error":
          setAppState(STATE_ERROR);
          break;
        default:
          break;
      }
    }

    handleNewMeetingState();

    for (const event of events) {
      callObject.on(event, handleNewMeetingState);
    }

    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewMeetingState);
      }
    };
  }, [callObject]);

  const showCall = [STATE_JOINING, STATE_JOINED, STATE_ERROR].includes(
    appState
  );
  const enableCallButtons = [STATE_JOINED, STATE_ERROR].includes(appState);
  const enableStartButton = appState === STATE_IDLE;

  /**
   * oops hehe
   */
  const createTiles = () => {
    let tiles = [];

    for (let j = 0; j < windowDimensions.height; j = j + 8) {
      for (let i = 0; i < windowDimensions.width; i = i + 8) {
        tiles.push(
          <div
            key={`${i}-${j}`}
            style={{
              width: "4px",
              height: "4px",
              left: `${i}px`,
              top: `${j}px`,
            }}
            className="absolute"
          ></div>
        );
      }
    }

    return tiles;
  };

  const tiles = createTiles();

  useEffect(() => {
    createCall().then((url) => {
      if (url) {
        console.log("starting to join call");
        startJoiningCall(url);
      }
    });
  }, []);

  return (
    <div
      className={`h-screen w-screen overflow-scroll`}
      onMouseMove={(e) => {
        updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
      }}
    >
      {tiles}

      <iframe src={decoded} className={`h-full w-full`}></iframe>

      <div className="absolute top-0 left-0">
        {showCall ? (
          <DailyProvider callObject={callObject!}>
            <CallObjectContext.Provider value={callObject}>
              <Call roomUrl={roomUrl!} />
            </CallObjectContext.Provider>
          </DailyProvider>
        ) : (
          <div className="bg-white w-screen">
            {/* <StartButton
              disabled={!enableStartButton}
              onClick={() =>
                createCall().then((url) => {
                  if (url) startJoiningCall(url);
                })
              }
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}
