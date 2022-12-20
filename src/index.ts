const buttons = document.querySelectorAll("a.timestamp-link");
const video = document.querySelector("video")!;

interface ButtonInfo {
  button: Element;
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

let currentButtonInfo: ButtonInfo | null;
function highlightCurrentTime() {
  const { currentTime } = video;
  if (
    currentButtonInfo &&
    currentButtonInfo.startTimestamp <= currentTime &&
    currentTime < currentButtonInfo.endTimestamp
  ) {
    return;
  }

  let previousButtonInfo: ButtonInfo | undefined;
  for (const buttonInfo of buttonInfos) {
    if (currentTime <= buttonInfo.startTimestamp) {
      break;
    }
    previousButtonInfo = buttonInfo;
  }
  if (previousButtonInfo) {
    const { button } = previousButtonInfo;
    if (currentButtonInfo?.button !== button) {
      currentButtonInfo?.button.classList.remove("current");
      button.classList.add("current");
      currentButtonInfo = previousButtonInfo;
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
    video.currentTime =
      parseFloat(button.getAttribute("data-timestamp")!) -
      (leadIn.checked ? 6 : 0);
    video.play();
    video.focus();
    // e.preventDefault();
  });
}
