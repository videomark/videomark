import React, {
  Component,
  useReducer,
  useEffect,
  useContext,
  useState,
} from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router` if it exists... Remove this comment to see the full error message
import { Redirect } from "react-router";
import startOfMonth from "date-fns/startOfMonth";
import isSameMonth from "date-fns/isSameMonth";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../Viewing' was resolved to '/home/kou029w... Remove this comment to see the full error message
import Viewing from "../Viewing";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import { urlToVideoPlatform } from "../../utils/Utils";
import RegionalAverageQoE from "../../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../../utils/HourlyAverageQoE";
import DataErase from "../../utils/DataErase";
import videoPlatforms from "../../utils/videoPlatforms";
import waitForContentRendering from "../../utils/waitForContentRendering";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../../css/GridContainer.mod... Remove this comment to see the full error message
import style from "../../../css/GridContainer.module.css";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../ViewingDetail' was resolved to '/home/k... Remove this comment to see the full error message
import ViewingDetail from "../ViewingDetail";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../../components/NoContents' was resolved ... Remove this comment to see the full error message
import NoContents from "../../components/NoContents";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../../components/LoadingProgress' was reso... Remove this comment to see the full error message
import LoadingProgress from "../../components/LoadingProgress";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Pager' was resolved to '/home/kou029w/vi... Remove this comment to see the full error message
import Pager from "./Pager";
// @ts-expect-error ts-migrate(6142) FIXME: Module './MonthSelect' was resolved to '/home/kou0... Remove this comment to see the full error message
import MonthSelect from "./MonthSelect";
// @ts-expect-error ts-migrate(6142) FIXME: Module './SiteSelect' was resolved to '/home/kou02... Remove this comment to see the full error message
import SiteSelect from "./SiteSelect";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../ViewingsProvider' was resolved to '/hom... Remove this comment to see the full error message
import { ViewingsContext, viewingModelsStream } from "../ViewingsProvider";

const regionalAverageQoE = new RegionalAverageQoE();
const hourlyAverageQoE = new HourlyAverageQoE();

type HistoryProps = {
    indexes: any[]; // TODO: PropTypes.instanceOf(Object)
    viewingModels: any; // TODO: PropTypes.instanceOf(Map)
};

type HistoryState = any;

class History extends Component<HistoryProps, HistoryState> {
static propTypes: any;

  constructor(props: HistoryProps) {
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{}'.
      .filter(({ location }) => sites.includes(urlToVideoPlatform(location).id))
      .reverse()
      .map((viewing) => ({
        ...viewing,
        disabled: DataErase.contains(viewing.id),
      }))
      .map(({ id, disabled }) => (
        // @ts-expect-error ts-migrate(2769) FIXME: Type 'string' is not assignable to type 'number | ... Remove this comment to see the full error message
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
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <ViewingDetail
                model={viewingModels.get(id)}
                regionalAverageQoE={regionalAverageQoE}
                hourlyAverageQoE={hourlyAverageQoE}
              />
            );
          }}
          tabIndex="0"
        >
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Viewing
            model={viewingModels.get(id)}
            regionalAverageQoE={regionalAverageQoE}
            hourlyAverageQoE={hourlyAverageQoE}
            disabled={disabled}
          />
        </Grid>
      ));

    if (viewingList.length === 0) {
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      return <NoContents />;
    }

    const maxPage = Math.ceil(viewingList.length / perPage);

    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid container spacing={3} direction="row" alignItems="flex-start">
          {viewingList.slice(page * perPage, (page + 1) * perPage)}
        </Grid>
        {maxPage <= 1 ? null : (
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <Box my={2}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Grid container justify="center">
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Grid item>
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
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
  indexes: [],
  viewingModels: new Map(),
};
const reducer = ({
  indexes,
  viewingModels
}: any, chunk: any) => {
  chunk.viewingModels.forEach((viewingModel: any) => viewingModels.set(viewingModel.id, viewingModel)
  );

  return {
    loading: false,
    indexes: [...chunk.indexes, ...indexes],
    viewingModels,
  };
};
const dispatcher = (dispatch: any) => new WritableStream({
  write: async (viewingModels) => {
    const active = viewingModels.filter(({
      cache
    }: any) => cache !== undefined);
    const indexes = active.map(({
      id,
      cache
    }: any) => {
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

const getLastValue = (map: any) => {
  if (map.size === 0) return async () => ({});
  // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
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

      // NOTE: 測定結果の中から最新の月をデフォルト値にする
      // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'latest' implicitly has an 'any' t... Remove this comment to see the full error message
      getLastValue(viewings)().then(({ start_time: latest }) =>
        setDate(startOfMonth(latest || new Date()))
      );
    }
  }, [viewings, addIndexes]);
  // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
  if (viewings !== undefined && viewings.size === 0)
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    return <Redirect to="/welcome" />;
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box py={1}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid container justify="space-between" alignItems="flex-end">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <MonthSelect date={date} setDate={setDate} />
          </Grid>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <SiteSelect />
          </Grid>
        </Grid>
      </Box>
      {state.loading ? (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <LoadingProgress />
      ) : (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
