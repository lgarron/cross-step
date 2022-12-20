const buttons = document.querySelectorAll("a.timestamp-link");
const video = document.querySelector("video")!;

interface ButtonInfo {
  button: Element;
  timestamp: number;
}
const buttonInfos: ButtonInfo[] = Array.from(buttons).map((button) => ({
  button,
  timestamp: parseFloat(button.getAttribute("data-timestamp")!),
}));
let currentButton: Element | null;
function highlightCurrentTime() {
  const { currentTime } = video;
  let previousButtonInfo: ButtonInfo | undefined;
  for (const buttonInfo of buttonInfos) {
    if (currentTime <= buttonInfo.timestamp) {
      break;
    }
    previousButtonInfo = buttonInfo;
  }
  if (previousButtonInfo) {
    const { button } = previousButtonInfo;
    if (currentButton !== button) {
      currentButton?.classList.remove("current");
      button.classList.add("current");
      currentButton = button;
    }
  } else {
    currentButton?.classList.remove("current");
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
