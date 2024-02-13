import { Parser as ManifestParser } from 'm3u8-parser';
import Config from './Config';
import GeneralTypeHandler from './GeneralTypeHandler';
import ResourceTiming from './ResourceTiming';

export default class IIJTypeHandler extends GeneralTypeHandler {
  static async hook_iij() {
    const { host } = new URL(window.location.href);

    if (host !== 'pr.iij.ad.jp') {
      return;
    }

    // `<source>` からマニフェスト URL を取得し、解像度ごとのサブマニフェストも含めて内容を取得
    try {
      /** @type {string | undefined} */
      const manifestUrl = document.querySelector('video source[type="application/x-mpegURL"]')?.src;

      if (!manifestUrl) {
        throw new Error('Manifest URL not found');
      }

      const manifestUrlBase = manifestUrl.split('/').slice(0, -1).join('/');
      /** @see https://www.npmjs.com/package/m3u8-parser */
      const parser = new ManifestParser();

      parser.push(await (await fetch(manifestUrl)).text());
      parser.end();

      const { manifest } = parser;

      await Promise.all(
        manifest.playlists.map(async (playlist, index) => {
          const uri = `${manifestUrlBase}/${playlist.uri}`;
          const subParser = new ManifestParser();

          subParser.push(await (await fetch(uri)).text());
          subParser.end();

          Object.assign(manifest.playlists[index], subParser.manifest, {
            uri,
            segments: subParser.manifest.segments.map((s) => ({
              ...s,
              uri: `${manifestUrlBase}/${s.uri}`,
            })),
          });
        }),
      );

      IIJTypeHandler.sodiumAdaptiveFmts = manifest;
      IIJTypeHandler.sodiumAdaptiveFmts.framerate = manifest.playlists[0].attributes['FRAME-RATE'];
    } catch (e) {
      console.warn(`VIDEOMARK: IIJ failed to get adaptive formats ${e}`);
    }

    IIJTypeHandler.hook_iij_request();
  }

  static hook_iij_request() {
    class SodiumXMLHttpRequest extends XMLHttpRequest {
      constructor(...args) {
        super(args);
        this.sodiumItag = IIJTypeHandler.get_video_representation_id();
        this.addEventListener('readystatechange', () => {
          switch (this.readyState) {
            case 1: // OPENED
              this.downloadStartTime = performance.now();
              this.sodiumStartUnplayedBuffer = IIJTypeHandler.get_unplayed_buffer_size();
              break;
            case 4: // DONE
              this.downloadEndTime = performance.now();
              this.sodiumEndUnplayedBuffer = IIJTypeHandler.get_unplayed_buffer_size();
              break;
            default:
          }
        });

        this.addEventListener('load', (event) => {
          try {
            const resource = ResourceTiming.find(event.target.responseURL);
            // const downloadTime = resource.duration; // ここでは DONE - OPENED を使う
            const downloadTime = this.downloadEndTime - this.downloadStartTime;
            const start = resource.startTime + performance.timeOrigin;
            const end = resource.responseEnd + performance.timeOrigin;
            const throughput = Math.floor(((event.loaded * 8) / downloadTime) * 1000);
            const domainLookupStart = resource.domainLookupStart - resource.startTime;
            const connectStart = resource.connectStart - resource.startTime;
            const requestStart = resource.requestStart - resource.startTime;
            const responseStart = resource.responseStart - resource.startTime;

            const timings = {
              domainLookupStart,
              connectStart,
              requestStart,
              responseStart,
            };

            setTimeout(() => {
              //  playerオブジェクトがない可能性がある、XHR後のバッファロード処理があるため、1000ms スリープする
              IIJTypeHandler.add_throughput_history({
                url: event.target.responseURL,
                downloadTime,
                throughput,
                downloadSize: Number.parseFloat(event.loaded),
                start,
                startUnplayedBufferSize: this.sodiumStartUnplayedBuffer,
                end,
                endUnplayedBufferSize: this.sodiumEndUnplayedBuffer,
                timings,
                itag: this.sodiumItag,
              });
            }, 1000);

            console.log(
              `VIDEOMARK: load [URL: ${event.target.responseURL}, contents: ${
                event.loaded
              }, duration(ms): ${downloadTime}, duration(Date): ${new Date(start)} - ${new Date(
                end,
              )}, UnplayedBufferSize: ${this.sodiumStartUnplayedBuffer} - ${
                this.sodiumEndUnplayedBuffer
              }, throughput: ${throughput}, timings: ${JSON.stringify(timings)}, itag: ${
                this.sodiumItag
              }]`,
            );
          } catch (e) {
            // nop
          }
        });
      }
    }

    // eslint-disable-next-line no-global-assign
    XMLHttpRequest = SodiumXMLHttpRequest;
  }

