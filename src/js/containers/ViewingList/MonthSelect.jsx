import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  subMonths,
  addMonths,
  isThisMonth
} from "date-fns";
import ja from "date-fns/locale/ja";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";

const MonthSelect = withStyles(theme => ({
  date: {
    ...theme.typography.subtitle1,
    margin: 0,
    lineHeight: 1,
    display: "inline"
  }
}))(({ classes }) => {
  const [date, setDate] = useState(startOfMonth(new Date()));
  const handleLastMonth = () => {
    setDate(subMonths(date, 1));
  };
  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };
  useEffect(() => {
    AppData.update(AppDataActions.ViewingList, { date, page: 0 });
  }, [date]);
  return (
    <Grid container alignItems="center">
      <Grid item>
        <IconButton onClick={handleLastMonth} size="small">
          <ChevronLeft fontSize="inherit" />
        </IconButton>
      </Grid>
      <Grid item>
        <h3 className={classes.date}>
          {format(date, "yyyy年MMM", {
            locale: ja
          })}
        </h3>
      </Grid>
      <Grid item>
        <IconButton
          onClick={handleNextMonth}
          size="small"
          disabled={isThisMonth(date)}
        >
          <ChevronRight fontSize="inherit" />
        </IconButton>
      </Grid>
    </Grid>
  );
});
export default MonthSelect;
