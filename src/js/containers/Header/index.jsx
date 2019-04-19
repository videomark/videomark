import * as React from "react";
import { IconButton } from "@material-ui/core";
import { ArrowRight, ArrowLeft, Help } from "../../components/Icons";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import style from "../../../css/Header.module.css";
import SiteSelect from "./SiteSelect";

const now = () => new Date();
const monthLater = (date, n) => {
  const tmp = new Date(date);
  tmp.setMonth(date.getMonth() + n);
  return tmp;
};

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monthFilter: new Date(now().getFullYear(), now().getMonth())
    };
  }

  setMonthFilter(monthFilter) {
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
                this.setMonthFilter(monthLater(monthFilter, -1));
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
            {now() < monthLater(monthFilter, +1) ? null : (
              <IconButton
                color="primary"
                className={style.monthNext}
                onClick={() => {
                  this.setMonthFilter(monthLater(monthFilter, +1));
                }}
              >
                <ArrowRight />
              </IconButton>
            )}
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
