import React from "react";
import PropTypes from "prop-types";
import { format, subMonths, addMonths, isThisMonth } from "date-fns";
import ja from "date-fns/locale/ja";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";

const useStyles = makeStyles((theme) => ({
  date: {
    ...theme.typography.subtitle1,
    margin: 0,
    lineHeight: 1,
    display: "inline",
  },
}));
const MonthSelect = ({ date, setDate }) => {
  const classes = useStyles();
  const handleLastMonth = () => {
    setDate(subMonths(date, 1));
  };
  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };
  return (
    <Grid container alignItems="center">
      <Grid item>
        <IconButton onClick={handleLastMonth} size="small">
          <ChevronLeft fontSize="inherit" />
        </IconButton>
      </Grid>
      <Grid item>
        <h3 className={classes.date}>
          {format(date, "yyyy 年 M 月", {
            locale: ja,
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
};
MonthSelect.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  setDate: PropTypes.func.isRequired,
};
export default MonthSelect;
