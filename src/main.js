import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";
import { HashRouter } from "./HashRouter.js";
import {
  cloneInviteUserNode,
  exitChannelPage,
  exitProfilePage,
  keepChannelHover,
  removeSiblingHover,
  setCurrHoverChannel,
  showBottomUser,
  sortCallback,
  toggleCategory,
} from "./component/ChannelList.js";
import { displayLogIn, hideAuth, login, register } from "./Auth.js";
import User from "./class/User.js";
import Channel from "./class/Channel.js";
import Message from "./class/Message.js";
import { popUpError } from "./component/Modal.js";
import {
  parseTime,
  setCurrHoverMessage,
  togglePassword,
} from "./component/MessageCol.js";

/////////////////////////
// Objects Initialization
/////////////////////////
const userObj = new User();
const channelObj = new Channel();
const messageObj = new Message();

/////////////////////////
// Create Router
/////////////////////////
window.router = new HashRouter();

/////////////////////////
// Auth
/////////////////////////
// if (localStorage.token) {
//   afterLogin();
//   hideAuth();
// }

document.getElementById("loginSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  login(BACKEND_PORT, userObj, afterLogin);
});

document.getElementById("registerSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  register(BACKEND_PORT, userObj, afterLogin);
});

document.getElementById("registerLink").addEventListener("click", (e) => {
  e.preventDefault();
  const loginPage = document.getElementById("login");
  const registerPage = document.getElementById("register");
  registerPage.classList.remove("hidden");
  loginPage.classList.add("hidden");
});

document.getElementById("registerBack").addEventListener("click", (e) => {
  e.preventDefault();
  displayLogIn();
});

/////////////////////////
// Main function: after login
/////////////////////////

function afterLogin() {
  handleEventListener();

  return (
    channelObj
      .getChannelList(BACKEND_PORT)
      // write into channelList
      .then((channelList) => {
        channelObj.channelList = channelList;
      })
      // render channelList
      .then(() => renderChannelList(channelObj.channelList))
      // register routes
      .then(() => registerChannelAll(channelObj.channelList))
      // keep curr channel hover
      .then(() => {
        if (Object.keys(channelObj.currChannel).length) {
          const currChannelNode = document.getElementById(
            `channel-${channelObj.currChannel.id}`
          );
          removeSiblingHover(currChannelNode);
          keepChannelHover(currChannelNode);
        }
      })
      // render user
      .then(() => {
        userObj
          .getUserList(BACKEND_PORT)
          .then((users) => {
            userObj.userList = users;
          })
          .then(() => {
            userObj.userListWithId = [];
            for (let i = 0; i < userObj.userList.length; i++) {
              userObj.userListWithId.push({
                id: userObj.userIdList[i],
                ...userObj.userList[i],
              });
            }
            userObj.userListWithId.sort(sortCallback);
          })
          .then(registerProfile)
          .then(registerUsersProfile)
          .then(() => {
            const onlineUsersDOM = document.getElementById("all-users-number");
            onlineUsersDOM.textContent = `${userObj.userList.length}`;
          })
          .then(() => {
            showBottomUser(userObj);
          })
          .catch((error) => {
            popUpError(`${error.message}`);
          });
      })
      .catch((error) => {
        popUpError(`${error.message}`);
      })
  );
}

function fetchAndRenderUser() {
  userObj
    .getUserList(BACKEND_PORT)
    .then((users) => {
      userObj.userList = users;
    })
    .then(() => {
      userObj.userListWithId = [];
      for (let i = 0; i < userObj.userList.length; i++) {
        userObj.userListWithId.push({
          id: userObj.userIdList[i],
          ...userObj.userList[i],
        });
      }
      userObj.userListWithId.sort(sortCallback);
    })
    // recover channel routes
    .then(() => {
      registerChannelAll(channelObj.channelList);
    })
    .then(registerProfile)
    .then(registerUsersProfile)
    .then(() => {
      const onlineUsersDOM = document.getElementById("all-users-number");
      onlineUsersDOM.textContent = `${userObj.userList.length}`;
    })
    .then(() => {
      showBottomUser(userObj);
    })
    .catch((error) => {
      popUpError(`${error.message}`);
    });
}

