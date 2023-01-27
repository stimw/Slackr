/////////////////////////
// Select DOM
/////////////////////////

const category = document.getElementById("category-1");
const categoryUnjoined = document.getElementById("category-2");
const channelList = document.getElementById("channelList");
const channelListUnjoined = document.getElementById("channelList-unjoined");

/////////////////////////
// Handle Category Toggle
/////////////////////////
export function toggleCategory() {
  category.addEventListener("click", (e) => {
    const svg = e.currentTarget.children[0];
    svg.classList.toggle("-rotate-90");
    channelList.classList.toggle("!hidden");
  });

  categoryUnjoined.addEventListener("click", (e) => {
    const svg = e.currentTarget.children[0];
    svg.classList.toggle("-rotate-90");
    channelListUnjoined.classList.toggle("!hidden");
  });
}

/////////////////////////
// Render Channel List
/////////////////////////
// "channels": [
//   {
//     "id": 528491,
//     "name": "Inez's public rumour forum",
//     "creator": 61021,
//     "private": false,
//     "members": [
//       61021
//     ]
//   }
// ]

export function keepChannelHover(channelNode) {
  channelNode.classList.remove(
    "hover:rounded",
    "hover:text-gray-100",
    "hover:bg-gray-700",
    "text-gray-300"
  );
  channelNode.classList.add("rounded", "text-gray-100", "bg-gray-700");
  const inviteSVG = channelNode.children[3];
  const editSVG = channelNode.children[4];
  inviteSVG.classList.remove("opacity-0", "group-hover:opacity-100");
  editSVG.classList.remove("opacity-0", "group-hover:opacity-100");
}

export function removeSiblingHover(channelNode, all = false) {
  const parentNode = document.getElementById("channelList");
  for (let node of parentNode.children) {
    if (!all && node === channelNode) continue;
    node.classList.add(
      "hover:rounded",
      "hover:text-gray-100",
      "hover:bg-gray-700",
      "text-gray-300"
    );
    node.classList.remove("rounded", "text-gray-100", "bg-gray-700");
    const inviteSVG = node.children[3];
    const editSVG = node.children[4];
    inviteSVG.classList.add("opacity-0", "group-hover:opacity-100");
    editSVG.classList.add("opacity-0", "group-hover:opacity-100");
  }
}

export function setCurrHoverChannel(event, channelObj) {
  const currChannelNode = event.currentTarget;
  channelObj.currHoverChannelId = currChannelNode.id.slice(8);
}

export function showBottomUser(userObj) {
  const userBottomNode = document.getElementById("current-user");
  const userAvatarNode =
    userBottomNode.firstElementChild.firstElementChild.firstElementChild;
  const userNameNode = userBottomNode.children[1].children[0];
  const userIdNode = userBottomNode.children[1].children[1];

  // find user by userId
  const currUserIndex = userObj.userIdList.indexOf(
    +localStorage.getItem("userId")
  );
  const currUser = userObj.userList[currUserIndex];
  userAvatarNode.src = currUser.image || "./dist/avatar/25.png";
  userNameNode.textContent = currUser.name;
  userIdNode.textContent = `#${localStorage.getItem("userId")}`;
}

export function sortCallback(userA, userB) {
  const nameA = userA.name.toUpperCase();
  const nameB = userB.name.toUpperCase();
  return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
}

export function cloneInviteUserNode(user) {
  const cloneNode = document.getElementById("pseudo-invite-li").cloneNode(true);
  const checkNode = cloneNode.children[0];
  const labelNode = cloneNode.children[1];
  const userAvatarNode = cloneNode.children[1].children[0];
  const userNameNode = cloneNode.children[1].children[1];

  checkNode.id = `invite-user-${user.id}`;
  checkNode.value = `${user.id}`;
  checkNode.name = "invite-checkbox";

  labelNode.setAttribute("for", checkNode.id);

  userAvatarNode.src = user.image || "./dist/avatar/25.png";
  userNameNode.textContent = user.name;
  return cloneNode;
}

export function exitChannelPage(channelObj) {
  const homePage = document.getElementById("homepage");
  const messageCol = document.getElementById("message-col");
  messageCol.classList.add("!hidden");
  homePage.classList.add("hidden");

  removeSiblingHover(null, true);

  channelObj.currChannel = {};
}

export function exitProfilePage() {
  const profileUsersNode = document.getElementById("profile-users");
  const profileNode = document.getElementById("profile");
  profileNode.classList.add("!hidden");
  profileUsersNode.classList.add("!hidden");
}
