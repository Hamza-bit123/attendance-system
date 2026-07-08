// -------------------------------------------------------------
// የመተግበሪያው አስነሺ መሪ ሞዱል (App Lifecycle Handlers)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  checkAndSeedDatabase();
  initTheme();
  initFirstOpenedDay();
  initDateSelectors();
  initInterfaceCore();

  // Determine default view to render on start
  const activeViewEl = document.querySelector(".app-view.active");
  const activeViewId = activeViewEl ? activeViewEl.id : "home-view";
  switchView(activeViewId);

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dots-btn")) {
      const menu = document.getElementById("actionDropdownDeck");
      if (menu) menu.classList.remove("show");
    }
  });
});

// Records the full EC date {year, month, day} when the system was first opened.
// Uses the new "medresa_first_opened_date" key (full JSON object).
// Migrates and removes the obsolete "medresa_first_opened_day" bare-number key.
function initFirstOpenedDay() {
  // Clean up legacy bare-number key to avoid future confusion
  const legacyKey = "medresa_first_opened_day";
  if (localStorage.getItem(legacyKey) !== null) {
    localStorage.removeItem(legacyKey);
  }

  const newKey = "medresa_first_opened_date";
  const raw = localStorage.getItem(newKey);
  let parsed = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }

  // Check if parsed is a valid date object
  const isValid = parsed && 
                  typeof parsed.year === "number" && 
                  typeof parsed.month === "number" && 
                  typeof parsed.day === "number";

  // Check if the stored date is in the future compared to TODAY_EC (invalid state)
  let isStoredInFuture = false;
  if (isValid) {
    if (parsed.year > TODAY_EC.year) {
      isStoredInFuture = true;
    } else if (parsed.year === TODAY_EC.year) {
      if (parsed.month > TODAY_EC.month) {
        isStoredInFuture = true;
      } else if (parsed.month === TODAY_EC.month && parsed.day > TODAY_EC.day) {
        isStoredInFuture = true;
      }
    }
  }

  if (isValid && !isStoredInFuture) {
    state.firstOpenedDate = parsed;
  } else {
    // Default/Reset: record today's actual EC date as the opening date
    const openingDate = { year: TODAY_EC.year, month: TODAY_EC.month, day: TODAY_EC.day };
    state.firstOpenedDate = openingDate;
    localStorage.setItem(newKey, JSON.stringify(openingDate));
  }
}

// Build year/month selector dropdowns and inject them into the DOM
function initDateSelectors() {
  // Generate year range: 2010 to max(2025, today's EC year) E.C.
  const startYear = 2010;
  const endYear = Math.max(2025, TODAY_EC.year);

  // Build options for year select
  function buildYearOptions(selectEl) {
    selectEl.innerHTML = "";
    for (let y = endYear; y >= startYear; y--) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = `${y} ዓ.ም`;
      if (y === state.selectedYear) opt.selected = true;
      selectEl.appendChild(opt);
    }
  }

  // Build options for month select
  function buildMonthOptions(selectEl) {
    selectEl.innerHTML = "";
    monthsEthiopic.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = name;
      if (idx === state.selectedMonth) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  // Wire up a pair of year+month selects
  function wireSelectors(yearSelId, monthSelId) {
    const yearSel = document.getElementById(yearSelId);
    const monthSel = document.getElementById(monthSelId);
    if (!yearSel || !monthSel) return;

    buildYearOptions(yearSel);
    buildMonthOptions(monthSel);

    const onChange = () => {
      const y = parseInt(yearSel.value);
      const m = parseInt(monthSel.value);
      setSelectedDate(y, m);
      syncAllDateSelectors();
      // Re-render the currently active view
      const activeViewEl = document.querySelector(".app-view.active");
      if (activeViewEl) renderView(activeViewEl.id);
    };

    yearSel.addEventListener("change", onChange);
    monthSel.addEventListener("change", onChange);
  }

  wireSelectors("attYearSelect", "attMonthSelect");
  wireSelectors("previewYearSelect", "previewMonthSelect");
  wireSelectors("warningYearSelect", "warningMonthSelect");
  wireSelectors("dashYearSelect", "dashMonthSelect");

  // Populate today-badge elements on initial load
  syncAllDateSelectors();
}

