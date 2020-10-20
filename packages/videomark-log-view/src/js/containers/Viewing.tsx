import React, { useCallback, useState, useEffect } from "react";
import format from "date-fns/format";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Delete from "@material-ui/icons/Delete";
import Restore from "@material-ui/icons/Replay";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../css/MeasureContents.modu... Remove this comment to see the full error message
import style from "../../css/MeasureContents.module.css";
import { urlToVideoPlatform } from "../utils/Utils";
import ViewingModel from "../utils/Viewing";
import DataErase from "../utils/DataErase";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../images/noimage.svg' or i... Remove this comment to see the full error message
import NoImage from "../../images/noimage.svg";

type OwnVideoThumbnailProps = {
    className: string;
    title: string;
    thumbnail?: string;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'VideoThumbnailProps' circularly refere... Remove this comment to see the full error message
type VideoThumbnailProps = OwnVideoThumbnailProps & typeof VideoThumbnail.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'VideoThumbnail' implicitly has type 'any' because... Remove this comment to see the full error message
export const VideoThumbnail = ({ className, title, thumbnail }: VideoThumbnailProps) => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <img
    className={className}
    src={thumbnail == null ? NoImage : thumbnail}
    alt={title}
    onError={(e) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'src' does not exist on type 'EventTarget... Remove this comment to see the full error message
      e.target.src = NoImage;
    }}
  />
);
VideoThumbnail.defaultProps = {
  thumbnail: null,
};

export const toTimeString = (date: any) => format(date, "yyyy/MM/dd HH:mm");

export const useViewing = (model: any) => {
  const [state, dispatch] = useState();
  useEffect(() => {
    model.init().then(dispatch);
  }, [model, dispatch]);
  return state;
};

type RecoverOrRemoveButtonProps = {
    model: any; // TODO: PropTypes.instanceOf(ViewingModel)
};

const RecoverOrRemoveButton = ({ model }: RecoverOrRemoveButtonProps) => {
  const recover = useCallback(() => {
    DataErase.recover(model.id);
    // FIXME: ViewingListをrender()しないと表示が変わらない
    AppData.update(AppDataActions.ViewingList, (state: any) => state);
  }, [model]);

  const remove = useCallback(() => {
    DataErase.remove(model.id);
    AppData.update(AppDataActions.ViewingList, (state: any) => ({
      ...state,
      removed: [...state.removed, model.id]
    }));
  }, [model]);

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className={style.removedStateButtons}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button
        variant="contained"
        color="primary"
        className={style.removedStateButton}
        onClick={recover}
      >
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Restore fontSize="small" />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box marginLeft={1} component="span">
          復元
        </Box>
      </Button>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button
        variant="contained"
        color="secondary"
        className={style.removedStateButton}
        onClick={remove}
      >
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Delete fontSize="small" />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box marginLeft={1} component="span">
          削除
        </Box>
      </Button>
    </div>
  );
};

type OwnViewingProps = {
    model: any; // TODO: PropTypes.instanceOf(ViewingModel)
    disabled?: boolean;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'ViewingProps' circularly references it... Remove this comment to see the full error message
type ViewingProps = OwnViewingProps & typeof Viewing.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'Viewing' implicitly has type 'any' because it doe... Remove this comment to see the full error message
const Viewing = ({ model, disabled }: ViewingProps) => {
  const viewing = useViewing(model);
  if (viewing == null) return null;
  const { title, location, thumbnail, startTime } = viewing;

  const Title = () => (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid container component={Box} height={72} paddingX={2} paddingY={1}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item className={style.title}>
        {title}
      </Grid>
    </Grid>
  );

  const DisabledInfo = () => (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      {/* @ts-expect-error ts-migrate(2769) FIXME: Property 'component' does not exist on type 'Intri... Remove this comment to see the full error message */}
      <Typography variant="caption" color="error" component={Box} paddingX={1}>
        次回起動時に削除します。取り消すには復元、今すぐ削除するには削除を押してください。
      </Typography>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <RecoverOrRemoveButton model={viewing} />
    </>
  );

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Card>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <div className={style.header}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <CardMedia
          component={() => (
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <div className={style.movieInfo}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <span>{urlToVideoPlatform(location).name}</span>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <span>{toTimeString(startTime)}</span>
        </div>
      </div>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Title />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      {disabled ? <DisabledInfo /> : null}
    </Card>
  );
};
Viewing.defaultProps = {
  disabled: false,
};
export default React.memo(Viewing);
