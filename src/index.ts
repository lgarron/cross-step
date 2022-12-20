const buttons = document.querySelectorAll(
  "a.timestamp-link",
) as NodeListOf<HTMLElement>;
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
  const startTimestamp = parseFloat(button.getAttribute("data-timestamp")!);
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

const leadIn = document.querySelector("#lead-in")! as HTMLInputElement;
leadIn.checked = localStorage.crossStepAppLeadIn === "true";
leadIn.addEventListener("change", () => {
  localStorage.crossStepAppLeadIn = leadIn.checked ? "true" : "false";
});

const leadInFlash = document.querySelector(
  "#lead-in-flash",
)! as HTMLInputElement;
for (let i = 0; i < buttons.length; i++) {
  const button = buttons[i];
  button.addEventListener("click", (e: Event) => {
    video.currentTime = Math.max(
      parseFloat(button.getAttribute("data-timestamp")!) -
        (leadIn.checked ? 6 : 0),
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