function fetchAndRenderChannel() {
  channelObj
    .getChannelList(BACKEND_PORT)
    // write into channelList
    .then((channelList) => {
      channelObj.channelList = channelList;
    })
    // render channelList
    .then(() => renderChannelList(channelObj.channelList))
    // register routes
    .then(() => registerChannelAll(channelObj.channelList))
    // keep curr channel hover
    .then(() => {
      if (Object.keys(channelObj.currChannel).length) {
        const currChannelNode = document.getElementById(
          `channel-${channelObj.currChannel.id}`
        );
        removeSiblingHover(currChannelNode);
        keepChannelHover(currChannelNode);
      }
    })
    .then(registerProfile)
    .then(registerUsersProfile)
    .catch((error) => {
      popUpError(`${error.message}`);
    });
}

/////////////////////////
// Register Routes
/////////////////////////

function registerChannelAll(channels) {
  window.router.clear();
  channels.forEach((channel) => {
    registerChannel(channel);
  });
}

// Channel route callback
function registerChannel(channel) {
  window.router.register(`channel=${channel.id}`, () => {
    exitProfilePage();

    if (!channel.members.includes(+localStorage.getItem("userId"))) {
      popUpError("You're not the member of this channel");
      return;
    }

    // 1. add hover on channel Col
    const channelNode = document.getElementById(`channel-${channel.id}`);
    removeSiblingHover(channelNode);
    keepChannelHover(channelNode);

    // 2. change currChannel
    channelObj.currChannel = channel;

    // 3. Remove previous messages
    messageObj.messageList = [];
    const messageContainer = document.getElementById("message-container");
    messageContainer.replaceChildren();
    messageContainer.parentElement.children[1]?.remove();

    // 3.5 create a loading
    const loadingIcon = document.getElementById("loadingIcon").cloneNode(true);
    loadingIcon.classList.remove("!hidden");
    loadingIcon.id = `loadingIcon-${channel.id}`;
    messageContainer.parentElement.append(loadingIcon);

    // 4. render messages, async
    // renderMessages(channel, 0);
    renderMessagesWithLoading(channel, loadingIcon.id);

    // 5. hide homepage
    const messageCol = document.getElementById("message-col");
    const homepage = document.getElementById("homepage");
    messageCol.classList.remove("!hidden");
    homepage.classList.add("!hidden");

    // 6. change chanel nav
    const detailName = document.getElementById("channel-detail-name");
    const detailDesc = document.getElementById("channel-detail-description");
    const detailPrivate = document.getElementById("channel-detail-private");
    const detailCreator = document.getElementById("channel-detail-creator");
    const detailTime = document.getElementById("channel-detail-time");
    channelObj.getChannelDetail(BACKEND_PORT, channel.id).then((data) => {
      detailName.textContent = data.name;
      detailDesc.textContent = data.description;
      detailPrivate.textContent = data.private ? "private" : "public";

      const creator = userObj.userListWithId.find((u) => u.id === data.creator);
      detailCreator.textContent = `created by ${creator.name}`;

      detailTime.textContent = `created at ${parseTime(
        new Date(data.createdAt)
      )}`;
    });
  });
}

// Profile route callback
function registerProfile() {
  window.router.register("profile", () => {
    const profileNode = document.getElementById("profile");
    const profileUsersNode = document.getElementById("profile-users");
    profileUsersNode.classList.add("!hidden");
    exitChannelPage(channelObj);

    // get curr user
    const userId = +localStorage.getItem("userId");
    const user = userObj.userListWithId.find((u) => u.id === userId);

    // handle profile page
    const nameNode = document.getElementById("profile-name");
    const emailNode = document.getElementById("profile-email");
    // const pwdNode = document.getElementById("profile-password");
    const bioNode = document.getElementById("profile-bio");
    const avatarNode = document.getElementById("profile-avatar");

    nameNode.value = user.name;
    emailNode.value = user.email;
    bioNode.value = user.bio;
    avatarNode.src = user.image || "./dist/avatar/25.png";

    profileNode.classList.remove("!hidden");
  });
}

