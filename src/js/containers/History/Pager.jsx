import React from "react";
import PropTypes from "prop-types";
import Pagination from "material-ui-flat-pagination";
import AppDataActions from "../../utils/AppDataActions";
import AppData from "../../utils/AppData";

const Pager = ({ page, perPage, maxPage }) => {
  const handleClick = (e, offset) => {
    AppData.update(AppDataActions.ViewingList, (state) =>
      Object.assign(state, { page: offset / perPage })
    );
    window.scrollTo(window.scrollX, 0);
  };

  return (
    <Pagination
      limit={perPage}
      offset={page * perPage}
      total={maxPage * perPage}
      onClick={handleClick}
      otherPageColor="default"
    />
  );
};

Pager.propTypes = {
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  maxPage: PropTypes.number.isRequired,
};

export default Pager;
