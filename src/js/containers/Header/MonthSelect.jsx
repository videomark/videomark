import React, { Component } from "react";
import { IconButton } from "@material-ui/core";
import { ArrowRight, ArrowLeft } from "../../components/Icons";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import style from "../../../css/Header.module.css";

const now = () => new Date();

class MonthSelect extends Component {
  constructor(props) {
    super(props);

    const d = now();
    this.state = {
      date: new Date(d.getFullYear(), d.getMonth())
    };
  }

  setDate(date) {
    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, { date, page: 0 })
    );
    this.setState({ date });
    window.scrollTo(window.scrollX, 0);
  }

  render() {
    const { date } = this.state;
    const monthLater = (d, n) => {
      const tmp = new Date(d);
      tmp.setMonth(d.getMonth() + n);
      return tmp;
    };
    const oneMonthAgo = monthLater(date, -1);
    const oneMonthLater = monthLater(date, +1);

    return (
      <>
        <div>
          <IconButton
            color="primary"
            className={style.monthBack}
            onClick={() => {
              this.setDate(oneMonthAgo);
            }}
          >
            <ArrowLeft />
          </IconButton>
        </div>
        <div className={style.month}>
          <p className={style.monthText}>
            {`${date.getFullYear()}年${`0${date.getMonth() + 1}`.slice(-2)}月`}
          </p>
        </div>
        <div>
          {now() < oneMonthLater ? null : (
            <IconButton
              color="primary"
              className={style.monthNext}
              onClick={() => {
                this.setDate(oneMonthLater);
              }}
            >
              <ArrowRight />
            </IconButton>
          )}
        </div>
      </>
    );
  }
}
export default MonthSelect;
