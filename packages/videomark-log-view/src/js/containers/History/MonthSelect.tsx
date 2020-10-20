import React from "react";
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

type Props = {
    date: any; // TODO: PropTypes.instanceOf(Date)
    setDate: (...args: any[]) => any;
};
const MonthSelect = ({ date, setDate }: Props) => {
  const classes = useStyles();
  const handleLastMonth = () => {
    setDate(subMonths(date, 1));
  };
  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid container alignItems="center">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <IconButton onClick={handleLastMonth} size="small">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ChevronLeft fontSize="inherit" />
        </IconButton>
      </Grid>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <h3 className={classes.date}>
          {format(date, "yyyy年MMM", {
            locale: ja,
          })}
        </h3>
      </Grid>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <IconButton
          onClick={handleNextMonth}
          size="small"
          disabled={isThisMonth(date)}
        >
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ChevronRight fontSize="inherit" />
        </IconButton>
      </Grid>
    </Grid>
  );
};
export default MonthSelect;
