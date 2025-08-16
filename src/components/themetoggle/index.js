import React, { useEffect, useState } from "react";
import { WiMoonAltWaningCrescent4 } from "react-icons/wi";


const Themetoggle = () => {
  const getDefaultTheme = () => {
    if (localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, settheme] = useState(getDefaultTheme());

  const themetoggle = () => {
    settheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); 
  }, [theme]);

  return (
    <button className="nav_ac" onClick={themetoggle}>
      <WiMoonAltWaningCrescent4 />
    </button>
  );
};

export default Themetoggle;
