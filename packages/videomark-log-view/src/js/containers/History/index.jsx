import React, {
  Component,
  useReducer,
  useEffect,
  useContext,
  useState,
} from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router";
import startOfMonth from "date-fns/startOfMonth";
import isSameMonth from "date-fns/isSameMonth";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { WritableStream } from "web-streams-polyfill/ponyfill";
import Viewing from "../Viewing";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import { urlToVideoPlatform } from "../../utils/Utils";
import RegionalAverageQoE from "../../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../../utils/HourlyAverageQoE";
import DataErase from "../../utils/DataErase";
import videoPlatforms from "../../utils/videoPlatforms";
import waitForContentRendering from "../../utils/waitForContentRendering";
import style from "../../../css/GridContainer.module.css";
import ViewingDetail from "../ViewingDetail";
import NoContents from "../../components/NoContents";
import LoadingProgress from "../../components/LoadingProgress";
import Pager from "./Pager";
import MonthSelect from "./MonthSelect";
import SiteSelect from "./SiteSelect";
import { ViewingsContext, viewingModelsStream } from "../ViewingsProvider";

const regionalAverageQoE = new RegionalAverageQoE();
const hourlyAverageQoE = new HourlyAverageQoE();

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      removed: [],
      sites: videoPlatforms.map(({ id }) => id),
      page: 0,
      perPage: 60,
    };
  }

  componentDidMount() {
    AppData.add(AppDataActions.ViewingList, this, "setState");
  }

  render() {
    const { indexes, viewingModels } = this.props;
    const { removed, sites, page, perPage } = this.state;

    const viewingList = indexes
      .filter(({ id }) => !removed.includes(id))
      .filter(({ location }) => sites.includes(urlToVideoPlatform(location).id))
      .reverse()
      .map((viewing) => ({
        ...viewing,
        disabled: DataErase.contains(viewing.id),
      }))
      .map(({ id, disabled }) => (
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          key={id}
          className={[style.item, ...(disabled ? ["disabled"] : [])].join(" ")}
          role="button"
          onClick={() => {
            if (disabled) return;
            AppData.update(
              AppDataActions.Modal,
              <ViewingDetail
                model={viewingModels.get(id)}
                regionalAverageQoE={regionalAverageQoE}
                hourlyAverageQoE={hourlyAverageQoE}
              />
            );
          }}
          tabIndex="0"
        >
          <Viewing
            model={viewingModels.get(id)}
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
History.propTypes = {
  indexes: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired,
  viewingModels: PropTypes.instanceOf(Map).isRequired,
};
const initialState = {
  loading: true,
  indexes: [],
  viewingModels: new Map(),
};
const reducer = ({ indexes, viewingModels }, chunk) => {
  chunk.viewingModels.forEach((viewingModel) =>
    viewingModels.set(viewingModel.id, viewingModel)
  );

  return {
    loading: false,
    indexes: [...chunk.indexes, ...indexes],
    viewingModels,
  };
};
const dispatcher = (dispatch) =>
  new WritableStream({
    write: async (viewingModels) => {
      const active = viewingModels.filter(({ cache }) => cache !== undefined);
      const indexes = active.map(({ id, cache }) => {
        const {
          session_id: sessionId,
          video_id: videoId,
          location,
          start_time: startTime,
          region,
        } = cache;
        return {
          id,
          sessionId,
          videoId,
          location,
          startTime,
          region,
        };
      });

      dispatch({ indexes, viewingModels: active });
      await new Promise((resolve) => setTimeout(resolve, 15e3));
    },
  });

const getLastValue = (map) => {
  if (map.size === 0) return async () => ({});
  return Array.from(map)[map.size - 1][1];
};

export default () => {
  const viewings = useContext(ViewingsContext);
  const [state, addIndexes] = useReducer(reducer, initialState);
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    if (viewings !== undefined) {
      // FIXME: storage へのアクセスは他のプロセスをブロックするので開始前に一定時間待つ
      waitForContentRendering().then(() =>
        viewingModelsStream(viewings).pipeTo(dispatcher(addIndexes))
      );

      // NOTE: 計測結果の中から最新の月をデフォルト値にする
      getLastValue(viewings)().then(({ start_time: latest }) =>
        setDate(startOfMonth(latest || new Date()))
      );
    }
  }, [viewings, addIndexes]);
  if (viewings !== undefined && viewings.size === 0)
    return <Redirect to="/welcome" />;
  return (
    <>
      <Box py={1}>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <MonthSelect date={date} setDate={setDate} />
          </Grid>
          <Grid item>
            <SiteSelect />
          </Grid>
        </Grid>
      </Box>
      {state.loading ? (
        <LoadingProgress />
      ) : (
        <History
          indexes={state.indexes.filter(({ startTime }) =>
            isSameMonth(date, startTime)
          )}
          viewingModels={state.viewingModels}
        />
      )}
    </>
  );
};
