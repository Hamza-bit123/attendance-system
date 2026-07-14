// -------------------------------------------------------------
function updateBatchUI() {
  const indicator = document.getElementById("batchCounterIndicator");
  if (state.batchTarget > 1) {
    state.batchActive = true;
    indicator.innerText = `ባች ሞድ፦ ${state.batchCount + 1} ከ ${state.batchTarget}`;
  } else {
    state.batchActive = false;
    state.batchCount = 0;
    indicator.innerText = `ነጠላ ሞድ`;
  }
}

function renderStudentFormArea() {
  const container = document.getElementById("studentFormContainer");
  if (state.instructors.length === 0) {
    container.innerHTML = `
            <div class="alert-card">
                <p>⚠️ ተማሪ ከመመዝገብዎ በፊት ቢያንስ አንድ ኡስታዛ በሲስተሙ ላይ መመዝገብ ይኖርባታል።</p>
                <button class="btn btn-primary" onclick="switchView('instructor-reg-view')">🏃‍♂️ መጀመሪያ ኡስታዛ ለመመዝገብ እዚህ ይጫኑ</button>
            </div>
        `;
    return;
  }

  let insOptions = "";
  state.instructors.forEach((ins) => {
    insOptions += `<option value="${ins.id}">ኡስታዛ ${ins.firstName} ${ins.lastName}</option>`;
  });

  const isEditing = !!state.editingStudentId;
  const batchWrapper = document.getElementById("studentBatchControlWrapper");
  if (isEditing) {
    if (batchWrapper) batchWrapper.style.display = "none";
  } else {
    if (batchWrapper) batchWrapper.style.display = "flex";
  }

  let formTitle = isEditing ? "የተማሪ መረጃ ማሻሻያ ፎርም" : "የተማሪ መመዝገቢያ ፎርም";
  let submitBtnText = isEditing ? "መረጃ አሻሽል" : "ተማሪ መዝግብ";

  let std = null;
  if (isEditing) {
    std = state.students.find((s) => s.id === state.editingStudentId);
  }

  let phoneVal = std && std.phone && std.phone !== "-" ? std.phone : "";

  container.innerHTML = `
        <div class="card" style="max-width: 550px;">
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--text-main);">${formTitle}</h3>
            <form id="studentRegForm" onsubmit="handleStudentReg(event)">
                <div class="form-group">
                    <label>የተማሪ መጀመሪያ ስም *</label>
                    <input type="text" id="stdFirstName" class="form-control" required placeholder="ለምሳሌ፦ ሙርሺዳ" value="${std ? std.firstName : ""}">
                </div>
                <div class="form-group">
                    <label>የአባት ስም *</label>
                    <input type="text" id="stdLastName" class="form-control" required placeholder="ለምሳሌ፦ ሙጂብ" value="${std ? std.lastName : ""}">
                </div>
                <div class="form-group">
                    <label>የስልክ ቁጥር</label>
                    <input type="tel" id="stdPhone" class="form-control" placeholder="09..." value="${phoneVal}">
                </div>
                <div class="form-group">
                    <label>የሚከታተልበት ኡስታዛ *</label>
                    <select id="stdInstructorSelect" class="form-control" required>${insOptions}</select>
                </div>
                <div style="display:flex; gap:12px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;">${submitBtnText}</button>
                    <button type="button" id="btnSkipBatch" class="btn btn-secondary" style="display:none;" onclick="handleBatchSkip()">ለጊዜው ዝለል</button>
                    ${isEditing ? `<button type="button" class="btn btn-secondary" onclick="cancelStudentEdit()">ሰርዝ</button>` : ""}
                </div>
            </form>
        </div>
    `;

  if (std) {
    document.getElementById("stdInstructorSelect").value = std.instructorId;
  }

  if (state.batchActive && !isEditing) {
    document.getElementById("btnSkipBatch").style.display = "inline-flex";
  }
}

function handleStudentReg(e) {
  e.preventDefault();
  const firstName = document.getElementById("stdFirstName").value.trim();
  const lastName = document.getElementById("stdLastName").value.trim();
  const instructorId = document.getElementById("stdInstructorSelect").value;
  const phoneInput = document.getElementById("stdPhone");
  const phone = phoneInput ? phoneInput.value.trim() || "-" : "-";

  if (state.editingStudentId) {
    const std = state.students.find((s) => s.id === state.editingStudentId);
    if (std) {
      std.firstName = firstName;
      std.lastName = lastName;
      std.instructorId = instructorId;
      std.phone = phone;
    }
    state.editingStudentId = null;
    saveState();
    switchView("student-manage-view");
  } else {
    const std = {
      id: "std_" + Date.now() + "_" + Math.floor(Math.random() * 100),
      firstName: firstName,
      lastName: lastName,
      instructorId: instructorId,
      phone: phone,
    };

    state.students.push(std);
    saveState();

    if (state.batchActive) {
      state.batchCount++;
      if (state.batchCount >= state.batchTarget) {
        // የባች ምዝገባ ተጠናቋል
        state.batchActive = false;
        state.batchCount = 0;
        state.batchTarget = 1;
        document.getElementById("batchLimitSelect").value = "1";
        switchView("student-manage-view");
      } else {
        updateBatchUI();
        renderStudentFormArea();
        document.getElementById("stdFirstName").focus();
      }
    } else {
      switchView("student-manage-view");
    }
  }
}

