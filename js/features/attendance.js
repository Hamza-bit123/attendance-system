// -------------------------------------------------------------
// 5. ዕለታዊ መገኘት ማትሪክስ ሰሌዳ (Attendance Matrix Engine)
// -------------------------------------------------------------
function renderAttendanceMatrix() {
  const container = document.getElementById("attendanceMatrixContainer");
  if (!state.currentAttendanceInstructor) {
    container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:30px;">ምንም የተመደበ ኡስታዛ የለም።</div>`;
    return;
  }

  const targetStudents = state.students.filter(
    (s) => s.instructorId === state.currentAttendanceInstructor,
  );
  if (targetStudents.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:30px;">በዚህ ኡስታዛ ስር የተመዘገበ ተማሪ የለም።</div>`;
    return;
  }

  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const isTodayMonth = CURRENT_MONTH_INDEX === todayEC[1] - 1;
  const currentDay = todayEC[2];

  let tableHtml = `<table class="app-table attendance-matrix"><thead><tr><th style="width:50px;">ተ.ቁ</th><th>ተማሪ ሙሉ ስም</th>`;
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const isToday = isTodayMonth && d === currentDay;
    const isInactive = isInactiveDay(d);
    const isFuture = !isInactive && isTodayMonth && d > currentDay;
    const dayName = getDayNameShort(d);
    tableHtml += `<th class="${isToday ? "current-day-col" : ""} ${isInactive ? "inactive-day-col" : ""} ${isFuture ? "future-day-col" : ""}">
            <div class="day-header-container">
                <span class="day-name">${dayName}</span>
                <div class="day-header-circle">${d < 10 ? "0" + d : d}</div>
            </div>
        </th>`;
  }
  tableHtml += `</tr></thead><tbody>`;

  targetStudents.forEach((std, idx) => {
    tableHtml += `<tr>
            <td>${idx + 1}</td>
            <td><strong>${std.firstName} ${std.lastName}</strong></td>`;
    for (let d = 0; d < DAYS_IN_MONTH; d++) {
      const dayNumber = d + 1;
      const isToday = isTodayMonth && dayNumber === currentDay;
      const isInactive = isInactiveDay(dayNumber);
      const isFuture = !isInactive && isTodayMonth && dayNumber > currentDay;
      const key = `${std.id}_${CURRENT_MONTH_INDEX}_${d}`;
      const currentStatus = state.attendance[key] || "";
      const isMissed = isMissedUncheckedDay(
        dayNumber,
        currentStatus,
        isTodayMonth,
        currentDay,
      );
      let bubbleClass = "attendance-bubble ";
      let displaySymbol = "";

      if (currentStatus === "✓") {
        bubbleClass += "state-present";
        displaySymbol = "✓";
      } else if (currentStatus === "X") {
        bubbleClass += "state-absent";
        displaySymbol = "✕";
      } else if (currentStatus === "Ref") {
        bubbleClass += "state-permission";
        displaySymbol = "ፍ";
      } else if (isMissed) {
        bubbleClass += "state-missed";
        displaySymbol = "!";
      } else {
        bubbleClass += "state-empty";
      }

      if (isInactive) {
        bubbleClass += "state-inactive";
        const tooltipText = getInactiveTooltip(dayNumber);
        tableHtml += `<td class="attendance-cell inactive-day-col"><div class="${bubbleClass}" title="${tooltipText}" onclick="showInactiveDayAlert(${dayNumber})">${displaySymbol}</div></td>`;
      } else if (isFuture) {
        bubbleClass += "state-future";
        const tooltipText = "ይህ ቀን ገና ያልደረሰ በመሆኑ መገኘት መቆጣጠር አይቻልም።";
        tableHtml += `<td class="attendance-cell future-day-col"><div class="${bubbleClass}" title="${tooltipText}" onclick="showFutureDayAlert()">${displaySymbol}</div></td>`;
      } else {
        const tooltipText = isMissed
          ? "Attendance has not been checked for this past day."
          : "";
        tableHtml += `<td class="attendance-cell ${isToday ? "current-day-col" : ""} ${isMissed ? "missed-day-col" : ""}"><div class="${bubbleClass}" title="${tooltipText}" onclick="cycleAttendanceState(this, '${std.id}', ${d})">${displaySymbol}</div></td>`;
      }
    }
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table>`;
  container.innerHTML = tableHtml;
}

function cycleAttendanceState(bubbleElement, stdId, dayIdx) {
  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const isTodayMonth = CURRENT_MONTH_INDEX === todayEC[1] - 1;
  const currentDay = todayEC[2];

  if (isInactiveDay(dayIdx + 1)) {
    return; // Disable clicking inactive days
  }
  if (isTodayMonth && dayIdx + 1 > currentDay) {
    return; // Disable clicking future days
  }

  const key = `${stdId}_${CURRENT_MONTH_INDEX}_${dayIdx}`;
  const current = state.attendance[key] || "";
  let newStatus;

  if (current === "") {
    newStatus = "✓";
  } else if (current === "✓") {
    newStatus = "X";
  } else if (current === "X") {
    newStatus = "Ref"; // ፍቃድ
  } else {
    newStatus = "";
  }

  if (newStatus === "") {
    delete state.attendance[key];
  } else {
    state.attendance[key] = newStatus;
  }
  saveState();

  // update cell bubble in DOM immediately
  bubbleElement.className = "attendance-bubble ";
  let displaySymbol = "";

  if (newStatus === "✓") {
    bubbleElement.className += "state-present";
    displaySymbol = "✓";
  } else if (newStatus === "X") {
    bubbleElement.className += "state-absent";
    displaySymbol = "✕";
  } else if (newStatus === "Ref") {
    bubbleElement.className += "state-permission";
    displaySymbol = "ፍ";
  } else if (
    isMissedUncheckedDay(dayIdx + 1, newStatus, isTodayMonth, currentDay)
  ) {
    bubbleElement.className += "state-missed";
    displaySymbol = "!";
  } else {
    bubbleElement.className += "state-empty";
  }
  if (bubbleElement.parentElement) {
    bubbleElement.parentElement.classList.toggle(
      "missed-day-col",
      displaySymbol === "!",
    );
  }
  bubbleElement.innerText = displaySymbol;
}

async function markAllStudentsPresent() {
  if (!state.currentAttendanceInstructor) return;
  const targetStudents = state.students.filter(
    (s) => s.instructorId === state.currentAttendanceInstructor,
  );
  if (targetStudents.length === 0) return;

  const confirmed = await showConfirm(
    "ሁሉንም መጣ በል",
    "በዚህ ኡስታዛ ስር ያሉትን ሁሉንም ተማሪዎች ለዛሬ 'መጣ' (✓) ለማለት እርግጠኛ ነዎት?",
  );
  if (!confirmed) return;

  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const currentDay = todayEC[2];
  const dayIdx = currentDay - 1;

  if (isInactiveDay(currentDay)) {
    showInactiveDayAlert(currentDay);
    return;
  }

  targetStudents.forEach((std) => {
    const key = `${std.id}_${CURRENT_MONTH_INDEX}_${dayIdx}`;
    state.attendance[key] = "✓";
  });
  saveState();
  renderAttendanceMatrix();
}

function scrollToCurrentMonthColumn() {
  const container = document.getElementById("attendanceMatrixContainer");
  if (container) {
    const todayHeader = container.querySelector(".current-day-col");
    if (todayHeader) {
      todayHeader.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    } else {
      container.scrollLeft = 0;
    }
  }
}
