window.AppRuntimeUtils = (() => {
  function sceneHasWooshOverlays(scene) {
    if (!scene) {
      return false;
    }

    const upSrc = typeof scene.wooshUpSrc === "string" ? scene.wooshUpSrc.trim() : "";
    const downSrc = typeof scene.wooshDownSrc === "string" ? scene.wooshDownSrc.trim() : "";
    return Boolean(upSrc || downSrc);
  }

  function getOverlaySceneValue(scene, wooshKey, stepsKey = wooshKey) {
    if (!scene) {
      return undefined;
    }

    const useSteps = scene.overlayType === "steps";

    if (useSteps && stepsKey in scene) {
      return scene[stepsKey];
    }

    return scene[wooshKey];
  }

  function toDrivePreviewUrl(url) {
    if (!url) {
      return "";
    }

    try {
      const parsed = new URL(url, window.location.href);

      if (!parsed.hostname.includes("drive.google.com")) {
        return "";
      }

      if (parsed.pathname.includes("/preview")) {
        return parsed.href;
      }

      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);

      if (fileMatch) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }

      const fileId = parsed.searchParams.get("id");

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    } catch {
      return "";
    }

    return "";
  }

  function resolveClipSource(scene) {
    const embedCandidate = typeof scene?.clipEmbed === "string" ? scene.clipEmbed.trim() : "";
    const clipCandidate = typeof scene?.clipSrc === "string" ? scene.clipSrc.trim() : "";
    const driveUrl = toDrivePreviewUrl(embedCandidate || clipCandidate);

    if (driveUrl) {
      return { type: "iframe", url: driveUrl };
    }

    if (embedCandidate) {
      return { type: "iframe", url: embedCandidate };
    }

    if (clipCandidate) {
      return { type: "video", url: clipCandidate };
    }

    return null;
  }

  function playMutedVideo(video) {
    if (!video) {
      return;
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function loadLoopingVisual(video, src) {
    if (!video) {
      return;
    }

    const nextSrc = typeof src === "string" ? src.trim() : "";

    if (!nextSrc) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      return;
    }

    const nextUrl = new URL(nextSrc, window.location.href).href;

    if (video.src !== nextUrl) {
      video.src = nextSrc;
      video.load();
    }

    playMutedVideo(video);
  }

  return {
    sceneHasWooshOverlays,
    getOverlaySceneValue,
    toDrivePreviewUrl,
    resolveClipSource,
    playMutedVideo,
    loadLoopingVisual
  };
})();
