// -------------------------------------------------------------
// የኢትዮጵያ ካላንደር መዋቅር መቼቶች (E.C Calendar Variables)
// -------------------------------------------------------------
const monthsEthiopic = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
];

// ለቀመር ማቅለያ የአሁኑን ወር "ሰኔ" (Index 9) እናደርገዋለን
const CURRENT_MONTH_INDEX = 9;
const DAYS_IN_MONTH = 30;
const NO_CLASS_DAYS_STORAGE_KEY = "medresa_no_class_days";
const WEEK_DAYS = [
  { index: 0, short: "እሁድ", label: "እሁድ" },
  { index: 1, short: "ሰኞ", label: "ሰኞ" },
  { index: 2, short: "ማክሰኞ", label: "ማክሰኞ" },
  { index: 3, short: "ረቡዕ", label: "ረቡዕ" },
  { index: 4, short: "ሐሙስ", label: "ሐሙስ" },
  { index: 5, short: "አርብ", label: "አርብ" },
  { index: 6, short: "ቅዳሜ", label: "ቅዳሜ" },
];

// -------------------------------------------------------------
// የካላንደር መለወጫ ረዳት ፈንክሽኖች (Calendar Converter Helpers)
// -------------------------------------------------------------
function startDayOfEthiopian(year) {
  const newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
  return (year - 1) % 4 === 3 ? newYearDay + 1 : newYearDay;
}

function toGregorian(year, month, date) {
  const newYearDay = startDayOfEthiopian(year);
  let gregorianYear = year + 7;
  let gregorianMonths = [
    0.0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30,
  ];
  const nextYear = gregorianYear + 1;
  if ((nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0) {
    gregorianMonths[6] = 29;
  }
  let until = (month - 1) * 30.0 + date;
  if (until <= 37 && year <= 1575) {
    until += 28;
    gregorianMonths[0] = 31;
  } else {
    until += newYearDay - 1;
  }
  if ((year - 1) % 4 === 3) {
    until += 1;
  }
  let m = 0;
  let gregorianDate;
  for (let i = 0; i < gregorianMonths.length; i++) {
    if (until <= gregorianMonths[i]) {
      m = i;
      gregorianDate = until;
      break;
    } else {
      m = i;
      until -= gregorianMonths[i];
    }
  }
  if (m > 4) {
    gregorianYear += 1;
  }
  const order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const gregorianMonth = order[m];
  return [gregorianYear, gregorianMonth, gregorianDate];
}

function toEthiopian(year, month, date) {
  let gregorianMonths = [0.0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let ethiopianMonths = [
    0.0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30,
  ];
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    gregorianMonths[2] = 29;
  }
  let ethiopianYear = year - 8;
  if (ethiopianYear % 4 === 3) {
    ethiopianMonths[10] = 6;
  }
  const newYearDay = startDayOfEthiopian(year - 8);
  let until = 0;
  for (let i = 1; i < month; i++) {
    until += gregorianMonths[i];
  }
  until += date;
  let tahissas = ethiopianYear % 4 === 0 ? 26 : 25;
  if (year < 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahissas;
  } else if (until <= 277 && year === 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahissas;
  } else {
    tahissas = newYearDay - 3;
    ethiopianMonths[1] = tahissas;
  }
  let m;
  let ethiopianDate;
  for (m = 1; m < ethiopianMonths.length; m++) {
    if (until <= ethiopianMonths[m]) {
      ethiopianDate =
        m === 1 || ethiopianMonths[m] === 0 ? until + (30 - tahissas) : until;
      break;
    } else {
      until -= ethiopianMonths[m];
    }
  }
  if (m > 10) {
    ethiopianYear += 1;
  }
  const order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
  const ethiopianMonth = order[m];
  return [ethiopianYear, ethiopianMonth, ethiopianDate];
}

function getCurrentEthiopianDay() {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  return todayEC[2];
}

function getDayNameShort(d) {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const ethYear = todayEC[0];
  const ethMonth = CURRENT_MONTH_INDEX + 1; // Sene is 10
  const gregDateParts = toGregorian(ethYear, ethMonth, d);
  const dateGC = new Date(
    gregDateParts[0],
    gregDateParts[1] - 1,
    gregDateParts[2],
  );
  const dayNamesAmharic = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
  return dayNamesAmharic[dateGC.getDay()];
}

function getWeekdayIndexForMonthDay(d) {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const ethYear = todayEC[0];
  const ethMonth = CURRENT_MONTH_INDEX + 1;
  const gregDateParts = toGregorian(ethYear, ethMonth, d);
  const dateGC = new Date(
    gregDateParts[0],
    gregDateParts[1] - 1,
    gregDateParts[2],
  );
  return dateGC.getDay();
}

function getSavedNoClassDays() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(NO_CLASS_DAYS_STORAGE_KEY) || "[]");
  } catch (error) {
    saved = [];
  }
  return Array.isArray(saved)
    ? saved
        .map(Number)
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : [];
}

function saveNoClassDays(days) {
  state.noClassDays = [...new Set(days.map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  localStorage.setItem(
    NO_CLASS_DAYS_STORAGE_KEY,
    JSON.stringify(state.noClassDays),
  );
}

function isNoClassDay(dayNumber) {
  return state.noClassDays.includes(getWeekdayIndexForMonthDay(dayNumber));
}

function getInactiveReason(dayNumber) {
  if (isNoClassDay(dayNumber)) return "no-class";
  if (dayNumber < state.firstOpenedDay) return "before-open";
  return "";
}

function isInactiveDay(dayNumber) {
  return Boolean(getInactiveReason(dayNumber));
}

function getInactiveTooltip(dayNumber) {
  return getInactiveReason(dayNumber) === "no-class"
    ? "በዚህ የሳምንት ቀን ትምህርት የለም።"
    : "ይህ ቀን ሲስተሙ ከመከፈቱ በፊት የነበረ በመሆኑ መገኘት መቆጣጠር አይቻልም።";
}

function isMissedUncheckedDay(dayNumber, status, isTodayMonth, currentDay) {
  return (
    isTodayMonth &&
    dayNumber < currentDay &&
    !isInactiveDay(dayNumber) &&
    !status
  );
}
function getFullDate() {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const ethYear = todayEC[0];
  return todayEC;
}
function getDayLetter(d) {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const ethYear = todayEC[0];
  const ethMonth = CURRENT_MONTH_INDEX + 1;
  const gregDateParts = toGregorian(ethYear, ethMonth, d);
  const dateGC = new Date(
    gregDateParts[0],
    gregDateParts[1] - 1,
    gregDateParts[2],
  );
  const dayLettersAmharic = ["እ", "ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ"];
  return dayLettersAmharic[dateGC.getDay()];
}

// function getDayVerticalHtml(d) {
//   const name = getDayNameShort(d); // e.g. "ማክሰኞ"
//   //return name.split("").join("<br>");
//   return name;
