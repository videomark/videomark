// @ts-check
import GeneralTypeHandler from "./GeneralTypeHandler";
import { AdObserver } from "./AdObserver";

/* あまり有用な情報は取り出せない */
export default class AbemaTVVideoTypeHandler extends GeneralTypeHandler {
  /** @param {HTMLVideoElement} elm */
  constructor(elm) {
    super(elm);
    if (!this.is_main_video(elm)) throw new Error("video is not main");
    const target = document.querySelector(
      ".c-vod-EpisodePlayerContainer-screen"
    );
    this.adObserver = new AdObserver(this, target);
  }

  get_video_title() {
    return document.title;
  }

  get_video_thumbnail() {
    /**
     * スプラッシュ画面を送るエピソードごとのサムネイルも取れそうだが結構一つに絞るのは大変かも
     */
    return null; // for fallback
  }

  get_id_by_video_holder() {
    return "";
  }

  is_main_video(video) {
    try {
      const [main] = Array.from(document.querySelectorAll("video"))
        .filter((e) => e.src.length !== 0)
        .filter((e) => /^blob:http\S:\/\/abema.tv/.test(e.src));

      return video === main;
    } catch (e) {
      return false;
    }
  }

  is_cm() {
    try {
      const ad = Array.from(
        document.querySelectorAll(
          ".c-vod-EpisodePlayerContainer-screen--playing-ad"
        )
      );
      return ad.length !== 0;
    } catch (e) {
      return false;
    }
  }
}
