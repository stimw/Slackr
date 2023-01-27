export default class Channel {
  constructor() {
    this.currChannel = {};
    this.currHoverChannelId = "";
    this.channelList = [];
  }

  getChannelList(port) {
    return fetch(`https://slackr-backend.fly.dev/channel`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((obj) => obj.channels);
  }

  createChannel(port, { name, isPrivate, description }) {
    return fetch(`https://slackr-backend.fly.dev/channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: name,
        private: isPrivate,
        description: description,
      }),
    });
  }

  getChannelDetail(port, channelId) {
    return fetch(`https://slackr-backend.fly.dev/channel/${channelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
  }

  updateChannel(port, channelId, { name, description }) {
    return fetch(`https://slackr-backend.fly.dev/channel/${channelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    });
  }

  joinChannel(port, channelID) {
    return fetch(`https://slackr-backend.fly.dev/channel/${channelID}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  inviteChannel(port, channelID, userList) {
    return Promise.all(
      userList.map((userId) => {
        fetch(`https://slackr-backend.fly.dev/channel/${channelID}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId,
          }),
        });
      })
    );
  }

  leaveChannel(port, channelID) {
    return fetch(`https://slackr-backend.fly.dev/channel/${channelID}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }
}
