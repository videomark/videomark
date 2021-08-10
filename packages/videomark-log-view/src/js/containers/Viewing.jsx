import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import format from "date-fns/format";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import {
  Delete,
  Equalizer,
  Error,
  HourglassEmpty,
  PlayCircleFilled,
  Restore,
  Warning,
} from '@material-ui/icons';
import style from "../../css/MeasureContents.module.css";
import { urlToVideoPlatform } from "../utils/Utils";
import ViewingModel from "../utils/Viewing";
import DataErase from "../utils/DataErase";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import NoImage from "../../images/noimage.svg";
import { isLowQuality } from "../components/VideoQuality";

export const VideoThumbnail = ({ className, title, thumbnail }) => (
  <img
    className={className}
    src={thumbnail == null ? NoImage : thumbnail}
    alt={title}
    onError={(e) => {
      e.target.src = NoImage;
    }}
  />
);
VideoThumbnail.propTypes = {
  className: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
};
VideoThumbnail.defaultProps = {
  thumbnail: null,
};

export const toTimeString = (date) => format(date, "M 月 d 日 HH:mm");

export const useViewing = (model) => {
  const [state, dispatch] = useState();
  useEffect(() => {
    model.init().then(dispatch);
  }, [model, dispatch]);
  return state;
};

const RecoverOrRemoveButton = ({ model }) => {
  const recover = useCallback(() => {
    DataErase.recover(model.id);
    // FIXME: ViewingListをrender()しないと表示が変わらない
    AppData.update(AppDataActions.ViewingList, (state) => state);
  }, [model]);

  const remove = useCallback(() => {
    DataErase.remove(model.id);
    AppData.update(AppDataActions.ViewingList, (state) => ({
      ...state,
      removed: [...state.removed, model.id],
    }));
  }, [model]);

  return (
    <div className={style.removedStateButtons}>
      <Button
        variant="contained"
        color="primary"
        className={style.removedStateButton}
        onClick={recover}
      >
        <Restore fontSize="small" />
        <Box marginLeft={1} component="span">
          復元
        </Box>
      </Button>
      <Button
        variant="contained"
        color="secondary"
        className={style.removedStateButton}
        onClick={remove}
      >
        <Delete fontSize="small" />
        <Box marginLeft={1} component="span">
          削除
        </Box>
      </Button>
    </div>
  );
};
RecoverOrRemoveButton.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
};

const Viewing = ({ model, disabled }) => {
  const viewing = useViewing(model);
  const [state, dispatch] = useState();

  useEffect(() => {
    if (!viewing) return;

    (async () => {
      dispatch({
        qoe: await viewing.qoe,
      });
    })();
  }, [viewing, dispatch]);

  if (!viewing || !state) return null;

  const { title, location, thumbnail, startTime, quality } = viewing;
  const { qoe } = state;

  const QoELabel = () => {
    let tooltip = '視聴時の体感品質値';
    let icon = <Equalizer />;
    let value = String(qoe);

    if (qoe === undefined || qoe === -2) {
      tooltip = '計測データ不足のため体感品質値が得られませんでした';
      icon = <Error />;
      value = '';
    } else if (qoe === -1) {
      tooltip = '体感品質値を計測または計算中です';
      icon = <HourglassEmpty />;
      value = '';
    } else if (isLowQuality(quality)) {
      tooltip = 'フレームドロップが発生したため実際の体感品質とは異なる可能性があります';
      icon = <Warning />;
    }

    return (
      <Tooltip title={tooltip}>
        <span>{icon}{' '}{value}</span>
      </Tooltip>
    );
  };

  const Title = () => (
    <Grid container component={Box} height={72} paddingX={2} paddingY={1}>
      <Grid item className={style.title}>
        {title}
      </Grid>
    </Grid>
  );

  const DisabledInfo = () => (
    <>
      <Typography variant="caption" color="error" component={Box} paddingX={1}>
        次回起動時に削除します。取り消すには復元、今すぐ削除するには削除を押してください。
      </Typography>
      <RecoverOrRemoveButton model={viewing} />
    </>
  );

  const openLink = (event) => {
    event.stopPropagation();
    window.location.href = location;
  };

  return (
    <Card className={style.card}>
      <div className={style.header}>
        <CardMedia
          component={() => (
            <div className={style.thumbnailWrapper}>
              <VideoThumbnail
                className={[
                  style.thumbnail,
                  disabled ? style.removedThumbnail : null,
                ].join(" ")}
                title={title}
                thumbnail={thumbnail}
              />
              <Typography className={style.serviceName}>
                {urlToVideoPlatform(location).name}
              </Typography>
              <Tooltip title="もう一度観る">
                <IconButton className={style.playButton} onClick={(event) => openLink(event)}>
                  <PlayCircleFilled fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
          )}
          image="#"
        />
        <div className={style.movieInfo}>
          <span>{toTimeString(startTime)}</span>
          <span><QoELabel /></span>
        </div>
      </div>
      <Title />
      {disabled ? <DisabledInfo /> : null}
    </Card>
  );
};
Viewing.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
  disabled: PropTypes.bool,
};
Viewing.defaultProps = {
  disabled: false,
};
export default React.memo(Viewing);
