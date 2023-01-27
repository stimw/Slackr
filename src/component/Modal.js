export function popUpError(message) {
  const errorBtn = document.getElementById("error-modal-btn");
  const errorModalMsg = document.getElementById("error-modal-msg");
  errorModalMsg.textContent = message;
  errorBtn.click();
}

export function popUpOK() {}
