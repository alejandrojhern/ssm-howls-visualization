document.addEventListener("DOMContentLoaded", () => {
  const sceneTitle = document.getElementById("scene-title");
  const sceneDescription = document.getElementById("scene-description");
  const sceneSelectLabel = document.getElementById("scene-select-label");
  const sceneBullets = document.getElementById("scene-bullets");
  const sceneVisual = document.getElementById("scene-visual");
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
    const embedCandidate = typeof scene.clipEmbed === "string" ? scene.clipEmbed.trim() : "";
    const clipCandidate = typeof scene.clipSrc === "string" ? scene.clipSrc.trim() : "";
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
    });
  }

  function clearSteamOverlay() {
    clearSteamSequenceTimers();
    steamSequenceStarted = false;
    hideSteamOverlays();
  }

  function setOverlaySrc(img, src) {
    if (!img || !src) {
      return;
    }

    const url = new URL(src, window.location.href);
    url.searchParams.set("v", String(steamSequenceToken));
    img.src = url.href;
  }

  function playSteamSequence(scene) {
    if (!scene) {
      return;
    }

    const upSrc = typeof scene.wooshUpSrc === "string" ? scene.wooshUpSrc.trim() : "";
    const downSrc = typeof scene.wooshDownSrc === "string" ? scene.wooshDownSrc.trim() : "";
    const upDelayMs = Number.isFinite(scene.wooshUpDelayMs) ? scene.wooshUpDelayMs : 0;
    const leftDelayMs = Number.isFinite(scene.wooshLeftDelayMs) ? scene.wooshLeftDelayMs : upDelayMs;
    const downDelayMs = Number.isFinite(scene.wooshDownDelayMs) ? scene.wooshDownDelayMs : 900;
    const rightDelayMs = Number.isFinite(scene.wooshRightDelayMs) ? scene.wooshRightDelayMs : downDelayMs;
    const rightDelayMs2 = Number.isFinite(scene.wooshRightDelayMs2) ? scene.wooshRightDelayMs2 : -1;
    const wooshDurationMs = Number.isFinite(scene.wooshDurationMs) ? scene.wooshDurationMs : 900;
    const wooshLeftMs = Number.isFinite(scene.wooshLeftMs) ? scene.wooshLeftMs : wooshDurationMs;
    const wooshRightMs = Number.isFinite(scene.wooshRightMs) ? scene.wooshRightMs : wooshDurationMs;
    const wooshRightMs2 = Number.isFinite(scene.wooshRightMs2) ? scene.wooshRightMs2 : wooshRightMs;

    if (!upSrc && !downSrc) {
      return;
    }

    clearSteamSequenceTimers();
    hideSteamOverlays();
    steamSequenceStarted = true;
    steamSequenceToken += 1;
    let sequenceEndMs = 0;

    if (upSrc) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshUp, upSrc);
          sceneWooshUp.hidden = false;
        }, upDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene || !sceneWooshUp) {
            return;
          }

          sceneWooshUp.hidden = true;
        }, upDelayMs + wooshDurationMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, upDelayMs + wooshDurationMs);
    }

    if (upSrc && sceneWooshLeft) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshLeft, upSrc);
          sceneWooshLeft.hidden = false;
        }, leftDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          sceneWooshLeft.hidden = true;
        }, leftDelayMs + wooshLeftMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, leftDelayMs + wooshLeftMs);
    }

    if (downSrc) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshDown, downSrc);
          sceneWooshDown.hidden = false;
        }, downDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene || !sceneWooshDown) {
            return;
          }

          sceneWooshDown.hidden = true;
        }, downDelayMs + wooshDurationMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, downDelayMs + wooshDurationMs);
    }

    if (downSrc && sceneWooshRight) {
      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          setOverlaySrc(sceneWooshRight, downSrc);
          sceneWooshRight.hidden = false;
        }, rightDelayMs)
      );

      steamSequenceTimers.push(
        window.setTimeout(() => {
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          sceneWooshRight.hidden = true;
        }, rightDelayMs + wooshRightMs)
      );

      sequenceEndMs = Math.max(sequenceEndMs, rightDelayMs + wooshRightMs);

      if (rightDelayMs2 >= 0) {
        steamSequenceTimers.push(
          window.setTimeout(() => {
            if (activeSceneIndex !== 0 || activeScene !== scene) {
              return;
            }

            setOverlaySrc(sceneWooshRight, downSrc);
            sceneWooshRight.hidden = false;
          }, rightDelayMs2)
        );

        steamSequenceTimers.push(
          window.setTimeout(() => {
            if (activeSceneIndex !== 0 || activeScene !== scene) {
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
          if (activeSceneIndex !== 0 || activeScene !== scene) {
            return;
          }

          hideSteamOverlays();
          steamOverlayPlayed = true;
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

    const upSrc = typeof activeScene.wooshUpSrc === "string" ? activeScene.wooshUpSrc.trim() : "";
    const downSrc = typeof activeScene.wooshDownSrc === "string" ? activeScene.wooshDownSrc.trim() : "";
    const steamUntil = Number.isFinite(activeScene.steamUntil) ? activeScene.steamUntil : 0;
    const withinWindow =
      activeSceneIndex === 0 &&
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

  const scenes = [
    {
      title: "THE MOVING CASTLE EMERGES",
      animSrc: "assets/animations/anim1.mp4",
      wooshUpSrc: "assets/animations/wooshUp.gif",
      wooshDownSrc: "assets/animations/wooshDown.gif",
      wooshUpDelayMs: 2000,
      wooshLeftDelayMs: 4000,
      wooshRightDelayMs: 4000,
      wooshRightDelayMs2: 6000,
      wooshDownDelayMs: 7000,
      wooshDurationMs: 900,
      wooshRightMs: 900,
      wooshRightMs2: 900,
      steamUntil: 8.5,
      clipEmbed: "https://drive.google.com/file/d/1qhKMBtasxKoA_uFTc6cFB-1naBlMBKZz/view?usp=sharing",
      description:
        "Short scene description",
      bullets: [
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "I might just scrap this section lolol"
      ],
      timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
      timelineDots: [
        { cx: 18, cy: 45 },
        { cx: 50, cy: 61 },
        { cx: 82, cy: 28 }
      ]
    },
    {
      title: "FOREGROUNDING HOWL",
      animSrc: "assets/animations/anim2.mp4",
      clipSrc: "assets/clips/moment2.mp4",
      clipEmbed: "https://drive.google.com/file/d/1NwOAABfOm_7dLhLYMa8byHK_T8GkCdsN/view?usp=drive_link",
      description:
        "Short scene description",
      bullets: [
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "I might just scrap this section lolol"
      ],
      timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
      timelineDots: [
        { cx: 18, cy: 45 },
        { cx: 50, cy: 61 },
        { cx: 82, cy: 28 }
      ]
    },
    {
      title: "EMPATHETIC TRANSFORMATION",
      animSrc: "assets/animations/anim3.mp4",
      clipEmbed: "https://drive.google.com/file/d/1nXqnPPSM_d1fwA54DTlCm_mNAvgY597D/view?usp=drive_link",
      description:
        "Short scene description",
      bullets: [
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "I might just scrap this section lolol"
      ],
      timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
      timelineDots: [
        { cx: 18, cy: 45 },
        { cx: 50, cy: 61 },
        { cx: 82, cy: 28 }
      ]
    },
    {
      title: "A CASTLE THAT BREATHES",
      animSrc: "assets/animations/anim4.mp4",
      clipEmbed: "https://drive.google.com/file/d/12dXN0QxMD9g4po8prHh29_oWz261kuzz/view?usp=drive_link",
      description:
        "Short scene description",
      bullets: [
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "I might just scrap this section lolol"
      ],
      timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
      timelineDots: [
        { cx: 18, cy: 45 },
        { cx: 50, cy: 61 },
        { cx: 82, cy: 28 }
      ]
    },
    {
      title: "THE ORCHESTRATION OF WAR",
      animSrc: "assets/animations/anim5.mp4",
      clipEmbed: "https://drive.google.com/file/d/1r9N-lNlyQcDT4rjkrFPaAYCRprJVO6pq/view?usp=drive_link",
      description:
        "Short scene description",
      bullets: [
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "Description and/or brief analytical insight",
        "I might just scrap this section lolol"
      ],
      timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
      timelineDots: [
        { cx: 18, cy: 45 },
        { cx: 50, cy: 61 },
        { cx: 82, cy: 28 }
      ]
    },
  ];

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

    if (sceneTitle) {
      sceneTitle.textContent = scene.title;
    }

    if (sceneDescription) {
      sceneDescription.textContent = scene.description;
    }

    if (sceneSelectLabel) {
      sceneSelectLabel.textContent = `SELECT ${String(index + 1).padStart(2, "0")}`;
    }

    if (sceneVisual) {
      if (scene.animSrc) {
        const nextAnimSrc = new URL(scene.animSrc, window.location.href).href;

        if (sceneVisual.src !== nextAnimSrc) {
          sceneVisual.src = scene.animSrc;
          sceneVisual.load();
        }

        const playPromise = sceneVisual.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        sceneVisual.pause();
        sceneVisual.removeAttribute("src");
        sceneVisual.load();
      }
    }

    if (!scene.wooshUpSrc && !scene.wooshDownSrc) {
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
      if (activeSceneIndex === 0 && sceneVisual.currentTime + 0.35 < lastVisualTime) {
        steamOverlayPlayed = false;
        steamSequenceStarted = false;
        clearSteamOverlay();
      }

      lastVisualTime = sceneVisual.currentTime;
      syncSteamOverlay();
    });
    sceneVisual.addEventListener("play", syncSteamOverlay);
    sceneVisual.addEventListener("seeked", syncSteamOverlay);
    sceneVisual.addEventListener("pause", () => {
      clearSteamOverlay();
    });
  }

  renderScene(0);
});
