import React from "react";
import PropTypes from "prop-types";
import style from "../../css/NoContents.module.css";

const NoContents = ({ title }) => {
  return (
    <div className={style.noContents}>
      <h1>{title}</h1>
      <p>
        Web VideoMark
        では動画の再生時にビットレートや解像度などを記録し、体感品質値 (QoE:
        Quality of Experience) を推定します。
      </p>
      <p>
        まずは計測対象となる動画配信サービスで動画をご覧ください。
        動画の視聴中は動画のコントローラーが表示されている間 QoE
        の暫定値を動画の左上に表示します。動画の視聴終了後はこの計測結果一覧画面で
        QoE 値を確認できます。
      </p>
      <p>現在 QoE の計測が可能な動画配信サービスはこちらです:</p>
      <ul>
        <li>
          <a href="https://www.paravi.jp/">Paravi</a>
        </li>
        <li>
          <a href="https://tver.jp/">TVer</a>
        </li>
        <li>
          <a href="https://www.youtube.com/">YouTube</a>
        </li>
      </ul>
    </div>
  );
};
NoContents.propTypes = {
  title: PropTypes.string
};
NoContents.defaultProps = {
  title: "該当する計測結果がありません"
};

export default NoContents;
