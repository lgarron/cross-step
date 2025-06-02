import "dashjs";

// 🤨
const { dashjs } = globalThis;

const url =
  "https://garron.net/temp/adaptive-video-test/mpeg-dash-generator/dawn-mazurka/dawn-mazurka.mpd";
const player = dashjs.MediaPlayer().create();
// biome-ignore lint/style/noNonNullAssertion: <explanation>
player.initialize(document.querySelector("#videoPlayer")!, url, true);
console.log("foo", document.querySelector("#videoPlayer")!);

const buttons = document.querySelectorAll(
  "a.timestamp-link",
) as NodeListOf<HTMLElement>;
// biome-ignore lint/style/noNonNullAssertion: Rely on the element to exist.
const video = document.querySelector("video")!;

interface ButtonInfo {
  button: HTMLElement;
  startTimestamp: number;
  endTimestamp: number;
  animation?: Animation;
}
const buttonInfos: ButtonInfo[] = [];

let lastButtonInfo: ButtonInfo | undefined;
for (const button of buttons) {
  const startTimestamp = Number.parseFloat(
    // biome-ignore lint/style/noNonNullAssertion: Rely on the element to exist.
    button.getAttribute("data-timestamp")!,
  );
  const newButtonInfo = {
    button,
    startTimestamp,
  } as ButtonInfo;
  if (lastButtonInfo) {
    lastButtonInfo.endTimestamp = startTimestamp;
  }
  buttonInfos.push(newButtonInfo);
  lastButtonInfo = newButtonInfo;
}
// biome-ignore lint/style/noNonNullAssertion: Must be assigned by now.
lastButtonInfo!.endTimestamp = video.duration;

function setPercent(
  buttonInfo: ButtonInfo,
  timestamp: number,
  type: string,
): void {
  const percent =
    (100 * (timestamp - buttonInfo.startTimestamp)) /
    (buttonInfo.endTimestamp - buttonInfo.startTimestamp);
  buttonInfo.animation?.cancel();
  if (
    ["seeking", "pause"].includes(type) ||
    (type === "seeked" && video.paused === true)
  ) {
    buttonInfo.button.style.backgroundPositionX = `${100 - percent}%`;
    return;
  }
  buttonInfo.animation = buttonInfo.button.animate(
    [
      {
        backgroundPositionX: `${100 - percent}%`,
      },
      {
        backgroundPositionX: "0%",
      },
    ],
    {
      duration: 1000 * (buttonInfo.endTimestamp - timestamp),
      easing: "linear",
    },
  );
}

let currentButtonInfo: ButtonInfo | null;
// biome-ignore lint/style/noInferrableTypes: Explicit is better than implicit.
let lastHotPathTimestamp: number = 0;
function highlightCurrentTime(e: Event) {
  const { currentTime } = video;
  if (
    currentButtonInfo &&
    currentButtonInfo.startTimestamp <= currentTime &&
    currentTime < currentButtonInfo.endTimestamp
  ) {
    // TODO: Listen for the `seeking` and `seeked` events instead.
    if (e.type !== "timeupdate") {
      setPercent(currentButtonInfo, currentTime, e.type);
    }
    lastHotPathTimestamp = currentTime;
    return;
  }

  let latestButtonInfo: ButtonInfo | undefined;
  for (const buttonInfo of buttonInfos) {
    if (currentTime <= buttonInfo.startTimestamp) {
      break;
    }
    latestButtonInfo = buttonInfo;
  }
  if (latestButtonInfo) {
    const { button } = latestButtonInfo;
    if (currentButtonInfo?.button !== button) {
      if (currentButtonInfo) {
        currentButtonInfo.button.classList.remove("current");
        currentButtonInfo.button.style.backgroundPositionX = "00%";
        currentButtonInfo.animation?.cancel();
      }
      setPercent(latestButtonInfo, currentTime, e.type);
      button.classList.add("current");
      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      currentButtonInfo = latestButtonInfo;
    }
  } else {
    currentButtonInfo?.button.classList.remove("current");
  }
}
video.addEventListener("timeupdate", highlightCurrentTime);
video.addEventListener("seeking", highlightCurrentTime);
video.addEventListener("seeked", highlightCurrentTime);
video.addEventListener("play", highlightCurrentTime);
video.addEventListener("pause", highlightCurrentTime);

// biome-ignore lint/style/noNonNullAssertion: Rely on the element to exist.
const leadIn = document.querySelector("#lead-in")! as HTMLInputElement;
// biome-ignore lint/complexity/useLiteralKeys: https://github.com/biomejs/biome/issues/463
leadIn.checked = localStorage["dawnMazurkaAppLeadIn"] === "true";
leadIn.addEventListener("change", () => {
  // biome-ignore lint/complexity/useLiteralKeys: https://github.com/biomejs/biome/issues/463
  localStorage["dawnMazurkaAppLeadIn"] = leadIn.checked ? "true" : "false";
});

// biome-ignore lint/style/noNonNullAssertion: Rely on the element to exist.
const leadInFlash = document.querySelector(
  "#lead-in-flash",
)! as HTMLInputElement;
for (let i = 0; i < buttons.length; i++) {
  const button = buttons[i];
  button.addEventListener("click", (e: Event) => {
    video.currentTime = Math.max(
      // biome-ignore lint/style/noNonNullAssertion: Rely on the element to exist.
      Number.parseFloat(button.getAttribute("data-timestamp")!) -
        (leadIn.checked ? 4.35 : 0),
      0,
    );
    if (leadIn.checked) {
      leadInFlash.animate(
        [{ background: "rgba(128, 128, 128, 0.5)" }, { background: "inherit" }],
        {
          duration: 500,
          easing: "ease-in",
        },
      );
    }
    video.play();
    video.focus();
    e.preventDefault();
  });
}