function cancelStudentEdit() {
  state.editingStudentId = null;
  switchView("student-manage-view");
}

function handleBatchSkip() {
  if (state.batchActive) {
    state.batchCount++;
    if (state.batchCount >= state.batchTarget) {
      state.batchActive = false;
      state.batchCount = 0;
      state.batchTarget = 1;
      document.getElementById("batchLimitSelect").value = "1";
      switchView("student-manage-view");
    } else {
      updateBatchUI();
      renderStudentFormArea();
    }
  }
}

function renderStudentTable() {
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  const filterSelect = document.getElementById("studentInstructorFilter");
  const filterVal = filterSelect ? filterSelect.value : "all";

  let targetStudents = state.students;
  if (filterVal !== "all") {
    targetStudents = state.students.filter((s) => s.instructorId === filterVal);
  }

  if (targetStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); padding:30px;">ምንም የተመዘገበ ተማሪ የለም።</td></tr>`;
    return;
  }

  let tableHtml = "";
  targetStudents.forEach((std, idx) => {
    const ins = state.instructors.find((i) => i.id === std.instructorId);
    const insName = ins ? `ኡስታዛ ${ins.firstName} ${ins.lastName}` : "ያልተመደበ";
    const phoneNum = std.phone || "-";
    tableHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${std.firstName} ${std.lastName}</strong></td>
                <td>${phoneNum}</td>
                <td style="color:var(--accent); font-weight:500;">${insName}</td>
                <td class="action-cell">
                    <button class="dots-btn" onclick="openActionDropdown(event, 'student', '${std.id}')">⋮</button>
                </td>
            </tr>
        `;
  });
  tbody.innerHTML = tableHtml;
}

// Show student full details in a modal
function showStudentDetails(stdId) {
  const std = state.students.find((s) => s.id === stdId);
  if (!std) return;

  const ins = state.instructors.find((i) => i.id === std.instructorId);
  const insName = ins ? `ኡስታዛ ${ins.firstName} ${ins.lastName}` : "ያልተመደበ";
  const year = state.selectedYear;
  const monthIdx = state.selectedMonth;
  const monthName = monthsEthiopic[monthIdx];
  const daysInMonth = getDaysInECMonth(year, monthIdx);

  // Build attendance summary for selected month
  let presentCount = 0,
    absentCount = 0,
    permissionCount = 0,
    missedCount = 0;
  let dayRows = "";

  for (let d = 0; d < daysInMonth; d++) {
    const dayNumber = d + 1;
    const key = `${std.id}_${year}_${monthIdx}_${d}`;
    const legacyKey = `${std.id}_${monthIdx}_${d}`;
    const status = state.attendance[key] || state.attendance[legacyKey] || "";
    const isInactive = isInactiveDay(dayNumber);
    const isMissed = isMissedUncheckedDay(dayNumber, status);
    const isFuture = isFutureDay(dayNumber);
    const isToday = isTodayDay(dayNumber);
    const dayName = getDayNameShort(dayNumber);

    if (isInactive) continue; // skip no-class / before-open days

    let statusLabel = "",
      statusColor = "var(--text-muted)",
      bgColor = "";
    if (status === "✓") {
      statusLabel = "✓ መጣ";
      statusColor = "#10b981";
      presentCount++;
    } else if (status === "X") {
      statusLabel = "✕ ቀረ";
      statusColor = "#ef4444";
      bgColor = "rgba(239,68,68,0.08)";
      absentCount++;
    } else if (status === "Ref") {
      statusLabel = "ፍ ፍቃድ";
      statusColor = "#f59e0b";
      bgColor = "rgba(245,158,11,0.08)";
      permissionCount++;
    } else if (isMissed) {
      statusLabel = "! ሳይሞላ";
      statusColor = "#dc2626";
      bgColor = "rgba(239,68,68,0.05)";
      missedCount++;
    } else if (isFuture) {
      statusLabel = "— ያልደረሰ";
      statusColor = "var(--text-muted)";
    } else {
      statusLabel = "—";
      statusColor = "var(--text-muted)";
    }

    dayRows += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 12px; border-radius:8px; margin-bottom:4px; background:${bgColor || "transparent"}; border: 1px solid ${isToday ? "var(--primary)" : "transparent"};">
        <span style="font-size:13px; color:${isToday ? "var(--primary)" : "var(--text-main)"}; font-weight:${isToday ? "700" : "400"};">${monthName} ${dayNumber} — ${dayName}${isToday ? " (ዛሬ)" : ""}</span>
        <span style="font-size:12.5px; font-weight:600; color:${statusColor};">${statusLabel}</span>
      </div>`;
  }

  const modalTitle = document.getElementById("studentDetailsModalTitle");
  const modalBody = document.getElementById("studentDetailsModalBody");
  if (!modalTitle || !modalBody) return;

  modalTitle.textContent = `${std.firstName} ${std.lastName} — የቀሪ ዝርዝር`;
  modalBody.innerHTML = `
    <div style="margin-bottom:14px; padding:12px 14px; background:var(--primary-light); border-radius:var(--radius-sm); border:1px solid var(--primary-glow);">
      <div style="font-size:13px; margin-bottom:4px;"><strong>ኡስታዛ፦</strong> ${insName}</div>
      <div style="font-size:13px; margin-bottom:4px;"><strong>ወር፦</strong> ${monthName} ${year} ዓ.ል</div>
      <div style="font-size:13px;"><strong>ስልክ፦</strong> ${std.phone || "—"}</div>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
      <span style="padding:4px 12px; border-radius:20px; background:rgba(16,185,129,0.12); color:#10b981; font-size:12px; font-weight:600;">✓ ${presentCount} መጣ</span>
      <span style="padding:4px 12px; border-radius:20px; background:rgba(239,68,68,0.12); color:#ef4444; font-size:12px; font-weight:600;">✕ ${absentCount} ቀረ</span>
      <span style="padding:4px 12px; border-radius:20px; background:rgba(245,158,11,0.12); color:#f59e0b; font-size:12px; font-weight:600;">ፍ ${permissionCount} ፍቃድ</span>
      ${missedCount > 0 ? `<span style="padding:4px 12px; border-radius:20px; background:rgba(239,68,68,0.08); color:#dc2626; font-size:12px; font-weight:600;">! ${missedCount} ሳይሞላ</span>` : ""}
    </div>
    <div style="max-height:320px; overflow-y:auto;">
      ${dayRows || `<div style="color:var(--text-muted); text-align:center; padding:20px;">ምንም ሰሌዳ የለም።</div>`}
    </div>
  `;

  // Wire up FAB PDF button
  const fabBtn = document.getElementById("btnDownloadIndividualWarningPdf");
  if (fabBtn) {
    fabBtn.onclick = () => executeIndividualWarningPdf(stdId);
  }

  const modal = document.getElementById("studentDetailsModal");
  if (modal) modal.classList.add("show");
}