// All Users Profiles route callback
function registerUsersProfile() {
  userObj.userListWithId.forEach((user) => {
    window.router.register(`profile=${user.id}`, () => {
      const profileNode = document.getElementById("profile");
      const profileUsersNode = document.getElementById("profile-users");
      profileNode.classList.add("!hidden");
      exitChannelPage(channelObj);

      const nameNode = document.getElementById("profile-user-name");
      const avatarNode = document.getElementById("profile-user-avatar");
      const emailNode = document.getElementById("profile-user-email");
      const bioNode = document.getElementById("profile-user-bio");

      nameNode.textContent = user.name;
      avatarNode.setAttribute("src", user.image || "./dist/avatar/25.png");
      emailNode.textContent = user.email;
      bioNode.textContent = user.bio;

      profileUsersNode.classList.remove("!hidden");
    });
  });
}

/////////////////////////
// Render Channel List
/////////////////////////
toggleCategory();

const channelList = document.getElementById("channelList");
const channelListUnjoined = document.getElementById("channelList-unjoined");

function cloneChannel(inputChannel, isJoined = true) {
  const channel = isJoined
    ? document.getElementById("channel-example").cloneNode(true)
    : document.getElementById("channel-example-unjoined").cloneNode(true);

  const channelNameNode = channel.children[2];

  channel.id = `channel-${inputChannel.id}`;
  if (isJoined) {
    channel.href = `/#channel=${inputChannel.id}`;
  }
  channelNameNode.textContent = inputChannel.name;

  if (inputChannel.private) {
    channel.children[0].classList.add("hidden");
  } else {
    channel.children[1].classList.add("hidden");
  }

  channel.classList.remove("!hidden");

  // Add Event Listener
  if (!isJoined) {
    const joinBtn = channel.children[3];
    joinBtn.addEventListener("click", () => {
      channelObj.joinChannel(BACKEND_PORT, inputChannel.id).then(() => {
        fetchAndRenderChannel();
      });
    });
  }

  if (isJoined) {
    const channelInviteNode = channel.children[3];
    const channelEditNode = channel.children[4];
    channelEditNode.addEventListener("click", () => {
      channelObj.getChannelDetail(BACKEND_PORT, inputChannel.id).then((obj) => {
        // set details in channel edit modal
        const form = document.getElementById("edit-channel-form");
        const channelNameInput = form.elements["channel-name-edit"];
        const channelDescInput = form.elements["channel-description-edit"];
        channelNameInput.value = obj.name;
        channelDescInput.value = obj.description;
      });
    });
    channelInviteNode.addEventListener("click", () => {
      const ulNode = document.getElementById("invite-ul");
      ulNode.replaceChildren();

      const currHoverChannel = channelObj.channelList.find(
        (c) => c.id === +channelObj.currHoverChannelId
      );

      userObj.userListWithId.forEach((u) => {
        if (!currHoverChannel.members.includes(u.id)) {
          const cloneNode = cloneInviteUserNode(u);
          ulNode.appendChild(cloneNode);
        }
      });

      if (ulNode.children.length === 0) {
        const textNode = document.createTextNode("All users have joined...");
        ulNode.appendChild(textNode);
      }
    });
  }

  channel.addEventListener("mouseenter", (e) => {
    setCurrHoverChannel(e, channelObj);
  });

  return channel;
}

function renderChannelList(channels) {
  const currUserId = +localStorage.getItem("userId");
  channelList.replaceChildren();
  channelListUnjoined.replaceChildren();
  channels.forEach((obj) => {
    if (obj.members.includes(currUserId)) {
      const channelNode = cloneChannel(obj);
      channelList.appendChild(channelNode);
    } else {
      if (!obj.private) {
        const channelNode = cloneChannel(obj, false);
        channelListUnjoined.appendChild(channelNode);
      }
    }
  });
}

/////////////////////////
// Render Messages
/////////////////////////

const messageContainer = document.getElementById("message-container");

