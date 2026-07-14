// -------------------------------------------------------------
// 6. ማስተር ሪፖርት እና ፒዲኤፍ ሞዱል (Master Report & PDF Generator)
// -------------------------------------------------------------

function getAttendanceStatus(stdId, year, monthIdx, dayIdx) {
  const key = `${stdId}_${year}_${monthIdx}_${dayIdx}`;
  const legacyKey = `${stdId}_${monthIdx}_${dayIdx}`;
  return state.attendance[key] || state.attendance[legacyKey] || "";
}

function waitForPdfPaint() {
  const fontsReady =
    document.fonts && document.fonts.ready
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();

  return fontsReady.then(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
}

async function createPdfCaptureElement(source, width) {
  const element = source.cloneNode(true);
  element.classList.add("pdf-exporting");
  element.setAttribute("aria-hidden", "true");
  element.style.display = "block";
  element.style.width = width;
  element.style.maxWidth = "none";
  element.style.background = "#ffffff";
  element.style.borderRadius = "0";
  element.style.position = "absolute";
  element.style.left = "0";
  element.style.top = "0";
  element.style.zIndex = "2147483647";
  element.style.opacity = "1";
  element.style.pointerEvents = "none";
  element.style.margin = "0";

  document.body.appendChild(element);
  await waitForPdfPaint();
  return element;
}

function getPdfCanvasOptions(element) {
  return {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  };
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

    const ROWS_PER_PAGE = 32;
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
                <div style="margin-bottom:12px; display: flex; justify-content: space-between;">
                    <h3>ኡስታዛ፦ ${ins.firstName} ${ins.lastName}</h3>
                    <h1>ኢብኑ ዑመር መድረሳ</h1>
                    <h3>${monthName + " " + year + " ዓ.ል"}</h3>
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

async function executePdfGeneration() {
  renderMasterReportPreview();

  const source = document.getElementById("pdfExportWrapper");
  if (!source) return;

  source.classList.add("pdf-exporting");

  const year = state.selectedYear;
  const monthName = monthsEthiopic[state.selectedMonth];

  const opt = {
    margin: 0,
    filename: `Ibnu_Oumar_${monthName}_${year}_Attendance_Report.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: {
      scale: getPdfScale(),
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      logging: true,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(source).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    source.classList.remove("pdf-exporting");
  }
}

// Warning PDF (students absent 3+ days)
function renderWarningReportPreview() {
  const container = document.getElementById("warningPdfExportWrapper");
  if (!container) return;
  container.innerHTML = "";

  const year = state.selectedYear;
  const monthIdx = state.selectedMonth;
  const monthName = monthsEthiopic[monthIdx];

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

  // Build consolidated warning report (one report, multiple instructor sections)
  const instructorBlocks = [];
  state.instructors.forEach((ins) => {
    const warningStudents = state.students.filter(
      (s) => s.instructorId === ins.id && (absentMap[s.id] || 0) >= 3,
    );
    if (warningStudents.length === 0) return;

    let rowsHtml = "";
    warningStudents.forEach((std, idx) => {
      rowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td class="student-name">${std.firstName} ${std.lastName}</td>
          <td style="font-weight: 700; color: #dc2626;">${absentMap[std.id]} ቀን</td>
        </tr>
      `;
    });

    instructorBlocks.push(`
      <div class="pdf-instructor-block">
        <div class="pdf-instructor-header">
          <span class="pdf-instructor-label">ኡስታዛ፦</span>
          <span class="pdf-instructor-name">${ins.firstName} ${ins.lastName}</span>
        </div>
        <table class="pdf-warning-table pdf-warning-table-compact">
          <thead>
            <tr>
              <th style="width: 12%;">ተ.ቁ</th>
              <th style="width: 58%;">የተማሪ ስም</th>
              <th style="width: 30%;">የቀሩበት ቀን</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `);
  });

  if (instructorBlocks.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); padding:30px; text-align:center; font-family:var(--font);">ለዚህ ወር 3 ቀን ወይም ከዚያ በላይ የቀረ ተማሪ የለም።</div>`;
    return;
  }

  const todayStr = getTodayDisplayString();

  const page = document.createElement("div");
  page.className = "pdf-page-portrait";
  page.innerHTML = `
    <div class="pdf-report-inner">
      <div>
        <div class="pdf-official-header">
          <h1>ኢብኑ ዑመር መድረሳ</h1>
          <p class="subtitle">IBNU OUMER MEDRESA</p>
        </div>

        <div class="pdf-meta-grid">
          <div>
            <span class="label">የሪፖርት ዓይነት፦</span>
            <span class="value">የቀሪ ማስጠንቀቂያ ጠቅላላ ሪፖርት</span>
          </div>
          <div>
            <span class="label">የሪፖርት ወር፦</span>
            <span class="value">${monthName} ${year} ዓ.ል</span>
          </div>
          <div>
            <span class="label">የተዘጋጀበት ቀን፦</span>
            <span class="value">${todayStr}</span>
          </div>
        </div>

        <h3 class="pdf-section-title">ከ3 ቀን በላይ የቀሩ ተማሪዎች (በኡስታዛ መደብ)</h3>

        ${instructorBlocks.join("")}

        <div class="pdf-policy-box">
          <h4>⚠️ ማሳሰቢያ</h4>
          <p>
            እኒህ ከላይ ስማቸው የተዘረዘሩ ተማሪዎች በወርሃ ${monthName} ${year} ዓ.ል 3 ቀንና ከዚያ በላይ ሳያስፈቅዱ
            ማለትም የቀሩበትን ምክንያት ከመቅረታቸው በፊት ለሚመለከተው አካል ሳያሳውቁ የቀሩ ስለሆኑ፤
            ኢብኑ ዑመር መድረሳ ከ3 ቀን በላይ በቀሩ ተማሪዎች ላይ ያስቀመጠው ህግ (መባረር/ማስጠንቀቂያ)
            በቀጥታ የሚመለከታቸው ይሆናል። ህጉም በሚመለከታቸው አካላት አማካኝነት የሚፈፀም ይሆናል።
          </p>
        </div>
      </div>

      <p class="pdf-footer-note">— ኢብኑ ዑመር መድረሳ ወርሃዊ የቀሪ ሪፖርት —</p>
    </div>
  `;

  container.appendChild(page);
}

async function executeWarningPdfGeneration() {
  renderWarningReportPreview();

  const source = document.getElementById("warningPdfExportWrapper");
  if (!source) return;

  source.classList.add("pdf-exporting");

  const year = state.selectedYear;
  const monthName = monthsEthiopic[state.selectedMonth];

  const opt = {
    margin: 0,
    filename: `Warning_Report_${monthName}_${year}.pdf`,
    image: { type: "png", quality: 0.98 },
    html2canvas: {
      // Higher scale makes text crisper in the exported PDF
      scale: Math.max(1.5, getPdfScale()),
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      letterRendering: true,
      logging: true,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(source).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    source.classList.remove("pdf-exporting");
  }
}
