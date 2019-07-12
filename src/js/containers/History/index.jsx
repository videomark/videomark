import React, {
  Component,
  createElement,
  useReducer,
  useEffect,
  useContext
} from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router";
import isSameMonth from "date-fns/isSameMonth";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Viewing from "../Viewing";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import { urlToVideoPlatform } from "../../utils/Utils";
import RegionalAverageQoE from "../../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../../utils/HourlyAverageQoE";
import DataErase from "../../utils/DataErase";
import videoPlatforms from "../../utils/videoPlatforms.json";
import style from "../../../css/GridContainer.module.css";
import ViewingDetail from "../ViewingDetail";
import NoContents from "../../components/NoContents";
import Pager from "./Pager";
import MonthSelect from "./MonthSelect";
import SiteSelect from "./SiteSelect";
import { ViewingsContext, viewingModelsStream } from "../ViewingsProvider";

const regionalAverageQoE = new RegionalAverageQoE();
const hourlyAverageQoE = new HourlyAverageQoE();

class History extends Component {
  static propTypes = {
    indexes: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      removed: [],
      sites: videoPlatforms.map(({ id }) => id),
      date: new Date(),
      page: 0,
      perPage: 60
    };
  }

  async componentDidMount() {
    await Promise.all([regionalAverageQoE.init(), hourlyAverageQoE.init()]);
    AppData.add(AppDataActions.ViewingList, this, "setState");
  }

  render() {
    const { indexes } = this.props;
    const { removed, sites, date, page, perPage } = this.state;

    const viewingList = indexes
      .filter(({ id }) => !removed.includes(id))
      .filter(({ location }) => sites.includes(urlToVideoPlatform(location).id))
      .filter(({ startTime }) => isSameMonth(date, startTime))
      .reverse()
      .map(viewing => ({
        ...viewing,
        disabled: DataErase.contains(viewing.id)
      }))
      .map(({ id, sessionId, videoId, disabled }) => (
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          key={id + (disabled ? "_disabled" : "")}
          className={style.item}
          role="button"
          onClick={() => {
            if (disabled) return;
            AppData.update(
              AppDataActions.Modal,
              <ViewingDetail
                key={id}
                sessionId={sessionId}
                videoId={videoId}
                regionalAverageQoE={regionalAverageQoE}
                hourlyAverageQoE={hourlyAverageQoE}
              />
            );
          }}
          onKeyPress={this.handleKeyPress}
          tabIndex="0"
        >
          <Viewing
            key={id + (disabled ? "_disabled" : "")}
            sessionId={sessionId}
            videoId={videoId}
            regionalAverageQoE={regionalAverageQoE}
            hourlyAverageQoE={hourlyAverageQoE}
            disabled={disabled}
          />
        </Grid>
      ));

    if (viewingList.length === 0) {
      return <NoContents />;
    }

    const maxPage = Math.ceil(viewingList.length / perPage);

    return (
      <>
        <Grid container spacing={3} direction="row" alignItems="flex-start">
          {viewingList.slice(page * perPage, (page + 1) * perPage)}
        </Grid>
        {maxPage <= 1 ? null : (
          <Box my={2}>
            <Grid container justify="center">
              <Grid item>
                <Pager page={page} perPage={perPage} maxPage={maxPage} />
              </Grid>
            </Grid>
          </Box>
        )}
      </>
    );
  }
}
const initialState = {
  loading: true,
  indexes: []
};
const reducer = ({ indexes }, chunk) => ({
  loading: false,
  indexes: [...chunk, ...indexes]
});
const dispatcher = dispatch =>
  new WritableStream({
    write: async viewingModels => {
      const indexes = viewingModels.map(viewingModel => {
        const id = viewingModel.viewingId;
        const {
          session_id: sessionId,
          video_id: videoId,
          location,
          start_time: startTime,
          region
        } = viewingModel.cache;
        return { id, sessionId, videoId, location, startTime, region };
      });

      const regions = indexes
        .map(({ region }) => region || {})
        .filter(
          (region, i, self) =>
            i ===
            self.findIndex(
              r =>
                r.country === region.country &&
                r.subdivision === region.subdivision
            )
        );
      await Promise.all(regions.map(region => regionalAverageQoE.at(region)));
      dispatch(indexes);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });
const withViewingIndexes = ({ loading, indexes }) => component => {
  if (loading) return "...";
  if (indexes.length === 0) return <Redirect to="/welcome" />;
  return createElement(component, { indexes });
};
export default () => {
  const viewings = useContext(ViewingsContext);
  const [indexes, addIndexes] = useReducer(reducer, initialState);
  useEffect(() => {
    if (viewings !== undefined) {
      viewingModelsStream(viewings).pipeTo(dispatcher(addIndexes));
    }
  }, [viewings, addIndexes]);
  return (
    <>
      <Box py={1}>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <MonthSelect />
          </Grid>
          <Grid item>
            <SiteSelect />
          </Grid>
        </Grid>
      </Box>
      {withViewingIndexes(indexes)(History)}
    </>
  );
};
