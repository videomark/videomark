class Api {
  static async fetch(url, params) {
    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).catch(() => Response.error());

    return response;
  }

  // 最終QOE
  static fixed(ids) {
    return Api.fetch(`${process.env.BASE_URL}:8443/api/fixed_qoe`, { ids });
  }

  // ISP 地域情報
  static statsInfo(video, session) {
    return Api.fetch(`${process.env.BASE_URL}:8443/stats/info`, {
      session,
      video,
    });
  }

  // 全体の時間帯平均
  static hour() {
    const param = { group: "hour", limit: 24 };
    return Api.fetch(`${process.env.BASE_URL}:8443/stats`, param);
  }

  static service() {
    return Api.fetch(`${process.env.BASE_URL}:8443/stats`, {
      group: "service",
    });
  }

  static subdivision(country, subdivision) {
    const limit = 24;
    return Api.fetch(`${process.env.BASE_URL}:8443/stats/subdivision`, {
      country,
      subdivision,
      limit,
    });
  }

  static isp(isp) {
    return Api.fetch(`${process.env.BASE_URL}:8443/stats/isp`, { isp });
  }

  static erasure(ids) {
    return Api.fetch(`${process.env.BASE_URL}:8443/ctrl/erasure`, ids);
  }
}

export default Api;
