// -------------------------------------------------------------
// 4. አክሽን ፖፕአፕ ሞዱል (Action Dropdown Deck System)
// -------------------------------------------------------------
function openActionDropdown(e, type, id) {
  e.stopPropagation();
  state.activeContext = { type: type, id: id };
  const menu = document.getElementById("actionDropdownDeck");
  menu.classList.add("show");

  // የፖፕአፑን አቀማመጥ ከተጫንበት ቁልፍ አጠገብ ማድረግ
  const rect = e.target.getBoundingClientRect();
  menu.style.top = rect.top + window.scrollY + "px";
  menu.style.left = rect.left + window.scrollX - 140 + "px";
}

async function executeContextDeletion() {
  if (!state.activeContext) return;
  const ctx = state.activeContext;

  let title = "ማረጋገጫ";
  let msg = "እርግጠኛ ነዎት መሰረዝ ይፈልጋሉ?";

  if (ctx.type === "instructor") {
    const ins = state.instructors.find((i) => i.id === ctx.id);
    const name = ins ? `ኡስታዛ ${ins.firstName} ${ins.lastName}` : "ኡስታዛ";
    title = "የኡስታዛ መረጃ መሰረዣ";
    msg = `"${name}"ን በቋሚነት ለመሰረዝ እርግጠኛ ነዎት?`;
  } else if (ctx.type === "student") {
    const std = state.students.find((s) => s.id === ctx.id);
    const name = std ? `${std.firstName} ${std.lastName}` : "ተማሪ";
    title = "የተማሪ መረጃ መሰረዣ";
    msg = `ተማሪ "${name}"ን በቋሚነት ለመሰረዝ እርግጠኛ ነዎት?`;
  }

  const confirmed = await showConfirm(title, msg);
  if (!confirmed) return;

  if (ctx.type === "instructor") {
    state.instructors = state.instructors.filter((i) => i.id !== ctx.id);
    // ተማሪዎችን ወደ አልተመደበ መቀየር
    state.students.forEach((s) => {
      if (s.instructorId === ctx.id) s.instructorId = "";
    });
  } else if (ctx.type === "student") {
    state.students = state.students.filter((s) => s.id !== ctx.id);
    // የመገኘት ታሪክ መሰረዝ
    Object.keys(state.attendance).forEach((key) => {
      if (key.startsWith(ctx.id + "_")) delete state.attendance[key];
    });
  }
  saveState();

  // Re-render only the active view
  const activeViewEl = document.querySelector(".app-view.active");
  if (activeViewEl) {
    renderView(activeViewEl.id);
  }
}

function triggerContextUpdate() {
  if (!state.activeContext) return;
  const ctx = state.activeContext;

  if (ctx.type === "instructor") {
    state.editingInstructorId = ctx.id;
    state.editingStudentId = null;
    switchView("instructor-reg-view");
  } else if (ctx.type === "student") {
    state.editingStudentId = ctx.id;
    state.editingInstructorId = null;
    switchView("student-reg-view");
  }
}

function showInactiveDayAlert(dayNumber) {
  showAlert("ማሳሰቢያ", getInactiveTooltip(dayNumber));
}

function showFutureDayAlert() {
  showAlert("ማሳሰቢያ", "ይህ ቀን ገና ያልደረሰ በመሆኑ መገኘት መቆጣጠር አይቻልም።");
}
