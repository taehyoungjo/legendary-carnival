const initialCallState = {
  callItems: {
    local: {
      videoTrackState: null,
      audioTrackState: null,
    },
  },
  clickAllowTimeoutFired: false,
  camOrMicError: null,
  fatalError: null,
};

const CLICK_ALLOW_TIMEOUT = "CLICK_ALLOW_TIMEOUT";
const PARTICIPANTS_CHANGE = "PARTICIPANTS_CHANGE";
const CAM_OR_MIC_ERROR = "CAM_OR_MIC_ERROR";
const FATAL_ERROR = "FATAL_ERROR";

function callReducer(callState: any, action: any) {
  switch (action.type) {
    case CLICK_ALLOW_TIMEOUT:
      return {
        ...callState,
        clickAllowTimeoutFired: true,
      };
    case PARTICIPANTS_CHANGE:
      const callItems = getCallItems(action.participants);
      return {
        ...callState,
        callItems,
      };
    case CAM_OR_MIC_ERROR:
      return { ...callState, camOrMicError: action.message };
    case FATAL_ERROR:
      return { ...callState, fatalError: action.message };
    default:
      throw new Error();
  }
}

function getLocalCallItem(callItems: any) {
  return callItems["local"];
}

function getCallItems(participants: any) {
  console.log("participants", participants);
  let callItems: any = { ...initialCallState.callItems }; // Ensure we *always* have a local participant
  for (const [id, participant] of Object.entries(participants)) {
    callItems[id] = {
      videoTrackState: (participant as any).tracks.video,
      audioTrackState: (participant as any).tracks.audio,
    };
    if (shouldIncludeScreenCallItem(participant)) {
      callItems[id + "-screen"] = {
        videoTrackState: (participant as any).tracks.screenVideo,
        audioTrackState: (participant as any).tracks.screenAudio,
      };
    }
  }
  return callItems;
}

function shouldIncludeScreenCallItem(participant: any) {
  const trackStatesForInclusion = ["loading", "playable", "interrupted"];
  return (
    trackStatesForInclusion.includes(participant.tracks.screenVideo.state) ||
    trackStatesForInclusion.includes(participant.tracks.screenAudio.state)
  );
}

function isLocal(id: string) {
  return id === "local";
}

function isScreenShare(id: string) {
  return id.endsWith("-screen");
}

function containsScreenShare(callItems: any) {
  return Object.keys(callItems).some((id) => isScreenShare(id));
}

function getMessage(callState: any) {
  function shouldShowClickAllow() {
    const localCallItem = getLocalCallItem(callState.callItems);
    const hasLoaded = localCallItem && !localCallItem.isLoading;
    return !hasLoaded && callState.clickAllowTimeoutFired;
  }

  let header = null;
  let detail = null;
  let isError = false;
  if (callState.fatalError) {
    header = `Fatal error: ${callState.fatalError}`;
    isError = true;
  } else if (callState.camOrMicError) {
    header = `Camera or mic access error: ${callState.camOrMicError}`;
    detail =
      "See https://help.daily.co/en/articles/2528184-unblock-camera-mic-access-on-a-computer to troubleshoot.";
    isError = true;
  } else if (shouldShowClickAllow()) {
    header = 'Click "Allow" to enable camera and mic access';
  } else if (Object.keys(callState.callItems).length === 1) {
    header = "Copy and share this page's URL to invite others";
    detail = window.location.href;
  }
  return header || detail ? { header, detail, isError } : null;
}

export {
  initialCallState,
  CLICK_ALLOW_TIMEOUT,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  callReducer,
  isLocal,
  isScreenShare,
  containsScreenShare,
  getMessage,
};