function cloneMessage(msg) {
  const message = document.getElementById("message-example").cloneNode(true);

  // 0. Select Children
  const messageAvatar = message.children[0];
  const messageUserName = message.children[1].children[0].children[0];
  const messageSendAt = message.children[1].children[0].children[1];
  const editTimeNode = message.children[1].children[0].children[2];
  const messageText = message.children[1].children[1];
  const messageImage = message.children[1].children[2];
  const buttonEye = message.children[1].children[3].children[0];
  const buttonGood = message.children[1].children[3].children[1];
  const buttonBad = message.children[1].children[3].children[2];

  const actionBtnReaction = message.children[2].children[0];
  const actionBtnPin = message.children[2].children[1];
  const actionBtnEdit = message.children[2].children[2];
  const actionBtnDelete = message.children[2].children[3];

  // 1.

  // 2. Parse the Date
  const date = parseTime(new Date(msg.sentAt));

  // 3. Find sender's avatar
  const senderId = msg.sender;
  const idIndex = userObj.userIdList.indexOf(senderId);
  const sender = userObj.userList[idIndex];

  // 4. count reaction
  let eye = 0,
    good = 0,
    bad = 0;

  if (msg.reacts.length > 0) {
    msg.reacts.forEach((react) => {
      if (react.react === "👀") eye++;
      if (react.react === "🥳") good++;
      if (react.react === "😵") bad++;
    });
  }

  if (eye === 0) buttonEye.classList.add("!hidden");
  if (good === 0) buttonGood.classList.add("!hidden");
  if (bad === 0) buttonBad.classList.add("!hidden");

  // 5. Replace the attribute
  message.id = `message-${msg.id}`;

  if (sender.image) messageAvatar.src = sender.image;
  messageUserName.textContent = sender.name;
  messageUserName.href = `/#profile=${senderId}`;
  messageSendAt.textContent = date;
  messageText.textContent = msg.message;
  messageImage.src = msg.image || ""; // image can be undefined
  buttonEye.firstElementChild.textContent = eye.toString();
  buttonGood.firstElementChild.textContent = good.toString();
  buttonBad.firstElementChild.textContent = bad.toString();
  if (msg.pinned) {
    actionBtnPin.dataset.tip = "Unpin";
  }
  if (msg.edited) {
    editTimeNode.textContent = `Edited: ${parseTime(new Date(msg.editedAt))}`;
    editTimeNode.classList.remove("!hidden");
  }

  // 6. Remove hidden
  message.classList.remove("!hidden");

  // 7. Add listener
  message.addEventListener("mouseenter", (e) => {
    setCurrHoverMessage(e, messageObj);
  });

  actionBtnEdit.addEventListener("click", () => {
    const messageContentEdit = document.getElementById("message-content-edit");
    messageContentEdit.value = messageText.textContent || "";
  });

  actionBtnPin.addEventListener("click", () => {
    if (actionBtnPin.dataset.tip === "Pin") {
      messageObj
        .pinMessage(BACKEND_PORT, channelObj.currChannel.id, msg.id)
        .then(() => {
          actionBtnPin.dataset.tip = "Unpin";
        })
        .catch((error) => popUpError(error.message));
    } else {
      messageObj
        .unPinMessage(BACKEND_PORT, channelObj.currChannel.id, msg.id)
        .then(() => {
          actionBtnPin.dataset.tip = "Pin";
        })
        .catch((error) => popUpError(error.message));
    }
  });

  actionBtnReaction.addEventListener("click", () => {
    buttonEye.classList.remove("!hidden");
    buttonGood.classList.remove("!hidden");
    buttonBad.classList.remove("!hidden");
  });

  messageImage.addEventListener("click", () => {
    const imageModalBtn = document.getElementById("image-modal-btn");
    const imageModalImg = document.getElementById("image-modal-img");
    const imageModalLeft = document.getElementById("image-modal-left");
    const imageModalRight = document.getElementById("image-modal-right");
    imageModalRight.classList.remove("hidden");
    imageModalLeft.classList.remove("hidden");

    imageModalImg.setAttribute("data-id", msg.id.toString());

    // 1. get all messages
    messageObj.allMessageList = [];
    getAllMessages(channelObj.currChannel, 0, () => {
      imageModalImg.setAttribute("src", messageImage.src);
      imageModalBtn.click();
    });
  });

  function reactCallBack(reaction) {
    const reactNode =
      reaction === "👀"
        ? buttonEye
        : reaction === "🥳"
        ? buttonGood
        : buttonBad;

    const currUserId = +localStorage.getItem("userId");
    const body = { react: reaction };

    const currMsg = messageObj.messageList.find((m) => m.id === msg.id);

    const findIndex = currMsg.reacts.findIndex(
      (r) => r.react === reaction && r.user === currUserId
    );
    if (findIndex === -1) {
      // if curr user hasn't reacted this message
      messageObj
        .reactMessage(BACKEND_PORT, channelObj.currChannel.id, currMsg.id, body)
        .then(() => {
          reactNode.firstElementChild.textContent = `${
            +reactNode.firstElementChild.textContent + 1
          }`;

          currMsg.reacts.push({ user: currUserId, react: reaction });
        });
    } else {
      messageObj
        .unReactMessage(
          BACKEND_PORT,
          channelObj.currChannel.id,
          currMsg.id,
          body
        )
        .then(() => {
          reactNode.firstElementChild.textContent = `${
            +reactNode.firstElementChild.textContent - 1
          }`;

          currMsg.reacts.splice(findIndex, 1);
        });
    }
  }

  buttonEye.addEventListener("click", () => reactCallBack("👀"));
  buttonGood.addEventListener("click", () => reactCallBack("🥳"));
  buttonBad.addEventListener("click", () => reactCallBack("😵"));

  // 8. Handle message action
  if (+localStorage.getItem("userId") !== msg.sender) {
    actionBtnEdit.classList.add("!hidden");
    actionBtnDelete.classList.add("!hidden");
  }

  return message;
}

