import * as React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import MeasureContents from "./MeasureContents";
import { LocationToService } from "./Utils";
import style from "../css/GridContainer.module.css";
import AppData from "./Data/AppData";
import AppDataActions from "./Data/AppDataActions";

const contentsRender = data => {
  return data.map(value => {
    return <MeasureContents key={value.id} contentsData={value} />;
  });
};

const noContentsRender = title => {
  return (
    <div className={style.nonContents}>
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
      <p>
        現在 QoE の計測が可能な動画配信サービスはこちらです:
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
      </p>
    </div>
  );
};

class GridContainer extends React.Component {
  constructor(props) {
    super(props);

    const { contentsData: data } = props;

    const monthFilter = AppData.get(AppDataActions.MonthFilter);
    const siteFilter = AppData.get(AppDataActions.SiteFilter);
    this.state = { data, siteFilter, monthFilter };
  }

  update(contentsData) {
    this.setState({ data: contentsData });
  }

  updateSiteFilter(siteFilter) {
    this.setState({ siteFilter });
  }

  updateMonthFilter(monthFilter) {
    this.setState({ monthFilter });
  }

  render() {
    const { data, siteFilter, monthFilter } = this.state;
    const renderData = data.filter(item => {
      const service = LocationToService(item.location);
      if (
        item.startTime.getFullYear() !== monthFilter.getFullYear() ||
        item.startTime.getMonth() !== monthFilter.getMonth()
      ) {
        return false;
      }
      if (service in siteFilter) {
        return siteFilter[service];
      }
      return true;
    });

    if (data.length === 0) {
      return (
        <div className={style.gridContainer}>
          <Grid>
            {noContentsRender("まだ計測対象となる動画を視聴していません")}
          </Grid>
        </div>
      );
    }
    return (
      <div className={style.gridContainer}>
        <Grid
          container
          spacing={24}
          direction="row"
          alignItems="flex-start"
          id={style.con}
          className={renderData.length === 0 ? "" : style.grid}
        >
          {renderData.length === 0
            ? noContentsRender("該当する計測結果がありません")
            : contentsRender(renderData)}
        </Grid>
      </div>
    );
  }
}

GridContainer.propTypes = {
  contentsData: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default GridContainer;
