import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import QoEValueGraphList from "../components/QoEValueGraphList";
import { VideoQuality, isLowQuality } from "../components/VideoQuality";
import DataErase from "../utils/DataErase";
import AppDataActions from "../utils/AppDataActions";
import AppData from "../utils/AppData";
import { urlToVideoPlatform } from "../utils/Utils";
import style from "../../css/MeasureContents.module.css";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
import { VideoThumbnail, toTimeString, fetch } from "./Viewing";

const ViewingDetail = ({
  viewingId: id,
  regionalAverageQoE: regionalStats,
  hourlyAverageQoE: hourlyStats
}) => {
  const [viewing, setViewing] = useState();
  useEffect(() => {
    if (viewing) return;
    (async () => {
      setViewing(await fetch({ id, regionalStats, hourlyStats }));
    })();
  }, [setViewing]);
  if (!viewing) return null;
  const {
    title,
    location,
    thumbnail,
    startTime,
    qoe,
    quality,
    region,
    regionalAverage,
    hourlyAverage
  } = viewing;

  return (
    <div className={style.modalMain}>
      <div className={style.header}>
        <a href={location} target="_blank" rel="noopener noreferrer">
          <VideoThumbnail
            className={style.modalThumbnail}
            title={title}
            thumbnail={thumbnail}
          />
        </a>
        <div className={style.movieInfo}>
          <span>{urlToVideoPlatform(location).name}</span>
          <span>{toTimeString(startTime)}</span>
        </div>
      </div>
      <div className={`${style.title} ${style.modalTitle}`}>{title}</div>
      <VideoQuality {...quality} startTime={startTime} />
      <Box mt={2} px={1}>
        <QoEValueGraphList
          value={qoe}
          region={region}
          regionalAverage={regionalAverage}
          hour={startTime.getHours()}
          hourlyAverage={hourlyAverage}
          isDetail
          color={isLowQuality(quality) ? "text.secondary" : "default"}
        />
      </Box>
      <Button
        color="default"
        fullWidth
        onClick={() => {
          DataErase.add(id);
          // FIXME: ViewingListをrender()しないと表示が変わらない
          AppData.update(AppDataActions.ViewingList, state => state);
          AppData.update(AppDataActions.Modal, null);
        }}
      >
        <Typography variant="button" color="textSecondary">
          この計測結果を削除する
        </Typography>
      </Button>
    </div>
  );
};
ViewingDetail.propTypes = {
  viewingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE).isRequired
};
export default React.memo(ViewingDetail);