  static add_throughput_history(throughput) {
    console.debug(`add_throughput_history: downloadSize=${throughput.downloadSize}`);

    if (throughput.downloadSize <= 0) {
      return;
    }

    IIJTypeHandler.throughputHistories.push(throughput);
    IIJTypeHandler.throughputHistories = IIJTypeHandler.throughputHistories.slice(
      -Config.get_max_throughput_history_size(),
    );
  }

  static get_unplayed_buffer_size() {
    let unplayedBufferSize;

    try {
      const received = IIJTypeHandler.get_receive_buffer();
      const current = IIJTypeHandler.get_current_time();

      if (Number.isNaN(received) || Number.isNaN(current)) {
        throw new Error(`NaN`);
      }

      unplayedBufferSize = (received - current) * 1000;

      if (unplayedBufferSize < 0) {
        throw new Error(`unplayedBufferSize is negative value`);
      }
    } catch (e) {
      unplayedBufferSize = 0;
    }

    return Math.floor(unplayedBufferSize);
  }

  static get_receive_buffer() {
    let ret = -1;

    try {
      const { buffered } = document.querySelector('video');

      ret = buffered.end(buffered.length - 1);
    } catch (e) {
      // do nothing
    }

    return ret;
  }

  static get_current_time() {
    return document.querySelector('video').currentTime;
  }

  static get_video_representation_id() {
    try {
      const video = document.querySelector('video');

      const { representationId } = IIJTypeHandler.play_list_form_adaptive_fmts().find(
        (e) => e.videoHeight === video.videoHeight && e.videoWidth === video.videoWidth,
      );

      return representationId;
    } catch (e) {
      return undefined;
    }
  }

  static play_list_form_adaptive_fmts() {
    try {
      const { playlists = [] } = IIJTypeHandler.sodiumAdaptiveFmts ?? {};

      return playlists.map((e, index) => {
        const {
          attributes: {
            'FRAME-RATE': fps,
            BANDWIDTH: bps,
            CODECS: codecs,
            RESOLUTION: { width: videoWidth, height: videoHeight },
          },
          segments: [{ duration, uri }],
        } = e;

        return {
          type: 'video',
          representationId: String(index + 1),
          bps,
          videoWidth,
          videoHeight,
          container: 'mp4',
          codec: codecs.split(',')[0],
          fps,
          chunkDuration: duration * 1000,
          serverIp: new URL(uri).host,
        };
      });
    } catch (e) {
      console.warn(`VIDEOMARK: IIJ failed to get adaptive formats ${e}`);

      return [];
    }
  }

  get_duration() {
    return -1;
  }

  get_bitrate() {
    return this.get_video_bitrate();
  }

  get_video_bitrate() {
    try {
      const { bps } = this.get_play_list_info().find(
        (e) => e.videoHeight === this.elm.videoHeight && e.videoWidth === this.elm.videoWidth,
      );

      return bps;
    } catch (e) {
      return -1;
    }
  }

  get_framerate() {
    return IIJTypeHandler.sodiumAdaptiveFmts?.framerate ?? -1;
  }

  get_video_title() {
    return undefined;
  }

  get_video_thumbnail() {
    return undefined;
  }

  get_play_list_info() {
    return IIJTypeHandler.play_list_form_adaptive_fmts();
  }

  // get_throughput_info()はバッファを破壊するため、VideoData.update()以外では実行してはならない
  get_throughput_info() {
    try {
      return IIJTypeHandler.throughputHistories
        .splice(0, IIJTypeHandler.throughputHistories.length)
        .filter((h) => h.itag)
        .reduce((acc, cur) => {
          let bitrate;

          try {
            ({ bitrate } = this.get_play_list_info().find((e) => e.representationId === cur.itag));
          } catch (e) {
            bitrate = -1;
          }

          acc.push({
            downloadTime: cur.downloadTime,
            throughput: cur.throughput,
            downloadSize: cur.downloadSize,
            start: cur.start,
            startUnplayedBufferSize: cur.startUnplayedBufferSize,
            end: cur.end,
            endUnplayedBufferSize: cur.endUnplayedBufferSize,
            bitrate,
            timings: cur.timings,
            representationId: cur.itag,
          });

          return acc;
        }, []);
    } catch (e) {
      return [];
    }
  }

  get_codec_info() {
    try {
      const { codec } = this.get_play_list_info().find(
        (e) => e.videoHeight === this.elm.videoHeight && e.videoWidth === this.elm.videoWidth,
      );

      return codec;
    } catch (e) {
      return undefined;
    }
  }

  get_representation() {
    return IIJTypeHandler.get_video_representation_id();
  }
}

IIJTypeHandler.sodiumAdaptiveFmts = null;
IIJTypeHandler.throughputHistories = [];
