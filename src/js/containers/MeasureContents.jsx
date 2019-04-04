import * as React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import AppDataActions from "../utils/AppDataActions";
import appData from "../utils/AppData";
import { CrossIcon, Refresh } from "../components/Icons";
import QoEValueGraph from "../components/QoEValueGraph";
import dataErase from "../utils/DataErase";
import style from "../../css/MeasureContents.module.css";
import * as Utils from "../utils/Utils";
import measureData from "../utils/MeasureData";

const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

class MeasureContents extends React.Component {
  constructor(props) {
    super(props);

    const disabled = dataErase.contains(props.contentsData.id);
    this.state = { disabled };
  }

  normalContentsRender(modal = false) {
    const {
      contentsData: {
        id,
        title,
        location,
        thumbnail,
        qoe,
        average,
        startTime,
        state
      }
    } = this.props;
    const timeStr = toTimeString(startTime);

    const linkMoviePage = () => {
      if (modal) {
        window.open(location);
      }
    };
    return (
      <div className={`${style.main} ${modal ? style.modalMain : ""}`}>
        <div className={style.header}>
          <button
            type="button"
            onClick={() => {
              linkMoviePage();
            }}
          >
            <img
              className={`${style.thumbnail} ${
                modal ? style.modalThumbnail : ""
              }`}
              src={thumbnail}
              alt="movie thumbnail"
            />
          </button>
          <div className={style.movieInfo}>
            <span className={style.serviceName}>
              {Utils.LocationToService(location)}
            </span>
            <span className={style.startTime}>{timeStr}</span>
          </div>
        </div>
        <div
          className={modal ? `${style.title} ${style.modalTitle}` : style.title}
        >
          {title}
        </div>
        <div style={{ width: "100%", height: "20px" }} />
        <div className={style.qoeDate}>
          <div className={style.userGraph}>
            <div className={style.graph}>
              <QoEValueGraph
                label="この動画再生時の体感品質値"
                qoe={qoe}
                modal={modal}
                state={state}
              />
            </div>
          </div>
          <div className={style.expanded}>
            {state.IsCompleted() &&
              average.map(item => {
                return (
                  <div key={Utils.createKey()} className={style.graph}>
                    <QoEValueGraph
                      className={style.qoeGraph}
                      label={modal ? item.modalLabel : item.label}
                      qoe={item.value}
                      modal={modal}
                    />
                  </div>
                );
              })}
          </div>
          {modal && (
            <div>
              <Button
                color="secondary"
                className={style.eraseButton}
                onClick={() => {
                  dataErase.add(id);
                  appData.update(AppDataActions.Modal, null);
                }}
              >
                この計測結果を削除する
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  disabledContentsRender() {
    const {
      contentsData: { id, title, location, thumbnail, startTime }
    } = this.props;
    const timeStr = toTimeString(startTime);

    return (
      <div className={style.main}>
        <div className={style.header}>
          <button type="button">
            <img
              className={`${style.thumbnail} ${style.removedThumbnail}`}
              src={thumbnail}
              alt="movie thumbnail"
            />
          </button>
          <div className={style.movieInfo}>
            <span className={style.serviceName}>
              {Utils.LocationToService(location)}
            </span>
            <span className={style.startTime}>{timeStr}</span>
          </div>
        </div>
        <div className={style.title}>{title}</div>
        <div className={style.removedStateInfoText}>
          次回起動時に削除します。復元を押すと削除を取り消し、削除ボタンを押すと今すぐ削除します。
        </div>
        <div className={style.removedStateButtons}>
          <Button
            variant="contained"
            color="primary"
            className={style.removedStateButton}
            onClick={() => {
              dataErase.recover(id);
              this.setState({ disabled: false });
            }}
          >
            <Refresh />
            <span>&nbsp;復元</span>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={style.removedStateButton}
            onClick={async () => {
              await dataErase.remove(id);
              measureData.update();
            }}
          >
            <CrossIcon />
            <span>&nbsp;削除</span>
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { disabled } = this.state;
    return (
      <Grid>
        <div
          className={`${style.content}`}
          role="button"
          onClick={() => {
            if (disabled) {
              return;
            }
            const dom = this.normalContentsRender(true);
            appData.update(AppDataActions.Modal, dom, "test");
          }}
          onKeyPress={this.handleKeyPress}
          tabIndex="0"
        >
          {disabled
            ? this.disabledContentsRender()
            : this.normalContentsRender()}
        </div>
      </Grid>
    );
  }
}

MeasureContents.propTypes = {
  contentsData: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    thumbnail: PropTypes.string,
    qoe: PropTypes.string,
    average: PropTypes.array,
    startTime: PropTypes.instanceOf(Date),
    state: PropTypes.shape.isRequired
  }).isRequired
};

export default MeasureContents;
