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

