document.addEventListener("DOMContentLoaded", () => {
  const sceneTitle = document.getElementById("scene-title");
  const sceneDescription = document.getElementById("scene-description");
  const sceneSelectLabel = document.getElementById("scene-select-label");
  const sceneBullets = document.getElementById("scene-bullets");
  const sceneVisual = document.getElementById("scene-visual");
  const sceneEmbed = document.getElementById("scene-embed");
  const sceneEmbedFrame = document.getElementById("scene-embed-frame");
  const timelinePath = document.getElementById("timeline-path");
  const timelineDots = [
    document.getElementById("timeline-dot-1"),
    document.getElementById("timeline-dot-2"),
    document.getElementById("timeline-dot-3")
  ];
  const sceneButtons = Array.from(document.querySelectorAll(".overview-segment"));

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

  const scenes = [
    {
      title: "THE MOVING CASTLE EMERGES",
      animSrc: "assets/animations/anim1.mp4",
      clipEmbed: "https://drive.google.com/file/d/1qhKMBtasxKoA_uFTc6cFB-1naBlMBKZz/view?usp=sharing",
      description:
        "Short scene description",
      bullets: [
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight"
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
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight"
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
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight"
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
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight"
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
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight",
        "Description of symbol + brief analytical insight"
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

  renderScene(0);
});
