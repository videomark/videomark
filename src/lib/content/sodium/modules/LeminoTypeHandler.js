import GeneralTypeHandler from './GeneralTypeHandler';

export default class LeminoTypeHandler extends GeneralTypeHandler {
  get_video_title() {
    return (
      document
        .querySelector('[class^="ContentsDetailPlayerIntro__TitleStyle"]')
        ?.innerText.split(/\n+/)
        .reverse()
        .join(' – ') || null
    );
  }

  is_main_video(video) {
    return (
      video ===
      /** @type {HTMLVideoElement} */ (document.querySelector('video:not([title="Advertisement"])'))
    );
  }

  is_cm() {
    return /** @type {HTMLVideoElement[]} */ ([
      ...document.querySelectorAll('video[title="Advertisement"]'),
    ]).some((video) => !!video.videoHeight);
  }
}