function clonePinnedMessage(msg) {
  const message = document.getElementById("message-example").cloneNode(true);

  // 0. Select Children
  const messageAvatar = message.children[0];
  const messageUserName = message.children[1].children[0].children[0];
  const messageSendAt = message.children[1].children[0].children[1];
  const editTimeNode = message.children[1].children[0].children[2];
  const messageText = message.children[1].children[1];
  const messageImage = message.children[1].children[2];

  // remove actions
  message.children[2].remove();

  // 2. Parse the Date
  const date = parseTime(new Date(msg.sentAt));

  // 3. Find sender's avatar
  const senderId = msg.sender;
  const idIndex = userObj.userIdList.indexOf(senderId);
  const sender = userObj.userList[idIndex];

  message.id = `pin-message-${msg.id}`;

  if (sender.image) messageAvatar.src = sender.image;
  messageUserName.textContent = sender.name;
  messageUserName.href = `/#profile=${senderId}`;
  messageSendAt.textContent = date;
  messageText.textContent = msg.message;
  messageImage.src = msg.image || ""; // image can be undefined
  if (msg.edited) {
    editTimeNode.textContent = `Edited: ${parseTime(new Date(msg.editedAt))}`;
    editTimeNode.classList.remove("!hidden");
  }

  const buttonEye = message.children[1].children[3].children[0];
  const buttonGood = message.children[1].children[3].children[1];
  const buttonBad = message.children[1].children[3].children[2];
  buttonEye.classList.add("!hidden");
  buttonGood.classList.add("!hidden");
  buttonBad.classList.add("!hidden");

  // 6. Remove hidden
  message.classList.remove("!hidden");

  return message;
}

function renderMessageList(messageList) {
  // Render
  messageList.forEach((msg) => {
    const messageNode = cloneMessage(msg);
    messageContainer.prepend(messageNode);
  });
}

function getAllMessages(currChannel, i, callback) {
  messageObj.getMessageList(BACKEND_PORT, currChannel.id, i).then((list) => {
    if (list.length) {
      messageObj.allMessageList = [...messageObj.allMessageList, ...list];
      i += 25;
      getAllMessages(currChannel, i, callback);
    } else {
      callback();
    }
  });
}

