// -------------------------------------------------------------
// ጭብጥ መቆጣጠሪያ ሞዱል (Theme Switcher Module)
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem("medresa_theme") || "dark";
  setTheme(savedTheme);
}

function setTheme(theme) {
  const themeBtnSidebar = document.getElementById("themeToggleSidebar");
  const themeIconMobile = document.getElementById("themeIconMobile");

  if (theme === "light") {
    document.body.classList.add("light-mode");
    if (themeBtnSidebar) themeBtnSidebar.innerText = "☀️ ብርሃን";
    if (themeIconMobile) {
      // Sun SVG Path
      themeIconMobile.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    }
    localStorage.setItem("medresa_theme", "light");
  } else {
    document.body.classList.remove("light-mode");
    if (themeBtnSidebar) themeBtnSidebar.innerText = "🌙 ጨለማ";
    if (themeIconMobile) {
      // Moon SVG Path
      themeIconMobile.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
    localStorage.setItem("medresa_theme", "dark");
  }
}

function initFirstOpenedDay() {
  if (!localStorage.getItem("medresa_first_opened_day")) {
    const todayGC = new Date();
    const todayEC = toEthiopian(
      todayGC.getFullYear(),
      todayGC.getMonth() + 1,
      todayGC.getDate(),
    );
    localStorage.setItem("medresa_first_opened_day", todayEC[2]);
  }
  state.firstOpenedDay =
    parseInt(localStorage.getItem("medresa_first_opened_day")) || 1;
}
