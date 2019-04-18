import * as React from "react";
import { IconButton } from "@material-ui/core";
import { ArrowRight, ArrowLeft, Help } from "../../components/Icons";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import style from "../../../css/Header.module.css";
import SiteSelect from "./SiteSelect";

const now = () => new Date();

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monthFilter: now()
    };
  }

  setMonthFilter(monthFilter) {
    if (now() < monthFilter) return;

    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, { date: monthFilter })
    );
    this.setState({ monthFilter });
  }

  render() {
    const { monthFilter } = this.state;
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
        <div className={`${style.iconRoot}`}>
          <SiteSelect />
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
