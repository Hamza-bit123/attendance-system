// -------------------------------------------------------------
// 1. ዳሽቦርድ ሞዱል ቀመሮች (Dashboard Metrics Engine)
// -------------------------------------------------------------
function renderDashboard() {
  document.getElementById("cardTotalStudents").innerText =
    state.students.length;
  document.getElementById("lblAbsent1").innerText =
    `በ ወርሃ ${monthsEthiopic[CURRENT_MONTH_INDEX]} 1 ቀን የቀሩ ተማሪዎች ብዛት`;
  document.getElementById("lblAbsent2").innerText =
    `በ ወርሃ ${monthsEthiopic[CURRENT_MONTH_INDEX]} 2 ቀን የቀሩ ተማሪዎች ብዛት`;
  document.getElementById("lblAbsent3").innerText =
    `በ ወርሃ ${monthsEthiopic[CURRENT_MONTH_INDEX]} 3 ቀን የቀሩ ተማሪዎች ብዛት`;

  let absentMap = {}; // stdId -> count
  state.students.forEach((s) => (absentMap[s.id] = 0));

  // FIX: Parsing composite student IDs correctly by splitting from the right side of the attendance key
  Object.keys(state.attendance).forEach((key) => {
    const lastUnderscore = key.lastIndexOf("_");
    if (lastUnderscore !== -1) {
      const secondLastUnderscore = key.lastIndexOf("_", lastUnderscore - 1);
      if (secondLastUnderscore !== -1) {
        const stdId = key.substring(0, secondLastUnderscore);
        const mIdx = parseInt(
          key.substring(secondLastUnderscore + 1, lastUnderscore),
        );
        const status = state.attendance[key];

        if (
          mIdx === CURRENT_MONTH_INDEX &&
          status === "X" &&
          absentMap[stdId] !== undefined
        ) {
          absentMap[stdId]++;
        }
      }
    }
  });

  let c1 = 0,
    c2 = 0,
    c3 = 0;
  let criticalStudents = [];

  state.students.forEach((s) => {
    const count = absentMap[s.id] || 0;
    if (count === 1) c1++;
    else if (count === 2) c2++;
    else if (count >= 3) {
      c3++;
      criticalStudents.push({
        name: `${s.firstName} ${s.lastName}`,
        count: count,
      });
    }
  });

  document.getElementById("cardAbsent1").innerText = c1;
  document.getElementById("cardAbsent2").innerText = c2;
  document.getElementById("cardAbsent3").innerText = c3;

  // የአስጊ ተማሪዎች ዝርዝር ማሳያ (3 ቀን የቀሩ)
  const listContainer = document.getElementById("dashCriticalAbsentList");
  listContainer.innerHTML = "";
  if (criticalStudents.length === 0) {
    listContainer.innerHTML = `<div style="color:var(--text-muted); font-size:12.5px; text-align:center; padding-top:20px;">በዚህ ወር አስጊ ተማሪ የለም።</div>`;
  } else {
    let listHtml = "";
    criticalStudents.forEach((cs, idx) => {
      listHtml += `
                <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(120,120,120,0.1); align-items:center;">
                    <span style="font-weight:600;">${idx + 1}. ⚠️ ${cs.name}</span>
                    <span class="batch-badge" style="background:var(--danger-bg); color:var(--danger); font-size:11px;">${cs.count} ቀናት</span>
                </div>
            `;
    });
    listContainer.innerHTML = listHtml;
  }

  // የባር ቻርት ግንባታ በኡስታዛቶች መሠረት (Bar Chart Config)
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

