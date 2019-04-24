import React from "react";
import PropTypes from "prop-types";
import { MobileStepper, Button } from "@material-ui/core";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import AppDataActions from "../../utils/AppDataActions";
import AppData from "../../utils/AppData";

const Pager = ({ page, maxPage }) => {
  const handleBack = () => {
    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, { page: page - 1 })
    );
  };
  const BackButton = (
    <Button size="small" onClick={handleBack} disabled={page === 0}>
      <KeyboardArrowLeft />
      前のページ
    </Button>
  );
  const handleNext = () => {
    AppData.update(AppDataActions.ViewingList, state =>
      Object.assign(state, { page: page + 1 })
    );
  };
  const NextButton = (
    <Button size="small" onClick={handleNext} disabled={page === maxPage - 1}>
      次のページ
      <KeyboardArrowRight />
    </Button>
  );

  return (
    <MobileStepper
      variant="progress"
      steps={maxPage}
      position="static"
      activeStep={page}
      backButton={BackButton}
      nextButton={NextButton}
    />
  );
};

Pager.propTypes = {
  page: PropTypes.number.isRequired,
  maxPage: PropTypes.number.isRequired
};

export default Pager;
