import React, { Component } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import videoPlatforms from "../../utils/videoPlatforms";

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    minWidth: 120,
    "& label": {
      fontSize: theme.typography.caption.fontSize
    }
  },
  select: {
    fontSize: theme.typography.caption.fontSize
  }
});

class SiteSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      site: ""
    };
  }

  setSite(value) {
    this.setState({ site: value });
    const ids = videoPlatforms
      .map(({ id }) => id)
      .filter(id => value === "" || value === id);
    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, {
        sites: ids,
        page: 0
      })
    );
  }

  render() {
    const { site } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="site">動画配信サービス</InputLabel>
          <Select
            className={classes.select}
            value={site}
            onChange={event => {
              this.setSite(event.target.value);
            }}
            name="site"
          >
            <MenuItem value="">すべて</MenuItem>
            {videoPlatforms.map(({ id, name, experimental }) =>
              experimental ? null : (
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

SiteSelect.propTypes = {
  classes: PropTypes.instanceOf(Object).isRequired
};

export default withStyles(styles)(SiteSelect);
