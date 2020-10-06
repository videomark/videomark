import React from "react";
import Pagination from "material-ui-flat-pagination";
import AppDataActions from "../../utils/AppDataActions";
import AppData from "../../utils/AppData";

type Props = {
    page: number;
    perPage: number;
    maxPage: number;
};

const Pager = ({ page, perPage, maxPage }: Props) => {
  const handleClick = (e: any, offset: any) => {
    AppData.update(AppDataActions.ViewingList, (state: any) => Object.assign(state, { page: offset / perPage })
    );
    window.scrollTo(window.scrollX, 0);
  };

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Pagination
      limit={perPage}
      offset={page * perPage}
      total={maxPage * perPage}
      onClick={handleClick}
      otherPageColor="default"
    />
  );
};

export default Pager;
