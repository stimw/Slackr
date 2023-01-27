export default class User {
  constructor() {
    this.currUserId = -1;
    this.userIdList = [];
    this.userList = [];
    this.userListWithId = [];
  }

  getUserList(port) {
    return new Promise((resolve) => {
      fetch(`https://slackr-backend.fly.dev/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((userIds) => {
          this.userIdList = userIds.users.map((user) => user.id);
          return Promise.all(
            userIds.users.map((userId) =>
              fetch(`https://slackr-backend.fly.dev/user/${userId.id}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }).then((res) => res.json())
            )
          ).then((users) => resolve(users));
        });
    });
  }

  updateUser(port, { email, password, name, bio, image }) {
    return fetch(`https://slackr-backend.fly.dev/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        email,
        password,
        name,
        bio,
        image,
      }),
    });
  }
}
