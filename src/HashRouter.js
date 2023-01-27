////////////////
// window.router.register("gogo", () => {
//   document.getElementById("gogoId").classList.add('!hidden')
// })
//////////////

export class HashRouter {
  constructor() {
    this.routes = [];
    this.currUrl = "";
    this.currIndex = -1;
    this.history = [];
    this.isForwardBack = false;

    window.addEventListener("hashchange", this.refresh.bind(this), false);
    window.addEventListener("load", this.refresh.bind(this), false);
  }

  register(path, callback) {
    this.routes.push({ path, callback });
  }

  clear() {
    this.routes = [];
  }

  refresh() {
    if (this.isForwardBack) this.isForwardBack = false;
    // if is forward or back, the history doesn't need to change
    else {
      this.currUrl = location.hash;
      this.history = this.history.slice(0, this.currIndex + 1);
      this.history.push(this.currUrl);
      this.currIndex += 1;
    }

    // get the path after "#"
    let path = parsePath();

    // get the route in this.routes
    const found = this.routes.find((el) => el.path === path);
    if (!found) return;

    found.callback();
  }

  back() {
    if (this.currIndex > 0) {
      this.isForwardBack = true;
      this.currIndex--;
      // console.log(this.history, this.currIndex)
      this.currUrl = this.history[this.currIndex];
      location.hash = this.currUrl;
    }
  }
}

export function parsePath() {
  let href = window.location.href;
  const index = href.indexOf("#");

  // no '#' in the url, return -1
  if (index < 0) return "";

  return href.slice(index + 1);
}
