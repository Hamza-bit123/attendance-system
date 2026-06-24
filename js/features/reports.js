// -------------------------------------------------------------
// 6. ማስተር ሪፖርት እና ፒዲኤፍ ሞዱል (Master Report & PDF Generator)
// -------------------------------------------------------------

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

  const todayGC = new Date();
  const todayEC = toEthiopian(
    todayGC.getFullYear(),
    todayGC.getMonth() + 1,
    todayGC.getDate(),
  );
  const isTodayMonth = CURRENT_MONTH_INDEX === todayEC[1] - 1;
  const currentDay = todayEC[2];

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
      page.className = "pdf-page-wrapper";

      let rowsHtml = "";
      studentSlice.forEach((std, sIdx) => {
        const overallIdx = pageIdx * ROWS_PER_PAGE + sIdx;
        let cells = `<td>${overallIdx + 1}</td><td>${std.firstName} ${std.lastName}</td>`;

        for (let d = 0; d < DAYS_IN_MONTH; d++) {
          const key = `${std.id}_${CURRENT_MONTH_INDEX}_${d}`;
          const status = state.attendance[key] || "";
          const dayNumber = d + 1;
          const isInactive = isInactiveDay(dayNumber);
          const isMissed = isMissedUncheckedDay(
            dayNumber,
            status,
            isTodayMonth,
            currentDay,
          );
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
      for (let d = 1; d <= DAYS_IN_MONTH; d++) {
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
                
                <div style="margin-bottom:12px; display: flex; justify-content: space-between;">
                    <h3>ኡስታዛ፦ ${ins.firstName} ${ins.lastName}</h3>
                    <h1>ኢብኑ ዑመር መድረሳ</h1>
                    <h3>${monthsEthiopic[CURRENT_MONTH_INDEX] + " " + getFullDate()[2] + ", " + getFullDate()[0] + " ዓ.ል"}</h3>
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

  const opt = {
    margin: 0,
    filename: `Ibnu_Oumar_Attendance_Report.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  // Export from a fresh clone so the saved PDF matches the current preview.
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .finally(() => {
      element.remove();
    });
}
