import * as React from "react";
import { IconButton } from "@material-ui/core";
import { Help } from "../../components/Icons";
import style from "../../../css/Header.module.css";
import SiteSelect from "./SiteSelect";
import MonthSelect from "./MonthSelect";

const Header = () => (
  <div className={style.root}>
    <div className={style.monthRoot}>
      <MonthSelect />
    </div>
    <div className={`${style.iconRoot}`}>
      <SiteSelect />
    </div>
    <div className={style.helpRoot}>
      <IconButton
        color="primary"
        className={style.helpButton}
        onClick={() => {
          window.open("https://vm.webdino.org/about/");
        }}
      >
        <Help />
      </IconButton>
    </div>
  </div>
);

export default Header;