// Keep all date selectors in sync and update today-badge displays
function syncAllDateSelectors() {
  const pairs = [
    ["attYearSelect", "attMonthSelect"],
    ["previewYearSelect", "previewMonthSelect"],
    ["warningYearSelect", "warningMonthSelect"],
    ["dashYearSelect", "dashMonthSelect"],
  ];
  pairs.forEach(([yearId, monthId]) => {
    const yearSel = document.getElementById(yearId);
    const monthSel = document.getElementById(monthId);
    if (yearSel) yearSel.value = state.selectedYear;
    if (monthSel) monthSel.value = state.selectedMonth;
  });

  // Update all today-badge and subtitle elements with the real dynamic date
  const todayStr = getTodayDisplayString();
  document.querySelectorAll(".today-badge").forEach((el) => {
    el.textContent = `ዛሬ፤ ${todayStr}`;
  });
  document.querySelectorAll(".today-subtitle").forEach((el) => {
    el.textContent = `ዛሬ፤ ${todayStr}`;
  });
}

function initInterfaceCore() {
  // Brand Logo/Name click → Home
  const brandSidebar = document.getElementById("sidebarBrandHome");
  if (brandSidebar) {
    brandSidebar.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach((i) => i.classList.remove("active"));
      switchView("home-view");
    });
  }

  const brandMobile = document.getElementById("mobileBrandHome");
  if (brandMobile) {
    brandMobile.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach((i) => i.classList.remove("active"));
      switchView("home-view");
      closeMobileSidebar();
    });
  }

  // Sidebar nav items
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      document.querySelectorAll(".sidebar-item").forEach((i) => i.classList.remove("active"));
      e.currentTarget.classList.add("active");

      const targetView = e.currentTarget.getAttribute("data-view");
      if (targetView === "instructor-reg-view") {
        state.editingInstructorId = null;
      } else if (targetView === "student-reg-view") {
        state.editingStudentId = null;
      }

      switchView(targetView);
      closeMobileSidebar();
    });
  });

  // Mobile controls
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("sidebarOverlay").classList.add("active");
  });

  document.getElementById("sidebarOverlay").addEventListener("click", closeMobileSidebar);

  // Theme toggle
  const themeBtnSidebar = document.getElementById("themeToggleSidebar");
  if (themeBtnSidebar) {
    themeBtnSidebar.addEventListener("click", () => {
      const currentTheme = localStorage.getItem("medresa_theme") || "dark";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  const themeBtnMobile = document.getElementById("themeToggleMobile");
  if (themeBtnMobile) {
    themeBtnMobile.addEventListener("click", () => {
      const currentTheme = localStorage.getItem("medresa_theme") || "dark";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", handleSettingsSave);
  }

  document.getElementById("instructorRegForm").addEventListener("submit", handleInstructorReg);

  document.getElementById("batchLimitSelect").addEventListener("change", (e) => {
    state.batchTarget = parseInt(e.target.value);
    state.batchCount = 0;
    updateBatchUI();
  });

  document.getElementById("attendanceInstructorSelect").addEventListener("change", (e) => {
    state.currentAttendanceInstructor = e.target.value;
    renderAttendanceMatrix();
  });

  // Mark all present
  const btnMarkAll = document.getElementById("btnMarkAllPresent");
  if (btnMarkAll) {
    btnMarkAll.addEventListener("click", markAllStudentsPresent);
  }

  // Student filter
  const filterSelect = document.getElementById("studentInstructorFilter");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      renderStudentTable();
    });
  }

  // Report filter
  const previewFilter = document.getElementById("previewInstructorFilter");
  if (previewFilter) {
    previewFilter.addEventListener("change", () => {
      renderMasterReportPreview();
    });
  }

  document.getElementById("btnDownloadPdf").addEventListener("click", executePdfGeneration);

  const btnDownloadWarning = document.getElementById("btnDownloadWarningPdf");
  if (btnDownloadWarning) {
    btnDownloadWarning.addEventListener("click", executeWarningPdfGeneration);
  }

  const btnGoToWarning = document.getElementById("btnGoToWarningReport");
  if (btnGoToWarning) {
    btnGoToWarning.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach((i) => i.classList.remove("active"));
      const warningSidebarItem = document.querySelector('.sidebar-item[data-view="warning-report-view"]');
      if (warningSidebarItem) warningSidebarItem.classList.add("active");
      switchView("warning-report-view");
    });
  }

  const detailsModal = document.getElementById("studentDetailsModal");
  if (detailsModal) {
    const closeBtn = document.getElementById("btnStudentDetailsModalClose");
    const footerCloseBtn = document.getElementById("btnStudentDetailsClose");
    const closeFn = () => detailsModal.classList.remove("show");
    if (closeBtn) closeBtn.addEventListener("click", closeFn);
    if (footerCloseBtn) footerCloseBtn.addEventListener("click", closeFn);
    detailsModal.addEventListener("click", (e) => {
      if (e.target === detailsModal) closeFn();
    });
  }

  // Action dropdown
  document.getElementById("btnDropdownDelete").addEventListener("click", executeContextDeletion);
  document.getElementById("btnDropdownUpdate").addEventListener("click", triggerContextUpdate);
}

function closeMobileSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

function switchView(viewId) {
  document.querySelectorAll(".app-view").forEach((v) => v.classList.remove("active"));
  const activeView = document.getElementById(viewId);
  if (activeView) activeView.classList.add("active");

  renderView(viewId);

  if (viewId === "attendance-view") {
    setTimeout(scrollToCurrentMonthColumn, 300);
  }
}

function renderView(viewId) {
  if (viewId === "home-view") {
    // Static home view
  } else if (viewId === "dash-view") {
    renderDashboard();
  } else if (viewId === "attendance-view") {
    populateInstructorDropdowns();
    renderAttendanceMatrix();
  } else if (viewId === "preview-view") {
    populatePreviewFilterDropdown();
    renderMasterReportPreview();
  } else if (viewId === "instructor-reg-view") {
    prepareInstructorForm();
  } else if (viewId === "instructor-manage-view") {
    renderInstructorTable();
  } else if (viewId === "student-reg-view") {
    renderStudentFormArea();
  } else if (viewId === "student-manage-view") {
    populateStudentFilterDropdown();
    renderStudentTable();
  } else if (viewId === "settings-view") {
    renderSettingsView();
  } else if (viewId === "warning-report-view") {
    renderWarningReportPreview();
  }
}

function renderSettingsView() {
  WEEK_DAYS.forEach((day) => {
    const checkbox = document.getElementById(`noClassDay${day.index}`);
    if (checkbox) checkbox.checked = state.noClassDays.includes(day.index);
  });
}

function handleSettingsSave(e) {
  e.preventDefault();
  const selectedDays = WEEK_DAYS.filter((day) => {
    const checkbox = document.getElementById(`noClassDay${day.index}`);
    return checkbox && checkbox.checked;
  }).map((day) => day.index);

  saveNoClassDays(selectedDays);
  showAlert("ቅንብሮች ተቀምጠዋል", "ትምህርት የሌለባቸው የሳምንት ቀናት ተዘምነዋል።");

  const activeViewEl = document.querySelector(".app-view.active");
  if (activeViewEl) renderView(activeViewEl.id);
}

function populatePreviewFilterDropdown() {
  const filterSelect = document.getElementById("previewInstructorFilter");
  if (!filterSelect) return;
  const savedVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="all">ሁሉም</option>';

  state.instructors.forEach((ins) => {
    let opt = document.createElement("option");
    opt.value = ins.id;
    opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
    filterSelect.appendChild(opt);
  });

  if (savedVal && (savedVal === "all" || state.instructors.find((i) => i.id === savedVal))) {
    filterSelect.value = savedVal;
  } else {
    filterSelect.value = "all";
  }
}

function populateInstructorDropdowns() {
  const attSelect = document.getElementById("attendanceInstructorSelect");
  const savedVal = attSelect.value;
  attSelect.innerHTML = "";

  if (state.instructors.length > 0) {
    state.instructors.forEach((ins) => {
      let opt = document.createElement("option");
      opt.value = ins.id;
      opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
      attSelect.appendChild(opt);
    });
    if (savedVal && state.instructors.find((i) => i.id === savedVal)) {
      attSelect.value = savedVal;
    }
    state.currentAttendanceInstructor = attSelect.value;
  }
}

function populateStudentFilterDropdown() {
  const filterSelect = document.getElementById("studentInstructorFilter");
  if (!filterSelect) return;
  const savedVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="all">ሁሉም</option>';

  state.instructors.forEach((ins) => {
    let opt = document.createElement("option");
    opt.value = ins.id;
    opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
    filterSelect.appendChild(opt);
  });

  if (savedVal && (savedVal === "all" || state.instructors.find((i) => i.id === savedVal))) {
    filterSelect.value = savedVal;
  } else {
    filterSelect.value = "all";
  }
}
