import React, { Component } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import videoPlatforms from "../../utils/videoPlatforms";

const styles = (theme: any) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  formControl: {
    minWidth: 120,
    "& label": {
      fontSize: theme.typography.caption.fontSize,
    },
  },

  select: {
    fontSize: theme.typography.caption.fontSize,
  }
});

type SiteSelectProps = {
    classes: any; // TODO: PropTypes.instanceOf(Object)
};

type SiteSelectState = any;

class SiteSelect extends Component<SiteSelectProps, SiteSelectState> {

  constructor(props: SiteSelectProps) {
    super(props);

    this.state = {
      site: "",
    };
  }

  setSite(value: any) {
    this.setState({ site: value });
    const ids = videoPlatforms
      .map(({ id }) => id)
      .filter((id) => value === "" || value === id);
    AppData.update(AppDataActions.ViewingList, (state: any) => Object.assign(state, {
      sites: ids,
      page: 0,
    })
    );
  }

  render() {
    const { site } = this.state;
    const { classes } = this.props;

    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className={classes.root}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <FormControl className={classes.formControl}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <InputLabel htmlFor="site">動画配信サービス</InputLabel>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Select
            className={classes.select}
            value={site}
            onChange={(event) => {
              this.setSite(event.target.value);
            }}
            name="site"
          >
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <MenuItem value="">すべて</MenuItem>
            {videoPlatforms.map(({ id, name, experimental }) =>
              experimental ? null : (
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2345) FIXME: Type 'string' is not assignable to type '"wrap" | ... Remove this comment to see the full error message
export default withStyles(styles)(SiteSelect);
