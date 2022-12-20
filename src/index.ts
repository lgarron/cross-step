const buttons = document.querySelectorAll(
  "a.timestamp-link",
) as NodeListOf<HTMLElement>;
const video = document.querySelector("video")!;

interface ButtonInfo {
  button: HTMLElement;
  startTimestamp: number;
  endTimestamp: number;
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

function setPercent(buttonInfo: ButtonInfo, timestamp: number): void {
  const percent =
    (100 * (timestamp - buttonInfo.startTimestamp)) /
    (buttonInfo.endTimestamp - buttonInfo.startTimestamp);
  (
    buttonInfo.button as HTMLAnchorElement
  ).style.background = `linear-gradient(90deg, var(--gradient-left) 0 ${percent}%, var(--gradient-right) ${percent}% 100%)`;
  console.log(
    buttonInfo.button,
    `linear-gradient(90deg, --gradient-left 0 ${percent}%, --gradient-right ${percent}% 100%)`,
  );
}

let currentButtonInfo: ButtonInfo | null;
function highlightCurrentTime() {
  const { currentTime } = video;
  if (
    currentButtonInfo &&
    currentButtonInfo.startTimestamp <= currentTime &&
    currentTime < currentButtonInfo.endTimestamp
  ) {
    setPercent(currentButtonInfo, currentTime);
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
        currentButtonInfo.button.style.background = "";
      }
      setPercent(latestButtonInfo, currentTime);
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

const leadIn = document.querySelector("#lead-in")! as HTMLInputElement;
for (let i = 0; i < buttons.length; i++) {
  const button = buttons[i];
  button.addEventListener("click", (e: Event) => {
    video.currentTime = Math.max(
      parseFloat(button.getAttribute("data-timestamp")!) -
        (leadIn.checked ? 6 : 0),
      0,
    );
    video.play();
    video.focus();
    // e.preventDefault();
  });
}
