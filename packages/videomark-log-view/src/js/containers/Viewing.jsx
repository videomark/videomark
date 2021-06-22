import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import format from "date-fns/format";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Delete from "@material-ui/icons/Delete";
import Restore from "@material-ui/icons/Replay";
import style from "../../css/MeasureContents.module.css";
import { urlToVideoPlatform } from "../utils/Utils";
import ViewingModel from "../utils/Viewing";
import DataErase from "../utils/DataErase";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import NoImage from "../../images/noimage.svg";

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
  if (viewing == null) return null;
  const { title, location, thumbnail, startTime } = viewing;

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

  return (
    <Card>
      <div className={style.header}>
        <CardMedia
          component={() => (
            <VideoThumbnail
              className={[
                style.thumbnail,
                disabled ? style.removedThumbnail : null,
              ].join(" ")}
              title={title}
              thumbnail={thumbnail}
            />
          )}
          image="#"
        />
        <div className={style.movieInfo}>
          <span>{urlToVideoPlatform(location).name}</span>
          <span>{toTimeString(startTime)}</span>
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
