window.VisualFillUtils = (() => {
  function sceneHasVisualFill(scene) {
    return Boolean(typeof scene?.animFillSrc === "string" && scene.animFillSrc.trim());
  }

  function updateVisualFillLayer({ scene, sceneVisualFill, mediaPlaceholder }) {
    const showFill = sceneHasVisualFill(scene) && sceneVisualFill && Boolean(sceneVisualFill.src);
    const fillMode = scene?.animFillMode === "overlay" ? "overlay" : "fill";

    if (sceneVisualFill) {
      sceneVisualFill.hidden = !showFill;
    }

    if (mediaPlaceholder) {
      mediaPlaceholder.classList.toggle("fill-video-active", Boolean(showFill));
      mediaPlaceholder.classList.toggle("fill-overlay-active", Boolean(showFill && fillMode === "overlay"));
    }
  }

  function syncVisualFillToMain({
    sceneVisual,
    sceneVisualFill,
    playMutedVideo,
    force = false
  }) {
    if (!sceneVisual || !sceneVisualFill || sceneVisualFill.hidden || !sceneVisualFill.src) {
      return;
    }

    const tolerance = force ? 0 : 0.18;
    const mainTime = Number.isFinite(sceneVisual.currentTime) ? sceneVisual.currentTime : 0;
    const fillTime = Number.isFinite(sceneVisualFill.currentTime) ? sceneVisualFill.currentTime : 0;

    if (Math.abs(mainTime - fillTime) > tolerance) {
      try {
        sceneVisualFill.currentTime = mainTime;
      } catch {}
    }

    if (sceneVisual.paused) {
      if (!sceneVisualFill.paused) {
        sceneVisualFill.pause();
      }
      return;
    }

    playMutedVideo(sceneVisualFill);
  }

  return {
    sceneHasVisualFill,
    updateVisualFillLayer,
    syncVisualFillToMain
  };
})();
