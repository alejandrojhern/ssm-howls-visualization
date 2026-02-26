window.SceneContent = (() => {
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function railMover(t, config) {
  const rate = Number.isFinite(config?.rate) ? config.rate : 0.2;
  const offset = Number.isFinite(config?.offset) ? config.offset : 0;
  const duty = clamp(Number.isFinite(config?.duty) ? config.duty : 1, 0.05, 1);
  const jitter = Number.isFinite(config?.jitter) ? config.jitter : 0;
  const yJitter = Number.isFinite(config?.yJitter) ? config.yJitter : 0;
  const jitterFreq = Number.isFinite(config?.jitterFreq) ? config.jitterFreq : 12;
  const cycle = ((t * rate + offset) % 1 + 1) % 1;

  if (cycle > duty) {
    return null;
  }

  const p = duty < 0.999 ? cycle / duty : cycle;
  const x = clamp(4 + p * 92 + Math.sin((t + offset) * jitterFreq) * jitter, 2, 98);
  const y = Math.sin((t + offset * 3) * (jitterFreq * 0.7)) * yJitter;
  return { x, y };
}

function getDialogueRailState(sceneIndex, t) {
  const silent = { beads: [], lineOpacity: 0.18 };

  switch (sceneIndex) {
    case 0:
      return silent;
    case 1: {
      if (t < 7) {
        const p = railMover(t, { rate: 0.62, duty: 0.78, offset: 0.07, jitter: 1.2, yJitter: 0.8, jitterFreq: 20 });
        return {
          lineOpacity: 0.24,
          beads: p ? [{ ...p, size: 7, opacity: 0.86, blur: 0.4, color: "rgba(69, 78, 87, 0.95)" }] : []
        };
      }

      if (t < 16) {
        const duoStart = 8.45;

        if (t < duoStart) {
          return { lineOpacity: 0.24, beads: [] };
        }

        const t2 = t - (duoStart - 7);
        const phase = t2 - 7;
        let smallX = 58;
        let smallMotionT = 1;

        if (t2 < 10.65) {
          const slowLeadT = clamp((t2 - 7) / 3.65, 0, 1);
          const slowLeadEase = 1 - Math.pow(1 - slowLeadT, 2);
          smallX = lerp(10, 27, slowLeadEase);
          smallMotionT = slowLeadT * 0.55;
        } else if (t2 < 15.35) {
          const approachT = clamp((t2 - 10.65) / (15.35 - 10.65), 0, 1);
          const approachEase = 1 - Math.pow(1 - approachT, 2);
          smallX = lerp(27, 58, approachEase);
          smallMotionT = 0.55 + approachT * 0.45;
        }

        const smallY = Math.sin(t2 * 3.4) * lerp(0.55, 0.18, smallMotionT);

        let bigBead = null;

        if (t2 < 10.65) {
          const bigPhase = clamp((t2 - 7) / 3.65, 0, 1);
          const bigEase = 1 - Math.pow(1 - bigPhase, 3);
          const sizePulse = Math.sin(t2 * 8.2) > 0 ? 12 : 10;
          const x = lerp(18, 118, bigEase);

          bigBead = {
            x,
            y: Math.sin(t2 * 4.2 + 0.6) * lerp(0.45, 0.1, bigEase),
            size: sizePulse,
            opacity: 0.8,
            blur: 0.05,
            color: "rgba(56, 67, 78, 0.95)"
          };

          if (x >= 98) {
            bigBead = null;
          }
        }

        return {
          lineOpacity: 0.25,
          beads: [
            { x: smallX, y: smallY, size: 7, opacity: 0.78, blur: 0.2, color: "rgba(69, 78, 87, 0.95)" },
            bigBead
          ].filter(Boolean)
        };
      }

      if (t < 18.2) {
        const meetT = clamp((t - 16) / 2.2, 0, 1);
        const approachT = clamp(meetT / 0.58, 0, 1);
        const ease = 1 - Math.pow(1 - approachT, 3);
        const settle = clamp((meetT - 0.58) / 0.42, 0, 1);
        const start1 = { x: 58, y: Math.sin(16 * 2.1) * 0.2 };
        const start2 = { x: 103, y: -0.1 };
        const target1 = 60.6;
        const target2 = 64.6;
        const x1 = lerp(start1.x, target1, ease);
        const x2 = lerp(start2.x, target2, ease);
        const bounceAmp = lerp(0.45, 0.18, settle);
        const bounce = Math.sin(t * 3.1) * bounceAmp;
        return {
          lineOpacity: 0.23,
          beads: [
            { x: x1, y: -0.25 + bounce, size: 8, opacity: 0.78, blur: 0.4, color: "rgba(69,78,87,.92)" },
            { x: x2, y: 0.2 - bounce, size: 10, opacity: 0.8, blur: 0.28, color: "rgba(56,67,78,.92)" }
          ]
        };
      }

      const endBounce = Math.sin(t * 2.7) * 0.14;
      return {
        lineOpacity: 0.22,
        beads: [
          { x: 60.6, y: -0.22 + endBounce, size: 8, opacity: 0.72, blur: 0.1, color: "rgba(69,78,87,.9)" },
          { x: 64.6, y: 0.18 - endBounce, size: 10, opacity: 0.78, blur: 0.1, color: "rgba(56,67,78,.9)" }
        ]
      };
    }
    case 2: {
      if (t < 6) {
        const p = railMover(t, { rate: 0.33, duty: 0.84, offset: 0.14, jitter: 0.08, yJitter: 0.05 });
        return { lineOpacity: 0.24, beads: p ? [{ ...p, size: 8, opacity: 0.88, blur: 0, color: "rgba(66,72,80,.95)" }] : [] };
      }
      if (t < 15) {
        const p = railMover(t, { rate: 0.5, duty: 0.9, offset: 0.16, jitter: 1.9, yJitter: 1.3, jitterFreq: 18 });
        return { lineOpacity: 0.25, beads: p ? [{ ...p, size: 12, opacity: 0.93, blur: 0.7, color: "rgba(80,88,99,.95)" }] : [] };
      }
      const p = railMover(t, { rate: 0.18, duty: 0.56, offset: 0.12, jitter: 0.18, yJitter: 0.1 });
      return {
        lineOpacity: 0.2,
        beads: p ? [{ ...p, size: 11, opacity: 0.58, blur: 1.3, color: "rgba(95,76,124,.85)" }] : []
      };
    }
    case 3: {
      if (t < 10) {
        const count = Math.sin(t * 0.9) > -0.15 ? 2 : 1;
        const p1 = railMover(t, { rate: 0.28, duty: 0.58, offset: 0.07, jitter: 0.35, yJitter: 0.2, jitterFreq: 9 });
        const p2 = railMover(t, { rate: 0.23, duty: 0.42, offset: 0.53, jitter: 0.25, yJitter: 0.15, jitterFreq: 7 });
        return {
          lineOpacity: 0.22,
          beads: [
            p1 && { ...p1, size: 8, opacity: 0.76, blur: 0.15, color: "rgba(70,78,88,.92)" },
            count > 1 && p2 && { ...p2, size: 7, opacity: 0.68, blur: 0.2, color: "rgba(70,78,88,.82)" }
          ].filter(Boolean)
        };
      }
      const fade = clamp((t - 10) / 10, 0, 1);
      const p1 = railMover(t, { rate: 0.18, duty: 0.36, offset: 0.13, jitter: 0.12, yJitter: 0.08 });
      const p2 = railMover(t, { rate: 0.14, duty: 0.28, offset: 0.58, jitter: 0.08, yJitter: 0.05 });
      return {
        lineOpacity: lerp(0.22, 0.16, fade),
        beads: [
          p1 && { ...p1, size: 8, opacity: lerp(0.65, 0.48, fade), blur: lerp(0.4, 0.8, fade), color: "rgba(88,100,112,.85)" },
          p2 && { ...p2, size: 7, opacity: lerp(0.58, 0.4, fade), blur: lerp(0.5, 0.9, fade), color: "rgba(88,100,112,.78)" }
        ].filter(Boolean)
      };
    }
    case 4: {
      if (t < 8) {
        const count = Math.sin(t * 1.2) > -0.35 ? 2 : 1;
        const p1 = railMover(t, { rate: 0.46, duty: 0.46, offset: 0.1, jitter: 0.8, yJitter: 0.55, jitterFreq: 15 });
        const p2 = railMover(t, { rate: 0.38, duty: 0.34, offset: 0.59, jitter: 0.95, yJitter: 0.7, jitterFreq: 17 });
        return {
          lineOpacity: 0.24,
          beads: [
            p1 && { ...p1, size: 7, opacity: 0.72, blur: 0.35, color: "rgba(70,78,88,.88)" },
            count > 1 && p2 && { ...p2, size: 8, opacity: 0.64, blur: 0.5, color: "rgba(70,78,88,.76)" }
          ].filter(Boolean)
        };
      }
      if (t < 17) {
        const p1 = railMover(t, { rate: 0.54, duty: 0.76, offset: 0.08, jitter: 1.3, yJitter: 0.9, jitterFreq: 20 });
        const p2 = railMover(t, { rate: 0.5, duty: 0.64, offset: 0.41, jitter: 1.6, yJitter: 1.1, jitterFreq: 22 });
        const count = Math.sin(t * 2.8) > -0.55 ? 2 : 1;
        return {
          lineOpacity: 0.22,
          beads: [
            p1 && { ...p1, size: 8, opacity: 0.42, blur: 1.25, color: "rgba(70,78,88,.7)" },
            count > 1 && p2 && { ...p2, size: 9, opacity: 0.34, blur: 1.8, color: "rgba(70,78,88,.6)" }
          ].filter(Boolean)
        };
      }
      if (t < 20) {
        const fade = clamp((t - 17) / 3, 0, 1);
        const p = railMover(t, { rate: lerp(0.18, 0.08, fade), duty: lerp(0.32, 0.14, fade), offset: 0.14 });
        const count = t > 18.8 ? 0 : 1;
        return {
          lineOpacity: lerp(0.18, 0.1, fade),
          beads: count && p ? [{ ...p, size: lerp(8, 6, fade), opacity: lerp(0.36, 0.14, fade), blur: lerp(1.2, 2.1, fade), color: "rgba(70,78,88,.55)" }] : []
        };
      }
      return silent;
    }
    default:
      return silent;
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
    wooshFadeWithProgress: true,
    wooshMinOpacity: 0.75,
    wooshMaxOpacity: 0.75,
    animFillSrc: "assets/animations/animColBg1.mp4",
    animFillMode: "overlay",
    clipEmbed: "https://drive.google.com/file/d/1qhKMBtasxKoA_uFTc6cFB-1naBlMBKZz/view?usp=sharing",
    description:
      "When the film opens, we hear steam, mechanical whirring and clanking fill the frame from offscreen. After the source of the sound finally lumbers into view, the sound syncs with the massive and unstable castle in front of us. A piano theme enters gently after, only arriving once the world has already  established itself through sound design.",
    timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
    timelineDots: [
      { cx: 18, cy: 45 },
      { cx: 50, cy: 61 },
      { cx: 82, cy: 28 }
    ]
  },
  {
    title: "MEETING HOWL",
    animSrc: "assets/animations/anim2.mp4",
    animFillSrc: "assets/animations/animColBg2.mp4",
    animFillMode: "overlay",
    clipSrc: "assets/clips/moment2.mp4",
    clipEmbed: "https://drive.google.com/file/d/1NwOAABfOm_7dLhLYMa8byHK_T8GkCdsN/view?usp=drive_link",
    description:
      "Sophie is moving through a crowded street, the city around her alive with horses, steam, and the murmur of a crowd. When she's stopped by soldiers,  Howl appears and pulls her from the crowd as the world sonically recedes. The score also softens to match what Sophie is feeling.",
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
    animFillSrc: "assets/animations/animColBg3.mp4",
    animFillMode: "overlay",
    clipEmbed: "https://drive.google.com/file/d/1nXqnPPSM_d1fwA54DTlCm_mNAvgY597D/view?usp=drive_link",
    description:
      "The Witch of the Waste follows Sophie home and curses her, immediately adding seventy-two-years to her age. Sophie’s transformation happens alongside a shift in her vocal timbre that reflects her new physical state. After, she passes through the quiet town to board a train, and the film barely acknowledges sonically what just happened to her",
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
    animFillSrc: "assets/animations/animColBg4.mp4",
    animFillMode: "overlay",
    clipEmbed: "https://drive.google.com/file/d/12dXN0QxMD9g4po8prHh29_oWz261kuzz/view?usp=drive_link",
    description:
      "There's never true silence inside Howl's castle, Calcifer constantly crackling among the structure's groans, the sound of pots clashing together, and Howl's clothes swooshing as he moves through the space. The SFX layers dissolve into the musical pulse of the castle. The castle door's distinct switching sound is also introduced here, repeating constantly until it's anchored in our ears so that when we later hear it offscreen, we know Howl has arrived without seeing him.",
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
    animFillSrc: "assets/animations/animColBg5.mp4",
    animFillMode: "overlay",
    clipEmbed: "https://drive.google.com/file/d/1r9N-lNlyQcDT4rjkrFPaAYCRprJVO6pq/view?usp=drive_link",
    description:
      "Later in the film, Howl we see howl mutate into his massive, bird creature form, a war nobody chose forcing his hand. Explosions, alarms, and distorted animal sounds compete with dialogue and a frantic symphony as the city becomes rubble. The lively ambience the film spent its first half establishing is suddenly swallowed by a cloud of smoke.",
    timelinePath: "M2,68 C20,20 42,88 64,38 C76,12 88,72 98,46",
    timelineDots: [
      { cx: 18, cy: 45 },
      { cx: 50, cy: 61 },
      { cx: 82, cy: 28 }
    ]
  },
];

  return { scenes, getDialogueRailState, clamp };
})();