function renderMessages(currChannel, i) {
  messageObj.getMessageList(BACKEND_PORT, currChannel.id, i).then((list) => {
    // if (list.length) {
    //   messageObj.messageList = [...messageObj.messageList, ...list];
    //   renderMessageList(list, userObj);
    // } else {
    //   const loadingIcon = document.getElementById(
    //     `loadingIcon-${currChannel.id}`
    //   );
    //   loadingIcon.remove();
    // }

    messageObj.messageList = [...messageObj.messageList, ...list];
    renderMessageList(list, userObj);
    if (list.length < 25) {
      const loadingIcon = document.getElementById(
        `loadingIcon-${currChannel.id}`
      );
      loadingIcon.remove();
    }
  });
}

function renderMessagesWithLoading(currChannel, loadingIconId) {
  const loadingIcon = document.getElementById(loadingIconId);
  const messageContainer = document.getElementById("message-container");

  // renderMessages(currChannel, 0);
  const observer = new IntersectionObserver(
    (list) => {
      list.forEach((entry) => {
        if (entry.isIntersecting) {
          renderMessages(currChannel, messageObj.messageList.length);
        }
      });
    },
    { threshold: 1.0, root: messageContainer.parentElement, rootMargin: "0px" }
  );

  observer.observe(loadingIcon);
}

