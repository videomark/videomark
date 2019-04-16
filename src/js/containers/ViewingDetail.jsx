import PropTypes from "prop-types";
import React from "react";
import Button from "@material-ui/core/Button";
import QoEValueGraphList from "../components/QoEValueGraphList";
import dataErase from "../utils/DataErase";
import AppDataActions from "../utils/AppDataActions";
import AppData from "../utils/AppData";
import { LocationToService } from "../utils/Utils";
import style from "../../css/MeasureContents.module.css";

const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

const ViewingDetail = ({
  id,
  title,
  location,
  thumbnail,
  qoe,
  average,
  startTime
}) => {
  return (
    <div className={`${style.main} ${style.modalMain}`}>
      <div className={style.header}>
        <a href={location}>
          <img
            className={`${style.thumbnail} ${style.modalThumbnail}`}
            src={thumbnail}
            alt={title}
          />
        </a>
        <div className={style.movieInfo}>
          <span className={style.serviceName}>
            {LocationToService(location)}
          </span>
          <span className={style.startTime}>{toTimeString(startTime)}</span>
        </div>
      </div>
      <div className={`${style.title} ${style.modalTitle}`}>{title}</div>
      <div style={{ width: "100%", height: "20px" }} />
      <QoEValueGraphList qoe={qoe} average={average} isDetail />
      <Button
        color="secondary"
        className={style.eraseButton}
        onClick={() => {
          dataErase.add(id);
          AppData.update(AppDataActions.Modal, null);
        }}
      >
        この計測結果を削除する
      </Button>
    </div>
  );
};
ViewingDetail.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  qoe: PropTypes.string.isRequired,
  average: PropTypes.shape.isRequired,
  startTime: PropTypes.instanceOf(Date).isRequired
};
export default ViewingDetail;
