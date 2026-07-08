// -------------------------------------------------------------
// 6. ማስተር ሪፖርት እና ፒዲኤፍ ሞዱል (Master Report & PDF Generator)
// -------------------------------------------------------------

function getAttendanceStatus(stdId, year, monthIdx, dayIdx) {
  const key = `${stdId}_${year}_${monthIdx}_${dayIdx}`;
  const legacyKey = `${stdId}_${monthIdx}_${dayIdx}`;
  return state.attendance[key] || state.attendance[legacyKey] || "";
}

function renderMasterReportPreview() {
  const container = document.getElementById("pdfExportWrapper");
  container.innerHTML = "";

  if (state.students.length === 0) {
    container.innerHTML = `<div style="color:black; padding:30px; text-align:center; font-family:var(--font);">ሪፖርት ለማመንጨት ተማሪዎች መመዝገብ አለባቸው።</div>`;
    return;
  }

  const filterVal = document.getElementById("previewInstructorFilter").value;
  let targetInstructors = state.instructors;
  if (filterVal !== "all") {
    targetInstructors = state.instructors.filter((ins) => ins.id === filterVal);
  }

  const year = state.selectedYear;
  const monthIdx = state.selectedMonth; // 0-indexed
  const daysInMonth = getDaysInECMonth(year, monthIdx);
  const monthName = monthsEthiopic[monthIdx];

  let pagesRendered = 0;

  targetInstructors.forEach((ins) => {
    const myStudents = state.students.filter((s) => s.instructorId === ins.id);
    if (myStudents.length === 0) return;

    const ROWS_PER_PAGE = 30;
    const totalPages = Math.ceil(myStudents.length / ROWS_PER_PAGE);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const studentSlice = myStudents.slice(
        pageIdx * ROWS_PER_PAGE,
        (pageIdx + 1) * ROWS_PER_PAGE,
      );

      const page = document.createElement("div");
      page.className = "pdf-page-wrapper landscape-page";

      let rowsHtml = "";
      studentSlice.forEach((std, sIdx) => {
        const overallIdx = pageIdx * ROWS_PER_PAGE + sIdx;
        let cells = `<td>${overallIdx + 1}</td><td>${std.firstName} ${std.lastName}</td>`;

        for (let d = 0; d < daysInMonth; d++) {
          const status = getAttendanceStatus(std.id, year, monthIdx, d);
          const dayNumber = d + 1;
          const isInactive = isInactiveDay(dayNumber);
          const isMissed = isMissedUncheckedDay(dayNumber, status);

          const inactiveStyle = isInactive
            ? "background-color: #e2e8f0; color: #64748b; background-image: repeating-linear-gradient(135deg, rgba(100,116,139,.2) 0, rgba(100,116,139,.2) 1px, transparent 1px, transparent 5px);"
            : "";
          const missedStyle =
            !isInactive && isMissed
              ? "background:#fee2e2; color:#dc2626; font-weight:bold;"
              : "";

          if (status === "✓") {
            cells += `<td style="color:#059669; font-weight:500; ${inactiveStyle}">✓</td>`;
          } else if (status === "X") {
            cells += `<td style="background:#fee2e2; color:#dc2626; font-weight:bold; ${inactiveStyle}">✕</td>`;
          } else if (status === "Ref") {
            cells += `<td style="background:#fef3c7; color:#d97706; font-weight:bold; ${inactiveStyle}">ፍ</td>`;
          } else if (isMissed) {
            cells += `<td style="${missedStyle}">!</td>`;
          } else {
            cells += `<td style="${inactiveStyle}"></td>`;
          }
        }

        rowsHtml += `<tr>${cells}</tr>`;
      });

      let dayHeaders = "";
      for (let d = 1; d <= daysInMonth; d++) {
        const verticalHtml = getDayNameShort(d);
        const isInactive = isInactiveDay(d);
        const inactiveStyle = isInactive
          ? "background: #e2e8f0 !important; opacity: 0.72; color:#64748b !important;"
          : "";
        dayHeaders += `<th style="width:18px; padding:2px 0 !important; font-size:8px !important; font-weight:normal; line-height:1.15; ${inactiveStyle}">
                    <div style="font-size:7px; color:#475569; margin-bottom:2px; font-weight:bold;">${verticalHtml}</div>
                    <div style="border-top:1px solid #cbd5e1; padding-top:2px; font-weight:bold;">${d}</div>
                </th>`;
      }

      page.innerHTML = `
                <div style="margin-bottom:12px; display: block; justify-content: space-between;">
                    <h3>ኡስታዛ፦ ${ins.firstName} ${ins.lastName}</h3>
                    <h1>ኢብኑ ዑመር መድረሳ</h1>
                    <h3>${monthName + " " + year + " ዓ.ም"}</h3>
                </div>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th style="width:20px;">ተ.ቁ</th>
                            <th style="width:70px; text-align:left;">ሙሉ ስም</th>
                            ${dayHeaders}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <div class="pdf-footer" style="position: absolute; bottom: 8mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; font-family: var(--font);">
                    <span>ኢብኑ ዑመር መድረሳ</span>
                    <span>ገጽ ${pageIdx + 1} ከ ${totalPages}</span>
                </div>
            `;
      container.appendChild(page);
      pagesRendered++;
    }
  });

  if (pagesRendered === 0) {
    container.innerHTML = `<div style="color:black; padding:30px; text-align:center;">ምንም መረጃ የለም።</div>`;
  }
}

