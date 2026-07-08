// -------------------------------------------------------------
// 1. ዳሽቦርድ ሞዱል ቀመሮች (Dashboard Metrics Engine)
// -------------------------------------------------------------
function renderDashboard() {
  const year = state.selectedYear;
  const monthIdx = state.selectedMonth; // 0-indexed
  const monthName = monthsEthiopic[monthIdx];

  document.getElementById("cardTotalStudents").innerText = state.students.length;
  document.getElementById("lblAbsent1").innerText =
    `በ ወርሃ ${monthName} 1 ቀን የቀሩ ተማሪዎች ብዛት`;
  document.getElementById("lblAbsent2").innerText =
    `በ ወርሃ ${monthName} 2 ቀን የቀሩ ተማሪዎች ብዛት`;
  document.getElementById("lblAbsent3").innerText =
    `በ ወርሃ ${monthName} 3 ቀን የቀሩ ተማሪዎች ብዛት`;

  // Build absence map for selected year/month
  let absentMap = {};
  state.students.forEach((s) => (absentMap[s.id] = 0));

  Object.keys(state.attendance).forEach((key) => {
    const status = state.attendance[key];
    if (status !== "X") return;

    const parts = key.split("_");
    // New format: stdId_year_monthIdx_dayIdx (stdId may contain underscores)
    // Try to parse from right
    if (parts.length >= 4) {
      const dayIdx = parseInt(parts[parts.length - 1]);
      const mIdx = parseInt(parts[parts.length - 2]);
      const yr = parseInt(parts[parts.length - 3]);

      if (!isNaN(yr) && yr >= 1000) {
        // New format
        if (yr === year && mIdx === monthIdx) {
          const stdId = parts.slice(0, parts.length - 3).join("_");
          if (absentMap[stdId] !== undefined) absentMap[stdId]++;
        }
        return;
      }
    }
    // Legacy format: stdId_monthIdx_dayIdx
    if (parts.length >= 3) {
      const mIdx = parseInt(parts[parts.length - 2]);
      if (mIdx === monthIdx) {
        const stdId = parts.slice(0, parts.length - 2).join("_");
        if (absentMap[stdId] !== undefined) absentMap[stdId]++;
      }
    }
  });

  let c1 = 0, c2 = 0, c3 = 0;
  let criticalStudents = [];

  state.students.forEach((s) => {
    const count = absentMap[s.id] || 0;
    if (count === 1) c1++;
    else if (count === 2) c2++;
    else if (count >= 3) {
      c3++;
      criticalStudents.push({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        count: count,
      });
    }
  });

  document.getElementById("cardAbsent1").innerText = c1;
  document.getElementById("cardAbsent2").innerText = c2;
  document.getElementById("cardAbsent3").innerText = c3;

  // Critical students list (3+ days absent)
  const listContainer = document.getElementById("dashCriticalAbsentList");
  listContainer.innerHTML = "";
  if (criticalStudents.length === 0) {
    listContainer.innerHTML = `<div style="color:var(--text-muted); font-size:12.5px; text-align:center; padding-top:20px;">በዚህ ወር አስጊ ተማሪ የለም።</div>`;
  } else {
    let listHtml = "";
    criticalStudents.forEach((cs, idx) => {
      listHtml += `
                <div onclick="showStudentDetails('${cs.id}')" style="display:flex; justify-content:space-between; padding:10px 12px; border-bottom:1px solid rgba(120,120,120,0.1); align-items:center; cursor:pointer; transition:var(--transition); border-radius:var(--radius-sm);" class="critical-student-row">
                    <span style="font-weight:600;">${idx + 1}. ⚠️ ${cs.name}</span>
                    <span class="batch-badge" style="background:var(--danger-bg); color:var(--danger); font-size:11px;">${cs.count} ቀናት</span>
                </div>
            `;
    });
    listContainer.innerHTML = listHtml;
  }

  // Bar chart by instructor
  const chartContainer = document.getElementById("barChartContainer");
  chartContainer.innerHTML = "";

  if (state.instructors.length === 0) {
    chartContainer.innerHTML = `<div style="color:var(--text-muted); text-align:center; width:100%;">ምንም መረጃ የለም</div>`;
    return;
  }

  let maxAbsentsFoundInGroup = 1;
  let insMetrics = state.instructors.map((ins) => {
    let totalGroupAbsents = 0;
    const myStudents = state.students.filter((s) => s.instructorId === ins.id);
    myStudents.forEach((s) => {
      totalGroupAbsents += absentMap[s.id] || 0;
    });
    if (totalGroupAbsents > maxAbsentsFoundInGroup)
      maxAbsentsFoundInGroup = totalGroupAbsents;
    return { name: ins.firstName, total: totalGroupAbsents };
  });

  let chartHtml = "";
  insMetrics.forEach((metric) => {
    const heightPercentage = Math.min(
      100,
      Math.max(10, (metric.total / maxAbsentsFoundInGroup) * 100),
    );
    chartHtml += `
            <div class="bar-wrapper">
                <div class="bar-fill" style="height:${heightPercentage}%;">
                    <div class="bar-value">${metric.total}</div>
                </div>
                <div class="bar-label" title="ኡስታዛ ${metric.name}">${metric.name}</div>
            </div>
        `;
  });
  chartContainer.innerHTML = chartHtml;
}
