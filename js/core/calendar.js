// -------------------------------------------------------------
// የኢትዮጵያ ካላንደር መዋቅር መቼቶች (E.C Calendar Variables)
// -------------------------------------------------------------
const monthsEthiopic = [
  "መስከረም", // 0
  "ጥቅምት", // 1
  "ህዳር", // 2
  "ታህሳስ", // 3
  "ጥር", // 4
  "የካቲት", // 5
  "መጋቢት", // 6
  "ሚያዝያ", // 7
  "ግንቦት", // 8
  "ሰኔ", // 9
  "ሐምሌ", // 10
  "ነሐሴ", // 11
  "ጳጉሜ", // 12
];

// ዛሬ (Today) — computed dynamically from real system date
const _todayGC = new Date();
const _ecToday = toEthiopian(
  _todayGC.getFullYear(),
  _todayGC.getMonth() + 1,
  _todayGC.getDate(),
);
const TODAY_EC = {
  year: _ecToday[0],
  month: _ecToday[1] - 1,
  day: _ecToday[2],
}; // month is 0-indexed

const DAYS_IN_MONTH = 30; // for legacy compatibility
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

// Returns number of days in an EC month (year, 0-indexed monthIdx)
function getDaysInECMonth(year, monthIdx) {
  if (monthIdx === 12) {
    // ጳጉሜ (Pagume)
    return year % 4 === 3 ? 6 : 5;
  }
  return 30;
}

// Is the selected year/month the current (today's) month?
function isCurrentMonth() {
  return (
    state.selectedYear === TODAY_EC.year &&
    state.selectedMonth === TODAY_EC.month
  );
}

// Is the selected year/month before today's month?
function isBeforeCurrentMonth() {
  if (state.selectedYear < TODAY_EC.year) return true;
  if (
    state.selectedYear === TODAY_EC.year &&
    state.selectedMonth < TODAY_EC.month
  )
    return true;
  return false;
}

// Is the selected year/month after today's month?
function isAfterCurrentMonth() {
  if (state.selectedYear > TODAY_EC.year) return true;
  if (
    state.selectedYear === TODAY_EC.year &&
    state.selectedMonth > TODAY_EC.month
  )
    return true;
  return false;
}

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

// Returns [year, month(1-indexed), day] for today (dynamic)
function getFullDate() {
  return [TODAY_EC.year, TODAY_EC.month + 1, TODAY_EC.day];
}

// Returns the current EC day number (dynamic, from real system date)
function getCurrentEthiopianDay() {
  return TODAY_EC.day;
}

// Returns a formatted string for today in Ethiopian calendar
function getTodayDisplayString() {
  return `${monthsEthiopic[TODAY_EC.month]} ${TODAY_EC.day}, ${TODAY_EC.year} ዓ.ል`;
}

// Gets the short weekday name for day d in the currently selected month
function getDayNameShort(d) {
  const ethYear = state.selectedYear;
  const ethMonth = state.selectedMonth + 1; // 1-indexed
  const gregDateParts = toGregorian(ethYear, ethMonth, d);
  const dateGC = new Date(
    gregDateParts[0],
    gregDateParts[1] - 1,
    gregDateParts[2],
  );
  const dayNamesAmharic = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
  return dayNamesAmharic[dateGC.getDay()];
}

// Gets the single-letter weekday for day d in the selected month
function getDayLetter(d) {
  const ethYear = state.selectedYear;
  const ethMonth = state.selectedMonth + 1;
  const gregDateParts = toGregorian(ethYear, ethMonth, d);
  const dateGC = new Date(
    gregDateParts[0],
    gregDateParts[1] - 1,
    gregDateParts[2],
  );
  const dayLettersAmharic = ["እ", "ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ"];
  return dayLettersAmharic[dateGC.getDay()];
}

// Returns JS weekday index (0=Sun) for day d in the selected month
function getWeekdayIndexForMonthDay(d) {
  const ethYear = state.selectedYear;
  const ethMonth = state.selectedMonth + 1;
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

// A day is inactive if:
// 1) It falls on a no-class weekday
// 2) The selected year/month is strictly before the system's opening date (firstOpenedDate)
// 3) It's the exact opening month/year, but the day is before the opening day
//
// NOTE: Past months (before today) that are ON OR AFTER the opening date are NOT inactive —
// attendance can be viewed/corrected for those months.
function getInactiveReason(dayNumber) {
  if (isNoClassDay(dayNumber)) return "no-class";

  const fd = state.firstOpenedDate; // { year, month, day } — full EC date
  const sy = state.selectedYear;
  const sm = state.selectedMonth;

  // Selected year is before opening year → entire month is before-open
  if (sy < fd.year) return "before-open";

  // Same year, but month is before opening month
  if (sy === fd.year && sm < fd.month) return "before-open";

  // Same year + month as opening: only days before the opening day are before-open
  if (sy === fd.year && sm === fd.month && dayNumber < fd.day)
    return "before-open";

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

// A day is "missed/unchecked" if it is a past day with no attendance recorded
function isMissedUncheckedDay(dayNumber, status) {
  if (status) return false;
  if (isInactiveDay(dayNumber)) return false;
  if (isAfterCurrentMonth()) return false;

  if (isCurrentMonth()) {
    return dayNumber < TODAY_EC.day;
  }
  // Past months: all active days count as missed if unchecked
  if (isBeforeCurrentMonth()) return true;
  return false;
}

// Is day a future day (cannot record attendance yet)?
function isFutureDay(dayNumber) {
  if (isAfterCurrentMonth()) return true;
  if (isCurrentMonth() && dayNumber > TODAY_EC.day) return true;
  return false;
}

// Is day the actual today?
function isTodayDay(dayNumber) {
  return isCurrentMonth() && dayNumber === TODAY_EC.day;
}

// Detect mobile device to scale down canvas sizes and avoid memory exhaustion
function getPdfScale() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  return isMobile ? 1.0 : 2.0;
}
