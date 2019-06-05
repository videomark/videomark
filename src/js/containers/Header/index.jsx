import * as React from "react";
import { IconButton } from "@material-ui/core";
import { Help } from "../../components/Icons";
import style from "../../../css/Header.module.css";
import SiteSelect from "./SiteSelect";
import MonthSelect from "./MonthSelect";
import { isMobile, isExtension, isDevelop } from "../../utils/Utils";

const helpUrl = (base => {
  console.error({ isMobile, isExtension, isDevelop });
  if (isMobile()) return new URL("android", base);
  if (isExtension()) return new URL("extension", base);
  return base;
})(new URL("https://vm.webdino.org/help/"));

const Header = () => (
  <div className={style.root}>
    <div className={style.monthRoot}>
      <MonthSelect />
    </div>
    <div className={`${style.iconRoot}`}>
      <SiteSelect />
    </div>
    <div className={style.helpRoot}>
      <IconButton color="primary" className={style.helpButton} href={helpUrl}>
        <Help />
      </IconButton>
    </div>
  </div>
);

export default Header;
