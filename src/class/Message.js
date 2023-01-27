export default class Message {
  constructor() {
    this.messageList = [];
    this.currHoverMessageId = 0;
    this.allMessageList = [];
  }

  getMessageList(port, channelId, start) {
    return fetch(
      `https://slackr-backend.fly.dev/message/${channelId}?start=${start}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((obj) => obj.messages);
  }

  sendMessage(port, channelId, { message, image }) {
    return fetch(`https://slackr-backend.fly.dev/message/${channelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message,
        image,
      }),
    });
  }

  updateMessage(port, channelId, messageId, { message, image }) {
    return fetch(`https://slackr-backend.fly.dev/message/${channelId}/${messageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message,
        image,
      }),
    });
  }

  pinMessage(port, channelId, messageId) {
    return fetch(
      `https://slackr-backend.fly.dev/message/pin/${channelId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  }

  unPinMessage(port, channelId, messageId) {
    return fetch(
      `https://slackr-backend.fly.dev/message/unpin/${channelId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  }

  deleteMessage(port, channelId, messageId) {
    return fetch(`https://slackr-backend.fly.dev/message/${channelId}/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  reactMessage(port, channelId, messageId, { react }) {
    return fetch(
      `https://slackr-backend.fly.dev/message/react/${channelId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          react,
        }),
      }
    );
  }

  unReactMessage(port, channelId, messageId, { react }) {
    return fetch(
      `https://slackr-backend.fly.dev/message/unreact/${channelId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          react,
        }),
      }
    );
  }
}
