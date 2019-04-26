import Config from "./Config";

function generate_qoe_style(qoe) {
  let result = "";
  const content = qoe ? `QoE: ${qoe}` : "計測中...";
  const { host } = new window.URL(window.location.href);
  if (host.includes("youtube")) {
    result = `#movie_player:after {
        content: '${content}';
      }`;
  } else if (host.includes("tver")) {
    result = `#playerWrapper > .video-js:after {
        content: '${content}';
      }`;
  } else if (host.includes("paravi")) {
    result = `.paravi-player .controls:after {
        content: '${content}';
      }`;
  }

  return result;
}

/**
 *
 */
export default class UI {
  /**
   *
   * @param {HTMLElement} target insert status to target
   */
  constructor(target) {
    this.target = target;
    // this.elm = document.createElement("div");

    // Layout style
    this.qoe_val_element = null;
  }

  update_status(total, dropped, qoe) {
    console.log(
      `VIDEOMARK: latest qoe = ${
        qoe || "no data"
      }, frame drop: ${dropped}/${total}`
    );
    if (!this.qoe_val_element) {
      console.warn(`VIDEOMARK: qoe_val_element not found`);
      this.insert_style();
    }
    this.qoe_val_element.textContent = generate_qoe_style(qoe);
  }

  remove_status() {
    if (this.qoe_val_element) {
      const head = document.getElementsByTagName("head")[0];
      if (head) {
        try {
          head.removeChild(this.qoe_val_element);
        } catch (error) {
          console.log(
            `VIDEOMARK: qoe_val_element not found under head element.`
          );
        }
      }
      this.qoe_val_element = null;
    }
  }

  insert_style() {
    const style = document.createElement("style");
    const rule = document.createTextNode(Config.get_style());
    style.appendChild(rule);
    document.getElementsByTagName("head")[0].appendChild(style);

    this.qoe_val_element = document.createElement("style");
    document.getElementsByTagName("head")[0].appendChild(this.qoe_val_element);
    // this.qoe_val_element.appendChild(document.createTextNode(""));
  }
}
