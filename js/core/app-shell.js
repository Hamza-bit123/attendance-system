// -------------------------------------------------------------
// የመተግበሪያው አስነሺ መሪ ሞዱል (App Lifecycle Handlers)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  checkAndSeedDatabase();
  initTheme();
  initFirstOpenedDay();
  initInterfaceCore();

  // Determine default view to render on start
  const activeViewEl = document.querySelector(".app-view.active");
  const activeViewId = activeViewEl ? activeViewEl.id : "home-view";
  switchView(activeViewId);

  // የውጪ ጠቅታዎችን በመጥለፍ ሜኑ ለመዝጋት
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dots-btn")) {
      const menu = document.getElementById("actionDropdownDeck");
      if (menu) menu.classList.remove("show");
    }
  });
});

function initInterfaceCore() {
  // Brand Logo/Name click to navigate to Home Page
  const brandSidebar = document.getElementById("sidebarBrandHome");
  if (brandSidebar) {
    brandSidebar.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar-item")
        .forEach((i) => i.classList.remove("active"));
      switchView("home-view");
    });
  }

  const brandMobile = document.getElementById("mobileBrandHome");
  if (brandMobile) {
    brandMobile.addEventListener("click", () => {
      document
        .querySelectorAll(".sidebar-item")
        .forEach((i) => i.classList.remove("active"));
      switchView("home-view");
      closeMobileSidebar();
    });
  }

  // የጎን አሞሌ ሊንኮች
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      document
        .querySelectorAll(".sidebar-item")
        .forEach((i) => i.classList.remove("active"));
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

  // የሞባይል መቆጣጠሪያዎች
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("sidebarOverlay").classList.add("active");
  });

  document
    .getElementById("sidebarOverlay")
    .addEventListener("click", closeMobileSidebar);

  // ገጽታ መቀያየሪያ ቁልፎች
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

  // የፎርሞች መዝጋቢ
  document
    .getElementById("instructorRegForm")
    .addEventListener("submit", handleInstructorReg);

  document
    .getElementById("batchLimitSelect")
    .addEventListener("change", (e) => {
      state.batchTarget = parseInt(e.target.value);
      state.batchCount = 0;
      updateBatchUI();
    });

  document
    .getElementById("attendanceInstructorSelect")
    .addEventListener("change", (e) => {
      state.currentAttendanceInstructor = e.target.value;
      renderAttendanceMatrix();
    });

  // ሁሉንም መጣ በል (Mark All Present)
  const btnMarkAll = document.getElementById("btnMarkAllPresent");
  if (btnMarkAll) {
    btnMarkAll.addEventListener("click", markAllStudentsPresent);
  }

  // ተማሪ ማጣሪያ
  const filterSelect = document.getElementById("studentInstructorFilter");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      renderStudentTable();
    });
  }

  // ሪፖርት ማጣሪያ
  const previewFilter = document.getElementById("previewInstructorFilter");
  if (previewFilter) {
    previewFilter.addEventListener("change", () => {
      renderMasterReportPreview();
    });
  }

  document
    .getElementById("btnDownloadPdf")
    .addEventListener("click", executePdfGeneration);

  // የአክሽን ፖፕአፕ ክሊክ ማስተናገጃዎች
  document
    .getElementById("btnDropdownDelete")
    .addEventListener("click", executeContextDeletion);
  document
    .getElementById("btnDropdownUpdate")
    .addEventListener("click", triggerContextUpdate);
}

function closeMobileSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("sidebarOverlay").classList.remove("active");
}

function switchView(viewId) {
  document
    .querySelectorAll(".app-view")
    .forEach((v) => v.classList.remove("active"));
  const activeView = document.getElementById(viewId);
  if (activeView) activeView.classList.add("active");

  renderView(viewId);

  if (viewId === "attendance-view") {
    setTimeout(scrollToCurrentMonthColumn, 300);
  }
}

function renderView(viewId) {
  // Lazy Render: Rebuild only the view currently shown
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
  showAlert("ቅንብሮች ተቀምጠዋል", "ትምህርት የሌለባቸው የሳምንት ቀናት ተ更新ዝረዋል።");

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

  if (
    savedVal &&
    (savedVal === "all" || state.instructors.find((i) => i.id === savedVal))
  ) {
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

  if (
    savedVal &&
    (savedVal === "all" || state.instructors.find((i) => i.id === savedVal))
  ) {
    filterSelect.value = savedVal;
  } else {
    filterSelect.value = "all";
  }
}