function executePdfGeneration() {
  renderMasterReportPreview();

  const source = document.getElementById("pdfExportWrapper");
  const element = source.cloneNode(true);
  element.classList.add("pdf-exporting");
  element.style.display = "block";
  element.style.width = "297mm";
  element.style.background = "#ffffff";
  element.style.borderRadius = "0";
  element.style.position = "fixed";
  element.style.left = "-10000px";
  element.style.top = "0";
  element.style.zIndex = "-1";
  document.body.appendChild(element);

  const year = state.selectedYear;
  const monthName = monthsEthiopic[state.selectedMonth];

  const opt = {
    margin: 0,
    filename: `Ibnu_Oumar_${monthName}_${year}_Attendance_Report.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .finally(() => {
      element.remove();
    });
}

// Warning PDF (students absent 3+ days)
function renderWarningReportPreview() {
  const container = document.getElementById("warningPdfExportWrapper");
  if (!container) return;
  container.innerHTML = "";

  const year = state.selectedYear;
  const monthIdx = state.selectedMonth;
  const monthName = monthsEthiopic[monthIdx];
  const daysInMonth = getDaysInECMonth(year, monthIdx);

  // Build absence count map for selected month
  let absentMap = {};
  state.students.forEach((s) => (absentMap[s.id] = 0));

  Object.keys(state.attendance).forEach((key) => {
    const status = state.attendance[key];
    if (status !== "X") return;
    const parts = key.split("_");
    if (parts.length >= 4) {
      const mIdx = parseInt(parts[parts.length - 2]);
      const yr = parseInt(parts[parts.length - 3]);
      if (!isNaN(yr) && yr >= 1000 && yr === year && mIdx === monthIdx) {
        const stdId = parts.slice(0, parts.length - 3).join("_");
        if (absentMap[stdId] !== undefined) absentMap[stdId]++;
        return;
      }
    }
    if (parts.length >= 3) {
      const mIdx = parseInt(parts[parts.length - 2]);
      if (mIdx === monthIdx) {
        const stdId = parts.slice(0, parts.length - 2).join("_");
        if (absentMap[stdId] !== undefined) absentMap[stdId]++;
      }
    }
  });

  // Group warning students by instructor
  let hasContent = false;
  state.instructors.forEach((ins) => {
    const warningStudents = state.students.filter(
      (s) => s.instructorId === ins.id && (absentMap[s.id] || 0) >= 3,
    );
    if (warningStudents.length === 0) return;
    hasContent = true;

    const page = document.createElement("div");
    page.className = "pdfMasterReport";

    let studentListHtml = "";
    warningStudents.forEach((std) => {
      studentListHtml += `<li>${std.firstName} ${std.lastName} ${absentMap[std.id]} ቀን</li>`;
    });

    page.innerHTML = `
      <div>
        <header style="color: rgb(78, 78, 78);">
          <h3 style="text-align: center; font-size: 16px; font-weight: 700; margin: 0 0 5px 0;">ኢብኑ ዑመር መድረሳ በወርሃ ${monthName} ከ3 ቀን በላይ የቀሩ ተማሪዎች</h3>
          <div class="horizontalLine"></div>
        </header>

        <main style="margin-top: 30px; display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 10px 0;">ኡስታዛ ${ins.firstName} ${ins.lastName}</h4>
            <ol style="margin: 15px 0px 0px 30px; line-height: 1.5; font-size: 14px;">
              ${studentListHtml}
            </ol>
          </div>
          <div>
            <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">ማሳሰቢያ</h4>
            <p style="line-height: 1.5; text-align: justify; margin: 0; font-size: 13.5px;">
              እኒህ ከላይ ስማቸው የተዘረዘሩ ተማሪዎች በወርሃ ${monthName} 3 ቀንና ከዚያ በላይ ሳያስፈቅዱ ማለትም የቀሩበትን ምክንያት ከመቅረታቸው በፊት ለሚመለከተው አካል ሳያሳውቁ የቀሩ ስለሆኑ፤ ኢብኑ ዑመር መድረሳ ከ3 ቀን በላይ በቀሩ ተማሪዎች ላይ ያስቀመጠው ህግ (መባረር) በቀጥታ የሚመለከታቸው ይሆናል።
              <br><br>
              ህጉም በሚመለከታቸው አካላት እማካኝነት የሚፈፀም ይሆናል።
            </p>
          </div>
        </main>
      </div>
      <footer style="margin: 20px 10px 10px 10px; font-style: italic; color: grey;">
        <div class="horizontalLine"></div>
        <p style="margin: 0; text-align: center;">ኢብኑ ዑመር መድረሳ ወርሃዊ ረፖርት</p>
      </footer>
    `;
    container.appendChild(page);
  });

  if (!hasContent) {
    container.innerHTML = `<div style="color:black; padding:30px; text-align:center; font-family:var(--font);">ለዚህ ወር 3 ቀን ወይም ከዚያ በላይ የቀረ ተማሪ የለም።</div>`;
  }
}

function executeWarningPdfGeneration() {
  renderWarningReportPreview();

  const source = document.getElementById("warningPdfExportWrapper");
  if (!source) return;
  const element = source.cloneNode(true);
  element.classList.add("pdf-exporting");
  element.style.display = "block";
  element.style.width = "210mm";
  element.style.background = "#ffffff";
  element.style.position = "fixed";
  element.style.left = "-10000px";
  element.style.top = "0";
  element.style.zIndex = "-1";
  document.body.appendChild(element);

  const year = state.selectedYear;
  const monthName = monthsEthiopic[state.selectedMonth];

  const opt = {
    margin: 0,
    filename: `Warning_Report_${monthName}_${year}.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .finally(() => {
      element.remove();
    });
}
