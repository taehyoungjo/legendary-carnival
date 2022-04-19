import {
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { ReactChild, useContext, useEffect, useReducer } from "react";
import { useLocalParticipant } from "@daily-co/daily-react-hooks";
import { Link } from "react-router-dom";

import CallObjectContext from "./CallObjectContext";
import {
  callReducer,
  CAM_OR_MIC_ERROR,
  CLICK_ALLOW_TIMEOUT,
  containsScreenShare,
  FATAL_ERROR,
  initialCallState,
  isLocal,
  isScreenShare,
  PARTICIPANTS_CHANGE,
} from "./callState";
import Tile from "./Tile";
import { useQuery } from "../Live";

function Cursor({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactChild;
}) {
  return (
    <div
      className="absolute rounded-full drop-shadow-md w-24 h-24 overflow-hidden bg-blue-200 border border-white"
      style={{
        left: x,
        top: y,
      }}
    >
      {children}
    </div>
  );
}

function CursorWithArrow({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactChild;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="drop-shadow-md absolute rounded-full w-3 h-3 top-0 left-0 bg-blue-700 border border-white"></div>
      <div className="drop-shadow-md w-24 h-24 overflow-hidden bg-blue-200 rounded-full border border-white">
        {children}
      </div>
    </div>
  );
}

function getPrefixedLink(url: string) {
  return `http://localhost/?url=${url}`;
}

function VideoTile({ children, url }: { children: ReactChild; url: string }) {
  const deconstructedURL = new URL(url);

  return (
    <div className="flex flex-col space-y-2 items-center">
      <Link to={`?url=${url}`}>
        <div className="rounded-full drop-shadow-md w-24 h-24 overflow-hidden bg-blue-200 border border-white">
          {children}
        </div>
      </Link>

      <div className="w-40 rounded-full bg-blue-100 shadow-md border border-white px-2 py-1">
        <Link to={`?url=${url}`} className="truncate text-blue-700">
          {deconstructedURL.hostname}
        </Link>
      </div>
    </div>
  );
}

export default function Call(props: { roomUrl: string }) {
  const callObject = useContext(CallObjectContext);
  const [callState, dispatch] = useReducer(callReducer, initialCallState);

  const localParticipant = useLocalParticipant();

  const updateMyPresence = useUpdateMyPresence();

  let query = useQuery();
  const decoded = decodeURIComponent(query.get("url") || "");

  useEffect(() => {
    updateMyPresence({
      videoId: localParticipant?.user_id,
    });
  }, [localParticipant]);

  useEffect(() => {
    if (!callObject) return;

    const events = [
      "participant-joined",
      "participant-updated",
      "participant-left",
    ];

    function handleNewParticipantsState() {
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewParticipantsState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewParticipantsState);
      }
    };
  }, [callObject]);

  useEffect(() => {
    if (!callObject) return;

    function handleCameraErrorEvent() {
      dispatch({
        type: CAM_OR_MIC_ERROR,
        message: "Unknown",
      });
    }

    // We're making an assumption here: there is no camera error when callObject
    // is first assigned.

    callObject.on("camera-error", handleCameraErrorEvent);

    return function cleanup() {
      callObject.off("camera-error", handleCameraErrorEvent);
    };
  }, [callObject]);

  useEffect(() => {
    if (!callObject) return;

    function handleErrorEvent() {
      dispatch({
        type: FATAL_ERROR,
        message: "Unknown",
      });
    }

    // We're making an assumption here: there is no error when callObject is
    // first assigned.

    callObject.on("error", handleErrorEvent);

    return function cleanup() {
      callObject.off("error", handleErrorEvent);
    };
  }, [callObject]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: CLICK_ALLOW_TIMEOUT });
    }, 2500);

    return function cleanup() {
      clearTimeout(t);
    };
  }, []);

  function getOtherCursors() {
    const others = useOthers();
    const othersCursors = others.map((user) => user.presence);

    const offSiteVideos: JSX.Element[] = [];

    const tempcursors = othersCursors.map((presence) => {
      const user_id = presence?.videoId as string | null;
      const cursor = presence?.cursor as any;
      const url = presence?.url as string;

      if (user_id && callState.callItems[user_id]) {
        const callItem = callState.callItems[user_id];

        const isLarge =
          isScreenShare(user_id) ||
          (!isLocal(user_id) && !containsScreenShare(callState.callItems));

        const tile = (
          <Tile
            key={user_id}
            videoTrackState={(callItem as any).videoTrackState}
            audioTrackState={(callItem as any).audioTrackState}
            isLocalPerson={isLocal(user_id)}
            isLarge={isLarge}
            disableCornerMessage={isScreenShare(user_id)}
            onClick={() => {}}
          />
        );

        if (url === decoded) {
          return (
            <CursorWithArrow
              key={cursor?.id}
              x={cursor?.x}
              y={cursor?.y}
              children={tile}
            />
          );
        } else {
          offSiteVideos.push(
            <VideoTile key={cursor?.id} children={tile} url={url} />
          );
          return <></>;
        }
      } else {
        return <></>;
      }
    });

    return [tempcursors, offSiteVideos];
  }

  function getOwnCursor() {
    const [myPresence] = useMyPresence();
    const cursor = myPresence?.cursor as any;

    const user_id = "local";
    const callItem = callState.callItems[user_id];

    const isLarge =
      isScreenShare(user_id) ||
      (!isLocal(user_id) && !containsScreenShare(callState.callItems));

    const tile = (
      <Tile
        key={user_id}
        videoTrackState={(callItem as any).videoTrackState}
        audioTrackState={(callItem as any).audioTrackState}
        isLocalPerson={isLocal(user_id)}
        isLarge={isLarge}
        disableCornerMessage={isScreenShare(user_id)}
        onClick={() => {}}
      />
    );

    return (
      <Cursor key={cursor?.id} x={cursor?.x} y={cursor?.y} children={tile} />
    );
  }

  const [cursors, offSiteVideos] = getOtherCursors();
  const ownCursor = getOwnCursor();

  return (
    <>
      <>{cursors}</>
      <>{ownCursor}</>
      <div className="fixed bottom-0 left-0 py-4 px-6 flex space-x-4">
        {offSiteVideos}
      </div>
    </>
  );
}
