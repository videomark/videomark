import * as React from "react";
import { IconButton } from "@material-ui/core";
import { ArrowRight, ArrowLeft, Help } from "../../components/Icons";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import { Services } from "../../utils/Utils";
import SiteFilterButton from "./SiteFilterButton";
import style from "../../../css/Header.module.css";
import tooltipStyle from "../../../css/Tooltip.module.css";

const now = () => new Date();

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monthFilter: now(),
      siteFilter: Object.keys(Services).reduce(
        (a, key) => Object.assign(a, { [key]: true }),
        {}
      )
    };
  }

  setMonthFilter(monthFilter) {
    if (now() < monthFilter) return;

    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, { date: monthFilter })
    );
    this.setState({ monthFilter });
  }

  setSiteFilter(siteFilter) {
    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, {
        sites: Object.entries(siteFilter)
          .filter(([, enable]) => enable)
          .map(([site]) => site)
      })
    );
    this.setState({ siteFilter });
  }

  render() {
    const { monthFilter, siteFilter } = this.state;
    return (
      <div className={style.root}>
        <div className={style.monthRoot}>
          <div>
            <IconButton
              color="primary"
              className={style.monthBack}
              onClick={() => {
                const changedMonth = new Date(monthFilter.getTime());
                changedMonth.setMonth(monthFilter.getMonth() - 1);
                this.setMonthFilter(changedMonth);
              }}
            >
              <ArrowLeft />
            </IconButton>
          </div>
          <div className={style.month}>
            <p className={style.monthText}>
              {`${monthFilter.getFullYear()}年${`0${monthFilter.getMonth() +
                1}`.slice(-2)}月`}
            </p>
          </div>
          <div>
            <IconButton
              color="primary"
              className={style.monthNext}
              onClick={() => {
                const changedMonth = new Date(monthFilter.getTime());
                changedMonth.setMonth(monthFilter.getMonth() + 1);
                this.setMonthFilter(changedMonth);
              }}
            >
              <ArrowRight />
            </IconButton>
          </div>
        </div>
        <div className={`${style.iconRoot} ${tooltipStyle.tooltip}`}>
          <span className={tooltipStyle.tooltiptext}>
            視聴結果を表示する動画をサービスで絞り込みできます
          </span>
          <div className={style.siteFilter}>
            <SiteFilterButton
              enabled={siteFilter[Services.paravi]}
              service={Services.paravi}
              callback={() => {
                siteFilter[Services.paravi] = !siteFilter[Services.paravi];
                this.setSiteFilter(siteFilter);
              }}
            />
          </div>
          <div className={style.siteFilter}>
            <SiteFilterButton
              enabled={siteFilter[Services.tver]}
              service={Services.tver}
              callback={() => {
                siteFilter[Services.tver] = !siteFilter[Services.tver];
                this.setSiteFilter(siteFilter);
              }}
            />
          </div>
          <div className={style.siteFilter}>
            <SiteFilterButton
              enabled={siteFilter[Services.youtube]}
              service={Services.youtube}
              callback={() => {
                siteFilter[Services.youtube] = !siteFilter[Services.youtube];
                this.setSiteFilter(siteFilter);
              }}
            />
          </div>
        </div>
        <div className={style.helpRoot}>
          <IconButton
            color="primary"
            className={style.helpButton}
            onClick={() => {
              window.open("https://vm.webdino.org/about/");
            }}
          >
            <Help />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default Header;
