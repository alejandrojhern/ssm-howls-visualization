document.addEventListener("DOMContentLoaded", () => {
  const sceneTitle = document.getElementById("scene-title");
  const sceneDescription = document.getElementById("scene-description");
  const sceneSelectLabel = document.getElementById("scene-select-label");
  const sceneBullets = document.getElementById("scene-bullets");
  const mediaPlaceholder = document.querySelector(".media-placeholder");
  const sceneVisualFill = document.getElementById("scene-visual-fill");
  const sceneVisual = document.getElementById("scene-visual");
  const dialogueRail = document.getElementById("dialogue-rail");
  const dialogueRailLine = dialogueRail?.querySelector(".dialogue-rail-line") ?? null;
  const dialogueBeads = [
    document.getElementById("dialogue-bead-1"),
    document.getElementById("dialogue-bead-2"),
    document.getElementById("dialogue-bead-3")
  ];
  const sceneWooshUp = document.getElementById("scene-woosh-up");
  const sceneWooshLeft = document.getElementById("scene-woosh-left");
  const sceneWooshDown = document.getElementById("scene-woosh-down");
  const sceneWooshRight = document.getElementById("scene-woosh-right");
  const sceneEmbed = document.getElementById("scene-embed");
  const sceneEmbedFrame = document.getElementById("scene-embed-frame");
  const timelinePath = document.getElementById("timeline-path");
  const timelineDots = [
    document.getElementById("timeline-dot-1"),
    document.getElementById("timeline-dot-2"),
    document.getElementById("timeline-dot-3")
  ];
  const sceneButtons = Array.from(document.querySelectorAll(".overview-segment"));
  let activeSceneIndex = 0;
  let activeScene = null;
  let steamOverlayPlayed = false;
  let steamSequenceStarted = false;
  let steamSequenceToken = 0;
  let steamSequenceTimers = [];
  let lastVisualTime = 0;
  let visualLoopCount = 0;
  let steamOverlayRenderToken = 0;
  let dialogueRailRafId = 0;

  const {
    sceneHasWooshOverlays,
    getOverlaySceneValue,
    resolveClipSource,
    playMutedVideo,
    loadLoopingVisual
  } = window.AppRuntimeUtils;

  function clearClip() {
    if (sceneEmbed) {
      sceneEmbed.pause();
      sceneEmbed.hidden = true;
      sceneEmbed.removeAttribute("src");
      sceneEmbed.load();
    }

    if (sceneEmbedFrame) {
      sceneEmbedFrame.hidden = true;
      sceneEmbedFrame.removeAttribute("src");
    }
  }

  function clearSteamSequenceTimers() {
    steamSequenceTimers.forEach((timerId) => window.clearTimeout(timerId));
    steamSequenceTimers = [];
  }

  function hideSteamOverlays() {
    [sceneWooshUp, sceneWooshLeft, sceneWooshDown, sceneWooshRight].forEach((el) => {
      if (!el) {
        return;
      }

      el.hidden = true;
      el.removeAttribute("src");
      el.style.opacity = "";
    });
  }

  function clearSteamOverlay() {
    clearSteamSequenceTimers();
    steamSequenceStarted = false;
    hideSteamOverlays();
  }

  const { scenes, getDialogueRailState, clamp } = window.SceneContent;
  const {
    sceneHasVisualFill,
    updateVisualFillLayer: applyVisualFillLayerState,
    syncVisualFillToMain: syncVisualFillToMainCore
  } = window.VisualFillUtils;

  function hideDialogueBeads() {
    dialogueBeads.forEach((bead) => {
      if (!bead) {
        return;
      }

      bead.style.opacity = "0";
    });
  }

  function updateDialogueRail() {
    if (!dialogueRail) {
      return;
    }

    const tCurrent = sceneVisual && Number.isFinite(sceneVisual.currentTime) ? sceneVisual.currentTime : 0;
    const tElapsed = getActiveVisualElapsedMs() / 1000;
    const t = activeSceneIndex === 1 ? tElapsed : tCurrent;
    const now = performance.now() / 1000;
    const state = getDialogueRailState(activeSceneIndex, t);

    if (dialogueRailLine) {
      dialogueRailLine.style.opacity = String(Number.isFinite(state?.lineOpacity) ? state.lineOpacity : 0.22);
    }

    hideDialogueBeads();

    const beads = Array.isArray(state?.beads) ? state.beads : [];
    beads.slice(0, dialogueBeads.length).forEach((cfg, index) => {
      const bead = dialogueBeads[index];

      if (!bead || !cfg) {
        return;
      }

      const size = clamp(Number.isFinite(cfg.size) ? cfg.size : 8, 4, 18);
      const x = clamp(Number.isFinite(cfg.x) ? cfg.x : 50, 0, 100);
      const y = Number.isFinite(cfg.y) ? cfg.y : 0;
      const opacity = clamp(Number.isFinite(cfg.opacity) ? cfg.opacity : 0.75, 0, 0.8);
      const blur = Math.max(0, Number.isFinite(cfg.blur) ? cfg.blur : 0);

      const microX = Math.sin(now * 2.6 + index * 1.7 + x * 0.03) * 0.22;
      const microY = Math.cos(now * 3.2 + index * 1.2 + x * 0.025) * 0.18;
      const pulse = 1 + Math.sin(now * 3.6 + index * 2.1) * 0.02;

      bead.style.left = `${x}%`;
      bead.style.width = `${size * pulse}px`;
      bead.style.height = `${size * pulse}px`;
      bead.style.opacity = String(opacity);
      bead.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
      bead.style.background = typeof cfg.color === "string" ? cfg.color : "rgba(56, 67, 78, 0.85)";
      bead.style.transform = `translate(calc(-50% + ${microX}px), calc(-100% - 2px + ${y + microY}px))`;
    });
  }

  function startDialogueRailLoop() {
    if (dialogueRailRafId) {
      return;
    }

    const tick = () => {
      updateDialogueRail();
      dialogueRailRafId = window.requestAnimationFrame(tick);
    };

    dialogueRailRafId = window.requestAnimationFrame(tick);
  }

  function updateVisualFillLayer(scene) {
    applyVisualFillLayerState({ scene, sceneVisualFill, mediaPlaceholder });
  }

  function syncVisualFillToMain(force = false) {
    syncVisualFillToMainCore({ sceneVisual, sceneVisualFill, playMutedVideo, force });
  }

  function setOverlaySrc(img, src) {
    if (!img || !src) {
      return;
    }

    const url = new URL(src, window.location.href);
    steamOverlayRenderToken += 1;
    url.searchParams.set("v", `${steamSequenceToken}-${steamOverlayRenderToken}`);
    img.removeAttribute("src");
    img.src = url.href;
  }

  function getActiveVisualElapsedMs() {
    if (!sceneVisual) {
      return 0;
    }

    const duration = Number.isFinite(sceneVisual.duration) && sceneVisual.duration > 0 ? sceneVisual.duration : 0;

    if (!duration) {
      return sceneVisual.currentTime * 1000;
    }

    return (visualLoopCount * duration + sceneVisual.currentTime) * 1000;
  }

  function setWooshOpacityForStage(el, scene, delayMs, stageDelays) {
    if (!el) {
      return;
    }

    if (!scene || !getOverlaySceneValue(scene, "wooshFadeWithProgress", "stepsFadeWithProgress")) {
      el.style.opacity = "";
      return;
    }

    const minOpacityRaw = getOverlaySceneValue(scene, "wooshMinOpacity", "stepsMinOpacity");
    const maxOpacityRaw = getOverlaySceneValue(scene, "wooshMaxOpacity", "stepsMaxOpacity");
    const fadeStartMsRaw = getOverlaySceneValue(scene, "wooshFadeStartMs", "stepsFadeStartMs");
    const fadeEndMsRaw = getOverlaySceneValue(scene, "wooshFadeEndMs", "stepsFadeEndMs");
    const minOpacity = Number.isFinite(minOpacityRaw) ? minOpacityRaw : 0.3;
    const maxOpacity = Number.isFinite(maxOpacityRaw) ? maxOpacityRaw : 1;
    const fadeStartMs = Number.isFinite(fadeStartMsRaw) ? fadeStartMsRaw : -1;
    const fadeEndMs = Number.isFinite(fadeEndMsRaw) ? fadeEndMsRaw : -1;

    if (fadeStartMs >= 0 && fadeEndMs > fadeStartMs) {
      const elapsedMs = getActiveVisualElapsedMs();

      if (elapsedMs <= fadeStartMs) {
        el.style.opacity = String(maxOpacity);
        return;
      }

      if (elapsedMs >= fadeEndMs) {
        el.style.opacity = "0";
        return;
      }

      const t = (elapsedMs - fadeStartMs) / (fadeEndMs - fadeStartMs);
      const opacity = maxOpacity - (maxOpacity - minOpacity) * t;
      el.style.opacity = String(opacity);
      return;
    }

    if (!Array.isArray(stageDelays) || stageDelays.length <= 1) {
      el.style.opacity = String(maxOpacity);
      return;
    }

    const stageIndex = Math.max(0, stageDelays.indexOf(delayMs));
    const t = stageIndex / (stageDelays.length - 1);
    const opacity = maxOpacity - (maxOpacity - minOpacity) * t;
    el.style.opacity = String(opacity);
  }

  function playSteamSequence(scene) {
    if (!scene) {
      return;
    }

    const repeatUntilEnd = Boolean(getOverlaySceneValue(scene, "wooshRepeatUntilEnd", "stepsRepeatUntilEnd"));
    const upSrcRaw = getOverlaySceneValue(scene, "wooshUpSrc", "stepsUpSrc");
    const downSrcRaw = getOverlaySceneValue(scene, "wooshDownSrc", "stepsDownSrc");
    const upSrc = typeof upSrcRaw === "string" ? upSrcRaw.trim() : "";
    const downSrc = typeof downSrcRaw === "string" ? downSrcRaw.trim() : "";
    const upDelayRaw = getOverlaySceneValue(scene, "wooshUpDelayMs", "stepsUpDelayMs");
    const leftDelayRaw = getOverlaySceneValue(scene, "wooshLeftDelayMs", "stepsLeftDelayMs");
    const downDelayRaw = getOverlaySceneValue(scene, "wooshDownDelayMs", "stepsDownDelayMs");
    const rightDelayRaw = getOverlaySceneValue(scene, "wooshRightDelayMs", "stepsRightDelayMs");
    const rightDelayRaw2 = getOverlaySceneValue(scene, "wooshRightDelayMs2", "stepsRightDelayMs2");
    const durationRaw = getOverlaySceneValue(scene, "wooshDurationMs", "stepsDurationMs");
    const leftMsRaw = getOverlaySceneValue(scene, "wooshLeftMs", "stepsLeftMs");
    const rightMsRaw = getOverlaySceneValue(scene, "wooshRightMs", "stepsRightMs");
    const rightMsRaw2 = getOverlaySceneValue(scene, "wooshRightMs2", "stepsRightMs2");
    const upDelayMs = Number.isFinite(upDelayRaw) ? upDelayRaw : 0;
    const leftDelayMs = Number.isFinite(leftDelayRaw) ? leftDelayRaw : upDelayMs;
    const downDelayMs = Number.isFinite(downDelayRaw) ? downDelayRaw : 900;
    const rightDelayMs = Number.isFinite(rightDelayRaw) ? rightDelayRaw : downDelayMs;
    const rightDelayMs2 = Number.isFinite(rightDelayRaw2) ? rightDelayRaw2 : -1;
    const wooshDurationMs = Number.isFinite(durationRaw) ? durationRaw : 900;
    const wooshLeftMs = Number.isFinite(leftMsRaw) ? leftMsRaw : wooshDurationMs;
    const wooshRightMs = Number.isFinite(rightMsRaw) ? rightMsRaw : wooshDurationMs;
    const wooshRightMs2 = Number.isFinite(rightMsRaw2) ? rightMsRaw2 : wooshRightMs;
    const hasLeftEvent = upSrc && sceneWooshLeft && leftDelayMs >= 0;
    const hasDownEvent = downSrc && downDelayMs >= 0;
    const hasRightEvent = downSrc && sceneWooshRight && rightDelayMs >= 0;

    if (!upSrc && !downSrc) {
      return;
    }

    clearSteamSequenceTimers();
    hideSteamOverlays();
    steamSequenceStarted = true;
    steamSequenceToken += 1;
    let sequenceEndMs = 0;
    const stageDelays = Array.from(
      new Set(
        [
          upSrc ? upDelayMs : null,
          hasLeftEvent ? leftDelayMs : null,
          hasRightEvent ? rightDelayMs : null,
          hasRightEvent && rightDelayMs2 >= 0 ? rightDelayMs2 : null,
          hasDownEvent ? downDelayMs : null
        ].filter((value) => Number.isFinite(value))
      )
    ).sort((a, b) => a - b);

    if (upSrc) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshUp, upSrc);
          setWooshOpacityForStage(sceneWooshUp, scene, upDelayMs, stageDelays);
          sceneWooshUp.hidden = false;
        }, upDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene || !sceneWooshUp) {
            return;
          }

          sceneWooshUp.hidden = true;
        }, upDelayMs + wooshDurationMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, upDelayMs + wooshDurationMs);
    }

    if (hasLeftEvent) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshLeft, upSrc);
          setWooshOpacityForStage(sceneWooshLeft, scene, leftDelayMs, stageDelays);
          sceneWooshLeft.hidden = false;
        }, leftDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          sceneWooshLeft.hidden = true;
        }, leftDelayMs + wooshLeftMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, leftDelayMs + wooshLeftMs);
    }

    if (hasDownEvent) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshDown, downSrc);
          setWooshOpacityForStage(sceneWooshDown, scene, downDelayMs, stageDelays);
          sceneWooshDown.hidden = false;
        }, downDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene || !sceneWooshDown) {
            return;
          }

          sceneWooshDown.hidden = true;
        }, downDelayMs + wooshDurationMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, downDelayMs + wooshDurationMs);
    }

    if (hasRightEvent) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshRight, downSrc);
          setWooshOpacityForStage(sceneWooshRight, scene, rightDelayMs, stageDelays);
          sceneWooshRight.hidden = false;
        }, rightDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          sceneWooshRight.hidden = true;
        }, rightDelayMs + wooshRightMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, rightDelayMs + wooshRightMs);

      if (rightDelayMs2 >= 0) {
        steamSequenceTimers.push(
          window.setTimeout(() => {
            if (activeScene !== scene) {
              return;
            }

            setOverlaySrc(sceneWooshRight, downSrc);
            setWooshOpacityForStage(sceneWooshRight, scene, rightDelayMs2, stageDelays);
            sceneWooshRight.hidden = false;
          }, rightDelayMs2)
        );

        steamSequenceTimers.push(
          window.setTimeout(() => {
            if (activeScene !== scene) {
              return;
            }

            sceneWooshRight.hidden = true;
          }, rightDelayMs2 + wooshRightMs2)
        );

        sequenceEndMs = Math.max(sequenceEndMs, rightDelayMs2 + wooshRightMs2);
      }
    }

    if (sequenceEndMs > 0) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeScene !== scene) {
            return;
          }

          hideSteamOverlays();
          steamOverlayPlayed = !repeatUntilEnd;
          steamSequenceStarted = false;
          clearSteamSequenceTimers();
        }, sequenceEndMs)
      );
    }
  }

  function syncSteamOverlay() {
    if (!sceneVisual || !activeScene) {
      return;
    }

    const upSrcRaw = getOverlaySceneValue(activeScene, "wooshUpSrc", "stepsUpSrc");
    const downSrcRaw = getOverlaySceneValue(activeScene, "wooshDownSrc", "stepsDownSrc");
    const steamUntilRaw = getOverlaySceneValue(activeScene, "steamUntil", "stepsUntil");
    const upSrc = typeof upSrcRaw === "string" ? upSrcRaw.trim() : "";
    const downSrc = typeof downSrcRaw === "string" ? downSrcRaw.trim() : "";
    const steamUntil = Number.isFinite(steamUntilRaw) ? steamUntilRaw : 0;
    const withinWindow =
      sceneHasWooshOverlays(activeScene) &&
      (upSrc || downSrc) &&
      !steamOverlayPlayed &&
      sceneVisual.currentTime <= steamUntil;

    if (!withinWindow) {
      if (sceneVisual.currentTime > steamUntil) {
        steamOverlayPlayed = true;
      }

      if (!steamSequenceStarted) {
        hideSteamOverlays();
      }

      return;
    }

    if (!steamSequenceStarted) {
      playSteamSequence(activeScene);
    }
  }

  function renderScene(index) {
    const scene = scenes[index];

    if (!scene) {
      return;
    }

    activeSceneIndex = index;
    activeScene = scene;
    steamOverlayPlayed = false;
    steamSequenceStarted = false;
    lastVisualTime = 0;
    visualLoopCount = 0;

    if (sceneTitle) {
      sceneTitle.textContent = scene.title;
    }

    if (sceneDescription) {
      sceneDescription.textContent = scene.description;
    }

    if (sceneSelectLabel) {
      sceneSelectLabel.textContent = `SELECT ${String(index + 1).padStart(2, "0")}`;
    }

    loadLoopingVisual(sceneVisual, scene.animSrc);
    loadLoopingVisual(sceneVisualFill, scene.animFillSrc);
    updateVisualFillLayer(scene);
    syncVisualFillToMain(true);
    updateDialogueRail();

    if (!sceneHasWooshOverlays(scene)) {
      clearSteamOverlay();
    } else {
      clearSteamOverlay();
      syncSteamOverlay();
    }

    const clipSource = resolveClipSource(scene);
    clearClip();

    if (clipSource) {
      if (clipSource.type === "iframe" && sceneEmbedFrame) {
        sceneEmbedFrame.src = clipSource.url;
        sceneEmbedFrame.hidden = false;
      }

      if (clipSource.type === "video" && sceneEmbed) {
        sceneEmbed.src = clipSource.url;
        sceneEmbed.hidden = false;
        sceneEmbed.load();
      }
    }

    if (sceneBullets) {
      sceneBullets.innerHTML = "";

      scene.bullets.forEach((bullet) => {
        const li = document.createElement("li");
        li.textContent = bullet;
        sceneBullets.appendChild(li);
      });
    }

    if (timelinePath) {
      timelinePath.setAttribute("d", scene.timelinePath);
    }

    timelineDots.forEach((dot, dotIndex) => {
      const point = scene.timelineDots[dotIndex];

      if (!dot || !point) {
        return;
      }

      dot.setAttribute("cx", String(point.cx));
      dot.setAttribute("cy", String(point.cy));
    });

    sceneButtons.forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
  }

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.sceneIndex);

      if (!Number.isNaN(nextIndex)) {
        renderScene(nextIndex);
      }
    });
  });

  if (sceneVisual) {
    sceneVisual.addEventListener("timeupdate", () => {
      if (sceneHasWooshOverlays(activeScene) && sceneVisual.currentTime + 0.35 < lastVisualTime) {
        visualLoopCount += 1;

        if (!Boolean(getOverlaySceneValue(activeScene, "wooshRepeatUntilEnd", "stepsRepeatUntilEnd"))) {
          // Don't interrupt a sequence mid-play just because the base animation looped.
          // This matters when the woosh schedule is longer than the animation loop.
          if (!steamSequenceStarted) {
            steamOverlayPlayed = false;
            steamSequenceStarted = false;
            clearSteamOverlay();
          }
        }
      }

      lastVisualTime = sceneVisual.currentTime;
      syncSteamOverlay();
      syncVisualFillToMain();
      updateDialogueRail();
    });
    sceneVisual.addEventListener("play", () => {
      syncSteamOverlay();
      syncVisualFillToMain(true);
      updateDialogueRail();
    });
    sceneVisual.addEventListener("seeked", () => {
      syncSteamOverlay();
      syncVisualFillToMain(true);
      updateDialogueRail();
    });
    sceneVisual.addEventListener("pause", () => {
      clearSteamOverlay();
      syncVisualFillToMain(true);
      updateDialogueRail();
    });
  }

  if (sceneVisualFill) {
    sceneVisualFill.addEventListener("loadedmetadata", () => {
      syncVisualFillToMain(true);
    });
  }

  renderScene(0);
  updateDialogueRail();
  startDialogueRailLoop();
});
