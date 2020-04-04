window.addEventListener("load", () => {
  const buttons = document.querySelectorAll("button");
  const video = document.querySelector("video")!;
  const leadIn = document.querySelector("#lead-in")! as HTMLInputElement;
  console.log(buttons);
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener("click", () => {
      video.currentTime = parseInt(button.getAttribute("data-timestamp")) - (leadIn.checked ? 6 : 0);
      video.play();
      video.focus();
    });
  }
});
