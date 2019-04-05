import * as React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import MeasureContents from "../MeasureContents";
import { LocationToService } from "../../utils/Utils";
import style from "../../../css/GridContainer.module.css";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import NoContents from "./NoContents";

const contentsRender = data => {
  return data.map(value => {
    return <MeasureContents key={value.id} contentsData={value} />;
  });
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
            <NoContents title="まだ計測対象となる動画を視聴していません" />
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
          {renderData.length === 0 ? (
            <NoContents />
          ) : (
            contentsRender(renderData)
          )}
        </Grid>
      </div>
    );
  }
}

GridContainer.propTypes = {
  contentsData: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default GridContainer;
