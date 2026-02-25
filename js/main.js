document.addEventListener("DOMContentLoaded", () => {
  const sceneTitle = document.getElementById("scene-title");
  const sceneDescription = document.getElementById("scene-description");
  const sceneBullets = document.getElementById("scene-bullets");
  const mediaLabel = document.getElementById("media-placeholder-label");
  const clipLabel = document.getElementById("clip-placeholder-label");
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
      mediaLabel: "Key Moment 1",
      clipLabel: "Embed",
      description:
        "Short scene description",
      bullets: [
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point"
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
      mediaLabel: "Key Moment 2",
      clipLabel: "Embed",
      description:
        "Short scene description",
      bullets: [
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point"
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
      mediaLabel: "Key Moment 3",
      clipLabel: "Embed",
      description:
        "Short scene description",
      bullets: [
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point"
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
      mediaLabel: "Key Moment 4",
      clipLabel: "Embed",
      description:
        "Short scene description",
      bullets: [
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point"
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
      mediaLabel: "Key Moment 5",
      clipLabel: "Embed",
      description:
        "Short scene description",
      bullets: [
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point",
        "Brief analytical point"
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

    if (mediaLabel) {
      mediaLabel.textContent = scene.mediaLabel;
    }

    if (clipLabel) {
      clipLabel.textContent = scene.clipLabel;
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
