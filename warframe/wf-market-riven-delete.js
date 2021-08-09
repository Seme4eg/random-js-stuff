openConfirmButtons();

function openConfirmButtons() {
  document
    .querySelectorAll(
      ".auction-entry .auction-entry__buttons button:last-child"
    )
    .forEach(async (el, index, arr) => {
      if (!arr.length) {
        console.log(arr, arr.length);
        window.location.reload();
        window.alert("Done, sir!");
      }
      el.click();
      index === arr.length - 1 && pressDeleteButton();
    });
}

function pressDeleteButton() {
  document
    .querySelectorAll(".auction-entry__removeConfirm button:nth-of-type(1)")
    .forEach((el, index, arr) => {
      el.click();
      index === arr.length - 1 && openConfirmButtons();
    });
}
