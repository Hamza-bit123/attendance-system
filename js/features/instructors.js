// -------------------------------------------------------------
// 2. የኡስታዛቶች ሞዱል አሠራር (Instructor Engine)
// -------------------------------------------------------------
function handleInstructorReg(e) {
  e.preventDefault();
  const firstName = document.getElementById("insFirstName").value.trim();
  const lastName = document.getElementById("insLastName").value.trim();
  const phone = document.getElementById("insPhone").value.trim();

  if (state.editingInstructorId) {
    const ins = state.instructors.find(
      (i) => i.id === state.editingInstructorId,
    );
    if (ins) {
      ins.firstName = firstName;
      ins.lastName = lastName;
      ins.phone = phone;
    }
    state.editingInstructorId = null;
    saveState();
    document.getElementById("instructorRegForm").reset();
    document.getElementById("insLastName").value = "Unknown";
    switchView("instructor-manage-view");
  } else {
    const ins = {
      id: "ins_" + Date.now(),
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    };
    state.instructors.push(ins);
    saveState();
    document.getElementById("instructorRegForm").reset();
    document.getElementById("insLastName").value = "Unknown";
    switchView("instructor-manage-view");
  }
}

function prepareInstructorForm() {
  const header = document.getElementById("instructorRegHeader");
  const submitBtn = document.getElementById("btnInstructorSubmit");
  const cancelBtn = document.getElementById("btnInstructorCancel");

  if (state.editingInstructorId) {
    const ins = state.instructors.find(
      (i) => i.id === state.editingInstructorId,
    );
    if (ins) {
      if (header) header.innerText = "የኡስታዛ መረጃ ማሻሻያ ፎርም";
      if (submitBtn) submitBtn.innerText = "መረጃ አሻሽል";
      if (cancelBtn) cancelBtn.style.display = "inline-flex";

      document.getElementById("insFirstName").value = ins.firstName;
      document.getElementById("insLastName").value = ins.lastName;
      document.getElementById("insPhone").value = ins.phone;
    }
  } else {
    if (header) header.innerText = "አዲስ ኡስታዛ መመዝገቢያ ፎርም";
    if (submitBtn) submitBtn.innerText = "ኡስታዛ መዝግብ";
    if (cancelBtn) cancelBtn.style.display = "none";

    document.getElementById("instructorRegForm").reset();
    document.getElementById("insLastName").value = "Unknown";
  }
}

function cancelInstructorEdit() {
  state.editingInstructorId = null;
  document.getElementById("instructorRegForm").reset();
  document.getElementById("insLastName").value = "Unknown";
  switchView("instructor-manage-view");
}

function renderInstructorTable() {
  const tbody = document.getElementById("instructorTableBody");
  tbody.innerHTML = "";
  if (state.instructors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted); padding:30px;">ምንም የተመዘገበ ኡስታዛ የለም።</td></tr>`;
    return;
  }
  let tableHtml = "";
  state.instructors.forEach((ins, idx) => {
    tableHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>ኡስታዛ ${ins.firstName} ${ins.lastName}</strong></td>
                <td>${ins.phone}</td>
                <td class="action-cell">
                    <button class="dots-btn" onclick="openActionDropdown(event, 'instructor', '${ins.id}')">⋮</button>
                </td>
            </tr>
        `;
  });
  tbody.innerHTML = tableHtml;
}

// -------------------------------------------------------------
