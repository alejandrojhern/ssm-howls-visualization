document.addEventListener("DOMContentLoaded", () => {
  const sceneTitle = document.getElementById("scene-title");
  const sceneDescription = document.getElementById("scene-description");
  const sceneSelectLabel = document.getElementById("scene-select-label");
  const sceneBullets = document.getElementById("scene-bullets");
  const sceneVisual = document.getElementById("scene-visual");
  const sceneEmbed = document.getElementById("scene-embed");
  const timelinePath = document.getElementById("timeline-path");
  const timelineDots = [
    document.getElementById("timeline-dot-1"),
    document.getElementById("timeline-dot-2"),
    document.getElementById("timeline-dot-3")
  ];
  const sceneButtons = Array.from(document.querySelectorAll(".overview-segment"));

  const scenes = [
    {
      title: "THE MOVING CASTLE EMERGES",
      animSrc: "assets/animations/anim1.mp4",
      clipSrc: "assets/clips/moment1.mp4",
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
      clipSrc: "assets/clips/moment3.mp4",
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
      clipSrc: "assets/clips/moment4.mp4",
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
      clipSrc: "assets/clips/moment5.mp4",
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

    if (sceneEmbed) {
      if (scene.clipSrc) {
        const nextClipSrc = new URL(scene.clipSrc, window.location.href).href;

        if (sceneEmbed.src !== nextClipSrc) {
          sceneEmbed.pause();
          sceneEmbed.src = scene.clipSrc;
          sceneEmbed.load();
        }
      } else {
        sceneEmbed.pause();
        sceneEmbed.removeAttribute("src");
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
