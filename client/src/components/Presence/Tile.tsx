import { useEffect, useMemo, useRef } from "react";

function getTrackUnavailableMessage(kind: any, trackState: any) {
  if (!trackState) return;
  switch (trackState.state) {
    case "blocked":
      if (trackState.blocked.byPermissions) {
        return `${kind} permission denied`;
      } else if (trackState.blocked.byDeviceMissing) {
        return `${kind} device missing`;
      }
      return `${kind} blocked`;
    case "off":
      if (trackState.off.byUser) {
        return `${kind} muted`;
      } else if (trackState.off.byBandwidth) {
        return `${kind} muted to save bandwidth`;
      }
      return `${kind} off`;
    case "sendable":
      return `${kind} not subscribed`;
    case "loading":
      return `${kind} loading...`;
    case "interrupted":
      return `${kind} interrupted`;
    case "playable":
      return null;
  }
}

export default function Tile(props: {
  videoTrackState: any;
  audioTrackState: any;
  isLocalPerson: boolean;
  disableCornerMessage: boolean;
  isLarge: boolean;
  onClick: () => void;
}) {
  const videoEl = useRef<any>(null);
  const audioEl = useRef<any>(null);

  const videoTrack = useMemo(() => {
    // For video let's use the `track` field, which is only present when video
    // is in the "playable" state.
    // (Using `persistentTrack` could result in a still frame being shown when
    // remote video is muted).
    return props.videoTrackState?.track;
  }, [props.videoTrackState]);

  const audioTrack = useMemo(() => {
    // For audio let's use the `persistentTrack` field, which is present whether
    // or not audio is in the "playable" state.
    // (Using `track` would result in a bug where, if remote audio were unmuted
    // while this call was is in a Safari background tab, audio wouldn't resume
    // playing).
    return props.audioTrackState?.persistentTrack;
  }, [props.audioTrackState]);

  const videoUnavailableMessage = useMemo(() => {
    return getTrackUnavailableMessage("video", props.videoTrackState);
  }, [props.videoTrackState]);

  const audioUnavailableMessage = useMemo(() => {
    return getTrackUnavailableMessage("audio", props.audioTrackState);
  }, [props.audioTrackState]);

  useEffect(() => {
    videoEl.current &&
      (videoEl.current.srcObject = videoTrack && new MediaStream([videoTrack]));
  }, [videoTrack]);

  useEffect(() => {
    audioEl.current &&
      (audioEl.current.srcObject = audioTrack && new MediaStream([audioTrack]));
  }, [audioTrack]);

  function getVideoComponent() {
    return (
      videoTrack && (
        <video
          className="max-w-none h-full"
          autoPlay
          muted
          playsInline
          ref={videoEl}
        />
      )
    );
  }

  function getAudioComponent() {
    return (
      !props.isLocalPerson &&
      audioTrack && <audio autoPlay playsInline ref={audioEl} />
    );
  }

  function getOverlayComponent() {
    // Show overlay when video is unavailable. Audio may be unavailable too.
    return (
      videoUnavailableMessage && (
        <p className="overlay">
          {videoUnavailableMessage}
          {audioUnavailableMessage && (
            <>
              <br />
              {audioUnavailableMessage}
            </>
          )}
        </p>
      )
    );
  }

  function getCornerMessageComponent() {
    // Show corner message when only audio is unavailable.
    return (
      !props.disableCornerMessage &&
      audioUnavailableMessage &&
      !videoUnavailableMessage && (
        <p className="corner">{audioUnavailableMessage}</p>
      )
    );
  }

  function getClassNames() {
    let classNames = "tile";
    classNames += props.isLarge ? " large" : " small";
    props.isLocalPerson && (classNames += " local");
    return classNames;
  }

  return (
    <div
      className={`${getClassNames()} h-full flex flex-col items-center`}
      onClick={props.onClick}
    >
      <div className="background" />
      {getOverlayComponent()}
      {getVideoComponent()}
      {getAudioComponent()}
      {getCornerMessageComponent()}
    </div>
  );
}