// Generate individual student revocation/warning PDF
async function executeIndividualWarningPdf(stdId) {
  const std = state.students.find((s) => s.id === stdId);
  if (!std) return;

  const ins = state.instructors.find((i) => i.id === std.instructorId);
  const insName = ins ? `ኡስታዛ ${ins.firstName} ${ins.lastName}` : "ያልተመደበ";
  const year = state.selectedYear;
  const monthIdx = state.selectedMonth;
  const monthName = monthsEthiopic[monthIdx];
  const daysInMonth = getDaysInECMonth(year, monthIdx);

  let absentDays = [];
  let absentCount = 0;
  for (let d = 0; d < daysInMonth; d++) {
    const key = `${std.id}_${year}_${monthIdx}_${d}`;
    const legacyKey = `${std.id}_${monthIdx}_${d}`;
    const status = state.attendance[key] || state.attendance[legacyKey] || "";
    if (status === "X") {
      absentDays.push(d + 1);
      absentCount++;
    }
  }
  const absentDaysStr = absentDays.join("፣ ");

  const element = document.createElement("div");
  element.className = "pdf-page-portrait";
  // Prevent clipping if content slightly overflows during canvas capture
  element.style.overflow = "visible";

  element.innerHTML = `
    <div class="pdf-letter-inner">
      <div>
        <div class="pdf-letter-header">
          <h1 style="font-size: 20px !important; font-weight: 800 !important; color: #064e3b !important; margin: 0 0 4px 0 !important; font-family: var(--font);">ኢብኑ ዑመር መድረሳ</h1>
          <p class="subtitle" style="font-size: 11px !important; color: #059669 !important; text-transform: uppercase; font-weight: 800; margin: 0; font-family: var(--font);">IBNU OUMER MEDRESA</p>
        </div>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="font-size: 15px; font-weight: 900; color: #065f46; letter-spacing: 0.2px; margin: 0; font-family: var(--font);">የቀሪ ማስጠንቀቂያ ደብዳቤ</h2>
        </div>

        <div class="pdf-meta-grid" style="background: #f0fdf4; border: 1px solid #bbf7d0; margin-bottom: 14px; font-size: 12.5px;">
          <div>
            <span class="label" style="color: #047857;">ቀን፦</span>
            <span class="value" style="color: #111827;">${getTodayDisplayString()}</span>
          </div>
          <div>
            <span class="label" style="color: #047857;">ለተማሪ፦</span>
            <span class="value" style="color: #111827;">${std.firstName} ${std.lastName}</span>
          </div>
          <div>
            <span class="label" style="color: #047857;">ኡስታዛ፦</span>
            <span class="value" style="color: #111827;">${insName}</span>
          </div>
          <div>
            <span class="label" style="color: #047857;">የቀሪ ብዛት፦</span>
            <span class="value" style="color: #065f46; font-weight: 900;">${absentCount} ቀን</span>
          </div>
        </div>

        <div style="margin-bottom: 12px; line-height: 1.65; font-size: 12.5px; text-align: justify; color: #374151; font-family: var(--font);">
          <p style="margin: 0 0 10px 0;">
            በመድረሳው የቀሪ መቆጣጠሪያ መረጃ መሠረት፤ ተማሪ <strong>${std.firstName} ${std.lastName}</strong> በወርሃ <strong>${monthName} ${year} ዓ.ል</strong>
            ያለፈቃድ <strong style="color:#dc2626;">${absentCount} ቀን</strong> ቀርተሻል።
            ${absentDays.length > 0 ? `የቀረሽባቸው ቀናትም ${monthName} ( <strong>${absentDaysStr})</strong> ናቸው።` : ""}
          </p>
          <p style="margin: 0;">
            ይህንን የቀሪ ሁኔታ መድረሳው ካስቀመጠው ደንብ (ከ3 ቀን በላይ ያለፈቃድ መቅረት) ጋር በማዛመድ፤ ተማሪ ${std.firstName} ${std.lastName} 
            <strong style="color:#065f46;">ከመድረሳ በቋሚነት ተሰናብተሻል</strong> እና ከዛሬ ጀምሮ በመድረሳው የትምህርት ፕሮግራም መቀጠል አትችዪም።
          </p>
        </div>

        <div style="padding:10px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #059669; border-radius:6px; font-size:12px; color:#065f46; line-height:1.55;">
          <strong>ማስታወቂያ፦</strong> ይህ ደብዳቤ የመድረሳው ውሳኔ መግለጫ ነው።
        </div>
      </div>

      <div>
        <div style="margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 22px;">
          <div style="text-align:center;">
            <div style="font-size:11px; font-weight:900; color:#065f46; margin-bottom:6px;">የተማሪ ስምምነት ፊርማ</div>
            <div class="pdf-signature-line" style="border-bottom-color:#059669;"></div>
            <div style="margin-top:6px; font-size:11px; font-weight:700; color:#111827;">ተማሪ፦ ${std.firstName} ${std.lastName}</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:11px; font-weight:900; color:#065f46; margin-bottom:6px;">የኮሚቴ ውሳኔ ፊርማ</div>
            <div class="pdf-signature-line" style="border-bottom-color:#059669;"></div>
            <div style="margin-top:6px; font-size:11px; font-weight:700; color:#111827;">የመድረሳው አስተዳደር ኮሚቴ</div>
          </div>
        </div>
        <p style="margin: 25px 0 0 0; text-align: center; font-size: 10px; color: #9ca3af; font-family: var(--font); font-style: italic;">
          — ኢብኑ ዑመር መድረሳ የቀሪ ማስጠንቀቂያ ደብዳቤ —
        </p>
      </div>
    </div>
  `;

  // Position the element absolute behind the main app content to let browser lay it out, invisible to user
  element.style.position = "absolute";
  element.style.left = "0";
  element.style.top = "0";
  element.style.width = "210mm";
  element.style.zIndex = "-9999";
  element.style.opacity = "1";
  element.style.pointerEvents = "none";
  element.style.background = "#ffffff";
  element.style.margin = "0";

  document.body.appendChild(element);

  // Wait for rendering
  await waitForPdfPaint();

  const opt = {
    margin: 0,
    filename: `Warning_${std.firstName}_${std.lastName}_${monthName}_${year}.pdf`,
    image: { type: "png", quality: 1.0 },
    html2canvas: {
      scale: Math.max(1.5, getPdfScale()),
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      letterRendering: true,
      logging: true,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    element.remove();
  }
}
