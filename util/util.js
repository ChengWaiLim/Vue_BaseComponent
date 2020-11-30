import store from "@/store/index";
import { Loading } from "element-ui";
class Util {
  static loading() {
    return Loading.service({
      lock: true,
      text: store().state.loadingText,
      spinner: store().state.loadingIcon,
      background: store().state.loadingBackground,
    });
  }
  static goToUrl(url, parameters) {
    var url = new URL(url);
    url.search = new URLSearchParams(parameters);
    location.href = url.href;
  }
  static openNewTabUrl(url, parameters) {
    var url = new URL(url);
    url.search = new URLSearchParams(parameters);
    window.open(url.href);
  }
  static cssRatioCalculate(cssString, ratio) {
    if (cssString.includes("px")) {
      var value = cssString.split("px")[0];
      return value * ratio + "px";
    } else if (cssString.includes("%")) {
      var value = cssString.split("%")[0];
      return value * ratio + "%";
    }
  }
  static isNumeric(str) {
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
}

export default Util;