/////////////////////////
// Add Event Listener
/////////////////////////
function handleEventListener() {
  // Prevent form submit by enter
  const formList = document.forms;
  for (let i = 0; i < formList.length; i++) {
    formList[i].addEventListener("keypress", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
  }

  // Handle Mobile
  const mobileBtns = document.getElementsByClassName("mobile");
  for (let i = 0; i < mobileBtns.length; i++) {
    mobileBtns[i].addEventListener("click", () => {
      const channelCol = document.getElementById("channel-col");
      channelCol.classList.toggle("hidden");
      channelCol.classList.toggle("flex");
      channelCol.classList.toggle("md:hidden");
      channelCol.classList.toggle("md:flex");
    });
  }

  // Create Channel
  const createChannelPlus = document.getElementById("create-channel-submit");
  const createChannelForm = document.getElementById("create-channel-form");
  createChannelPlus.addEventListener("click", () => {
    const channelName = createChannelForm.elements["channel-name-create"];
    const channelDesc =
      createChannelForm.elements["channel-description-create"];
    const channelIsPrivate = createChannelForm.elements["is-private"];
    const body = {
      name: channelName.value,
      isPrivate: channelIsPrivate.value !== "false",
      description: channelDesc.value,
    };
    channelObj
      .createChannel(BACKEND_PORT, body)
      .then(fetchAndRenderChannel)
      .catch((error) => {
        popUpError(`${error.message}`);
      });
  });

  // Edit Channel
  const editChannelSubmit = document.getElementById("edit-channel-submit");
  const editChannelForm = document.getElementById("edit-channel-form");
  editChannelSubmit.addEventListener("click", () => {
    const channelName = editChannelForm.elements["channel-name-edit"];
    const channelDesc = editChannelForm.elements["channel-description-edit"];

    if (channelName.value === "") {
      popUpError("Channel must have a name.");
      return;
    }

    const body = {
      name: channelName.value,
      description: channelDesc.value,
    };
    channelObj
      .updateChannel(BACKEND_PORT, channelObj.currHoverChannelId, body)
      .then(fetchAndRenderChannel)
      .catch((error) => {
        popUpError(`${error.message}`);
      });
  });

  // Invite User
  const inviteUserSubmit = document.getElementById("invite-user-submit");
  const inviteCheckboxes = document.getElementsByName("invite-checkbox");
  inviteUserSubmit.addEventListener("click", () => {
    const channelId = channelObj.currHoverChannelId;
    const userList = [];
    for (let i = 0; i < inviteCheckboxes.length; i++) {
      if (inviteCheckboxes[i].checked) {
        userList.push(+inviteCheckboxes[i].value);
      }
    }

    if (userList.length > 0) {
      channelObj
        .inviteChannel(BACKEND_PORT, channelId, userList)
        .then(() => {
          const channel = channelObj.channelList.find(
            (c) => c.id === +channelId
          );
          channel.members = [...channel.members, ...userList];
        })
        .catch((error) => popUpError(error.message));
    }
  });

  // Send Message
  const send = document.getElementById("send");
  send.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      if (send.value === "") return;

      messageObj
        .sendMessage(BACKEND_PORT, channelObj.currChannel.id, {
          message: send.value,
        })
        .then(() => {
          send.value = "";

          // 3. Remove previous messages
          messageObj.messageList = [];
          const messageContainer = document.getElementById("message-container");
          messageContainer.replaceChildren();
          messageContainer.parentElement.children[1]?.remove();

          // 3.5 create a loading
          const loadingIcon = document
            .getElementById("loadingIcon")
            .cloneNode(true);
          loadingIcon.classList.remove("!hidden");
          loadingIcon.id = `loadingIcon-${channelObj.currChannel.id}`;
          messageContainer.parentElement.append(loadingIcon);

          // 4. render messages, async
          // renderMessages(channel, 0);
          renderMessagesWithLoading(channelObj.currChannel, loadingIcon.id);
        })
        .catch((error) => popUpError(error.message));
    }
  });

  // Send Image
  const sendImage = document.getElementById("send-image");
  sendImage.addEventListener("change", () => {
    const files = sendImage.files;
    fileToDataUrl(files[0]).then((image) => {
      messageObj
        .sendMessage(BACKEND_PORT, channelObj.currChannel.id, {
          image: image,
        })
        .then(() => {
          // 3. Remove previous messages
          messageObj.messageList = [];
          const messageContainer = document.getElementById("message-container");
          messageContainer.replaceChildren();
          messageContainer.parentElement.children[1]?.remove();

          // 3.5 create a loading
          const loadingIcon = document
            .getElementById("loadingIcon")
            .cloneNode(true);
          loadingIcon.classList.remove("!hidden");
          loadingIcon.id = `loadingIcon-${channelObj.currChannel.id}`;
          messageContainer.parentElement.append(loadingIcon);

          // 4. render messages, async
          // renderMessages(channel, 0);
          renderMessagesWithLoading(channelObj.currChannel, loadingIcon.id);
        })
        .catch((error) => popUpError(error.message));
    });
  });

  // Upload Avatar
  const uploadAvatar = document.getElementById("upload-avatar");
  uploadAvatar.addEventListener("change", () => {
    const files = uploadAvatar.files;
    fileToDataUrl(files[0]).then((image) => {
      const avatarNode = document.getElementById("profile-avatar");
      avatarNode.src = image;
    });
  });

  // Edit Message
  const editMessageSubmit = document.getElementById("edit-message-submit");
  const editMessageForm = document.getElementById("edit-message-form");
  editMessageSubmit.addEventListener("click", () => {
    const messageContent = editMessageForm.elements["message-content-edit"];
    const messageNodeId = `message-${messageObj.currHoverMessageId}`;
    const messageNode = document.getElementById(messageNodeId);
    const messageText = messageNode.children[1].children[1];
    const messageImage = messageNode.children[1].children[2];

    if (
      messageText.textContent === messageContent.value ||
      messageContent.value === ""
    ) {
      popUpError(
        "You cannot edit a message to the same existing message or empty"
      );
      return;
    }

    const body = {
      message: messageContent.value,
      image: messageImage.src,
    };
    messageObj
      .updateMessage(
        BACKEND_PORT,
        channelObj.currChannel.id,
        messageObj.currHoverMessageId,
        body
      )
      .then(() => {
        messageText.textContent = messageContent.value;

        const editTimeNode = messageNode.children[1].children[0].children[2];
        editTimeNode.textContent = `Edited: ${parseTime(new Date())}`;
        editTimeNode.classList.remove("!hidden");
      })
      .catch((error) => popUpError(error.message));
  });

  // Delete Message
  const deleteMessageSubmit = document.getElementById("delete-message-submit");
  deleteMessageSubmit.addEventListener("click", () => {
    const messageNodeId = `message-${messageObj.currHoverMessageId}`;
    const messageNode = document.getElementById(messageNodeId);

    messageObj
      .deleteMessage(
        BACKEND_PORT,
        channelObj.currChannel.id,
        messageObj.currHoverMessageId
      )
      .then(() => {
        messageNode.remove();
      })
      .catch((error) => popUpError(error.message));
  });

  // View Images
  const imageModalLeft = document.getElementById("image-modal-left");
  const imageModalRight = document.getElementById("image-modal-right");
  const imageModalImg = document.getElementById("image-modal-img");

  function handleViewImage(leftOrRight) {
    // leftOrRight: left 0, right 1
    imageModalRight.classList.remove("hidden");
    imageModalLeft.classList.remove("hidden");
    // find curr image index
    const currIndex = messageObj.allMessageList.findIndex(
      (m) => m.id === +imageModalImg.dataset.id
    );

    // if (currIndex <= 0) {
    //   imageModalRight.classList.add("hidden");
    // }
    // if (currIndex >= messageObj.allMessageList.length - 1) {
    //   imageModalLeft.classList.add("hidden");
    // }

    let nextIndex = leftOrRight ? currIndex - 1 : currIndex + 1;
    if (nextIndex < 0 || nextIndex > messageObj.allMessageList.length - 1)
      return;

    while (
      nextIndex >= 0 &&
      nextIndex <= messageObj.allMessageList.length - 1 &&
      !("image" in messageObj.allMessageList[nextIndex])
    ) {
      // next message until has image
      nextIndex = leftOrRight ? nextIndex - 1 : nextIndex + 1;
      if (nextIndex < 0) {
        // imageModalRight.classList.add("hidden");
        return;
      }
      if (nextIndex > messageObj.allMessageList.length - 1) {
        // imageModalLeft.classList.add("hidden");
        return;
      }
    }

    imageModalImg.setAttribute(
      "src",
      messageObj.allMessageList[nextIndex].image
    );
    imageModalImg.setAttribute(
      "data-id",
      messageObj.allMessageList[nextIndex].id
    );
  }

  imageModalLeft.addEventListener("click", () => handleViewImage(0));
  imageModalRight.addEventListener("click", () => handleViewImage(1));

  // Update Profile
  const togglePwdNode = document.getElementById("profile-toggle-password");
  const profileSubmit = document.getElementById("profile-submit");
  const profileBack = document.getElementById("profile-back");
  togglePwdNode.addEventListener("click", togglePassword);
  profileBack.addEventListener("click", window.router.back.bind(window.router));
  profileSubmit.addEventListener("click", () => {
    const user = userObj.userListWithId.find(
      (u) => u.id === +localStorage.getItem("userId")
    );

    const nameNode = document.getElementById("profile-name");
    const emailNode = document.getElementById("profile-email");
    const pwdNode = document.getElementById("profile-password");
    const bioNode = document.getElementById("profile-bio");
    const avatarNode = document.getElementById("profile-avatar");
    const body = {
      email: emailNode.value === user.email ? null : emailNode.value,
      password: pwdNode.value === "" ? null : pwdNode.value,
      name: nameNode.value,
      bio: bioNode.value === "" ? null : bioNode.value,
      image: avatarNode.src,
    };
    userObj
      .updateUser(BACKEND_PORT, body)
      .then(fetchAndRenderUser)
      .then(() => document.getElementById("success-modal-btn").click())
      .catch((error) => popUpError(error.message));
  });

  // Users Profile Back
  const profileUsersBack = document.getElementById("profile-users-back");
  profileUsersBack.addEventListener(
    "click",
    window.router.back.bind(window.router)
  );

  // Leave Channel
  const leaveChannelSubmit = document.getElementById("leave-channel-submit");
  leaveChannelSubmit.addEventListener("click", () => {
    channelObj
      .leaveChannel(BACKEND_PORT, channelObj.currChannel.id)
      .then(() => {
        location.href = "/#";
        channelObj.currChannel = {};
        document.getElementById("success-modal-btn").click();
      })
      .then(() => {
        fetchAndRenderChannel();
      });
  });

  // Show Pinned Messages
  const pinBtn = document.getElementById("pinned-msg-btn");
  pinBtn.addEventListener("click", () => {
    const pinContainer = document.getElementById("pin-container");
    pinContainer.replaceChildren();
    messageObj.allMessageList = [];
    getAllMessages(channelObj.currChannel, 0, () => {
      messageObj.allMessageList.forEach((msg) => {
        if (msg.pinned) {
          const messageNode = clonePinnedMessage(msg);
          pinContainer.prepend(messageNode);
        }
      });
    });
  });
}
