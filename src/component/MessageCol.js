// "messages": [
//   {
//     "id": 371938,
//     "message": "I was nowhere to be found, I hate the crowds, you know that.",
//     "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
//     "sender": 61021,
//     "sentAt": "2011-10-05T14:48:00.000Z",
//     "edited": true,
//     "editedAt": "2011-10-05T14:48:00.000Z",
//     "pinned": false,
//     "reacts": [
//       {
//         "react": "string",
//         "user": 61021
//       }
//     ]
//   }
// ]

/////////////////////////
// Select DOM
/////////////////////////

export function setCurrHoverMessage(event, messageObj) {
  const currMessageNode = event.currentTarget;
  messageObj.currHoverMessageId = currMessageNode.id.slice(8);
}

export function parseTime(dateObj) {
  const day = dateObj.toISOString().split("T")[0];
  const time = dateObj.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `${day} ${time}`;
}

export function togglePassword() {
  const displayPwdNode = document.getElementById("profile-display-pwd");
  const hidePwdNode = document.getElementById("profile-hide-pwd");
  const inputPwdNode = document.getElementById("profile-password");

  inputPwdNode.type = inputPwdNode.type === "password" ? "text" : "password";

  displayPwdNode.classList.toggle("hidden");
  hidePwdNode.classList.toggle("hidden");
}
