import { popUpError } from "./component/Modal.js";

/////////////////////////
// Main Function
/////////////////////////

export function login(port, userObj, callback) {
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  if (!email.value || !password.value) {
    popUpError("Please input your email and password");
    return;
  }

  fetch(`https://slackr-backend.fly.dev/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return null;
    })
    .then((data) => {
      if (data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        // TODO: handle currUser, localstorage?
        userObj.currUserId = data.userId;

        callback().then(() => {
          const loginPage = document.getElementById("login");
          const mainPage = document.getElementById("main");
          mainPage.classList.remove("hidden");
          loginPage.classList.add("hidden");
        });
      } else {
        popUpError("Invalid Email or Password.");
      }
    });
}

export function register(port, userObj, callback) {
  const email = document.getElementById("registerEmail");
  const password = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("registerConfirmPassword");
  const name = document.getElementById("registerName");

  if (password.value !== confirmPassword.value) {
    popUpError("Passwords do not match");
    return;
  }
  if (!email.value || !password.value || !name.value) {
    popUpError("Please input your email, password and name");
    return;
  }

  fetch(`https://slackr-backend.fly.dev/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
      name: name.value,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return null;
    })
    .then((data) => {
      if (data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        userObj.currUserId = data.userId;

        const registerPage = document.getElementById("register");
        const mainPage = document.getElementById("main");
        mainPage.classList.remove("hidden");
        registerPage.classList.add("hidden");

        callback();
      } else {
        popUpError("Invalid input.");
      }
    });
}

/////////////////////////
// Help Function
/////////////////////////
const loginPage = document.getElementById("login");
const registerPage = document.getElementById("register");
const mainPage = document.getElementById("main");

export function displayLogIn() {
  registerPage.classList.add("hidden");
  mainPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

export function hideAuth() {
  registerPage.classList.add("hidden");
  mainPage.classList.remove("hidden");
  loginPage.classList.add("hidden");
}
