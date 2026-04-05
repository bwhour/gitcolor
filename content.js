"use strict";

// CSS variable reference (GitHub contribution graph):
//   --contribution-default-bgColor-{0..4}   background fill per activity level
//   --contribution-default-borderColor-{0..4} border per activity level
//
// Example DOM structure:
//   .ContributionCalendar-day[data-level="2"] {
//     fill: var(--contribution-default-bgColor-2);
//     background-color: var(--contribution-default-bgColor-2);
//     border-color: var(--contribution-default-borderColor-2);
//   }

const targetNode = document.body;
const config = { childList: true, subtree: true };
let cachedRandomTheme = null;
let containerObserverRegistered = false;

const randomThemePalettes = [
  ["#010409", "#ffd166", "#f4a261", "#e76f51", "#ff006e"],
  ["#010409", "#caf0f8", "#90e0ef", "#48cae4", "#4361ee"],
  ["#010409", "#d9ed92", "#bef264", "#4ade80", "#06d6a0"],
  ["#010409", "#fbcfe8", "#f9a8d4", "#f472b6", "#db2777"],
  ["#010409", "#ffd6a5", "#ffadad", "#ff8fab", "#f72585"],
  ["#010409", "#ccfbf1", "#5eead4", "#14b8a6", "#0ea5e9"],
];

function applyTheme(colors) {
  const style = document.documentElement.style;

  // Keep empty cells dark so filled cells stand out immediately.
  const borderColor = colors[0] ? "#ffffff0d" : "";

  colors.forEach((color, i) => {
    style.setProperty(`--contribution-default-bgColor-${i}`, color);
    style.setProperty(`--contribution-default-borderColor-${i}`, borderColor);
  });
  const blobStyle = document.querySelector(".js-highlight-blob")?.style;
  if (blobStyle && colors.length > 0) {
    const color = colors[colors.length - 1];
    blobStyle.fill = color;
    blobStyle.stroke = color;
  }
}

function createRandomTheme() {
  if (cachedRandomTheme) {
    return cachedRandomTheme;
  }

  const palette = randomThemePalettes[Math.floor(Math.random() * randomThemePalettes.length)];
  cachedRandomTheme = palette.slice();

  return cachedRandomTheme;
}

function init() {
  applyTheme(createRandomTheme());

  // Guard: register the PJAX navigation observer only once.
  // Re-registering on every init() call would stack observers on the same
  // container, causing exponential re-invocations on each navigation.
  if (!containerObserverRegistered) {
    const container = document.getElementById("js-pjax-container");

    if (container) {
      containerObserverRegistered = true;
      const observer = new MutationObserver(function () {
        if (document.getElementsByClassName("js-yearly-contributions")[0]) {
          // Re-apply the active theme when GitHub navigates between pages.
          init();
        }
      });
      observer.observe(container, { subtree: true, childList: true });
    }
  }
}

(() => {
  // Wait for the contribution graph to appear in the DOM before applying the
  // theme. GitHub renders the graph asynchronously, so we observe until we see
  // the container element, then disconnect immediately.
  const observer = new MutationObserver((mutationsList, observerInstance) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (document.querySelector(".graph-before-activity-overview")) {
          observerInstance.disconnect();
          init();
        }
      }
    }
  });

  observer.observe(targetNode, config);
})();
