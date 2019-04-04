import { viewingIdToSessionAndVideo } from "./Utils";

class Api {
  static async fetch(url, params) {
    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });

    return response;
  }

  // 最終QOE
  static fixed(ids) {
    return Api.fetch("https://sodium.webdino.org:8443/api/fixed_qoe", { ids });
  }

  // ISP 地域情報
  static statsInfo(video, session) {
    return Api.fetch("https://sodium.webdino.org:8443/stats/info", {
      session,
      video
    });
  }

  // 全体の時間帯平均
  static hour() {
    const param = { group: "hour", limit: 24 };
    return Api.fetch("https://sodium.webdino.org:8443/stats", param);
  }

  static service() {
    return Api.fetch("https://sodium.webdino.org:8443/stats", {
      group: "service"
    });
  }

  static subdivision(country, subdivision) {
    const limit = 24;
    return Api.fetch("https://sodium.webdino.org:8443/stats/subdivision", {
      country,
      subdivision,
      limit
    });
  }

  static isp(isp) {
    return Api.fetch("https://sodium.webdino.org:8443/stats/isp", { isp });
  }

  static erasure(ids) {
    const param = ids.map(id => {
      return viewingIdToSessionAndVideo(id);
    });
    return Api.fetch("https://sodium.webdino.org:8443/ctrl/erasure", param);
  }
}

export default Api;
