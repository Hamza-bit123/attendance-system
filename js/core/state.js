// -------------------------------------------------------------
// ማስተር ስቴት ሞተር (System Master State Engine)
// -------------------------------------------------------------
const windows1252ByteMap = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function getWindows1252Byte(char) {
  const code = char.codePointAt(0);
  if (code <= 0xff) return code;
  return windows1252ByteMap[code];
}

function scoreReadableText(text) {
  const ethiopicAndArabic = text.match(/[\u1200-\u137f\u0600-\u06ff]/gu) || [];
  const expectedSymbols = text.match(/[✓✕☰📖📊📥👥✨🌙☀]/gu) || [];
  const corruptMarkers = text.match(/[áâãÃðØÙœŸ€šŽ]/g) || [];
  return ethiopicAndArabic.length * 3 + expectedSymbols.length * 2 - corruptMarkers.length;
}

function repairMojibakeSegment(text) {
  const bytes = [];

  for (const char of text) {
    const byte = getWindows1252Byte(char);
    if (byte === undefined) return text;
    bytes.push(byte);
  }

  const repaired = new TextDecoder("utf-8", { fatal: false }).decode(
    new Uint8Array(bytes),
  );
  return scoreReadableText(repaired) > scoreReadableText(text) ? repaired : text;
}

function repairMojibakeText(text) {
  let repaired = "";
  let segment = "";

  const flushSegment = () => {
    if (!segment) return;
    repaired += repairMojibakeSegment(segment);
    segment = "";
  };

  for (const char of text) {
    if (getWindows1252Byte(char) === undefined) {
      flushSegment();
      repaired += char;
    } else {
      segment += char;
    }
  }

  flushSegment();
  return repaired;
}

function repairStoredValue(value) {
  if (typeof value === "string") return repairMojibakeText(value);
  if (Array.isArray(value)) return value.map(repairStoredValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, repairStoredValue(entry)]),
    );
  }
  return value;
}

function loadStoredData(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    const repaired = repairStoredValue(parsed);
    const repairedJson = JSON.stringify(repaired);

    if (repairedJson !== raw) {
      localStorage.setItem(key, repairedJson);
    }

    return repaired;
  } catch (error) {
    console.warn(`Unable to parse ${key} from localStorage`, error);
    return fallback;
  }
}

let state = {
  instructors: loadStoredData("medresa_ins", []),
  students: loadStoredData("medresa_std", []),
  attendance: loadStoredData("medresa_att", {}), // Key: stdId_monthIdx_dayIdx -> '✓', 'X', 'ፍ'
  batchActive: false,
  batchTarget: 1,
  batchCount: 0,
  activeContext: null, // { type: 'instructor'/'student', id: '...' }
  currentAttendanceInstructor: "",
  editingInstructorId: null,
  editingStudentId: null,
  noClassDays: getSavedNoClassDays(),
};

// -------------------------------------------------------------
// የኩስተም ፖፕአፕ ረዳቶች (Custom Dialog Helpers)
// -------------------------------------------------------------
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const bodyEl = document.getElementById("customModalBody");
    const closeBtn = document.getElementById("btnCustomModalClose");
    const cancelBtn = document.getElementById("btnCustomModalCancel");
    const confirmBtn = document.getElementById("btnCustomModalConfirm");

    titleEl.innerText = title;
    bodyEl.innerText = message;
    cancelBtn.style.display = "inline-flex";
    cancelBtn.innerText = "አይ ተወው";
    confirmBtn.innerText = "አዎ";

    modal.classList.add("show");

    const cleanup = (value) => {
      modal.classList.remove("show");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      closeBtn.onclick = null;
      modal.onclick = null;
      resolve(value);
    };

    confirmBtn.onclick = () => cleanup(true);
    cancelBtn.onclick = () => cleanup(false);
    closeBtn.onclick = () => cleanup(false);
    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup(false);
      }
    };
  });
}

function showAlert(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("customModalTitle");
    const bodyEl = document.getElementById("customModalBody");
    const closeBtn = document.getElementById("btnCustomModalClose");
    const cancelBtn = document.getElementById("btnCustomModalCancel");
    const confirmBtn = document.getElementById("btnCustomModalConfirm");

    titleEl.innerText = title;
    bodyEl.innerText = message;
    cancelBtn.style.display = "none";
    confirmBtn.innerText = "እሺ";

    modal.classList.add("show");

    const cleanup = () => {
      modal.classList.remove("show");
      confirmBtn.onclick = null;
      closeBtn.onclick = null;
      modal.onclick = null;
      resolve();
    };

    confirmBtn.onclick = cleanup;
    closeBtn.onclick = cleanup;
    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup();
      }
    };
  });
}

// -------------------------------------------------------------
// መነሻ ዳታ ማፍሰሻ (Seed Data Injector Injection)
// -------------------------------------------------------------
const seedData = [
  {
    ins: "ጀሚላ ሁሴን",
    stds: [
      "ሙርሺዳ ሙጂብ",
      "አሊማ ያሲን",
      "ሙሪዳ አህመድ",
      "ዘህራ ሙሃመድ",
      "ሶፊያ ሙሃመድ",
      "ካሚላ ሙሃመድ",
      "ሲቲ ሙሃመድ",
      "ኸይሪያ ሙሃመድ",
      "ሰሚራ ናስር",
      "ኢክራም ሙስጠፋ",
      "ሀቢባ አወል",
      "አመቱላህ ከማል",
      "ኢክራም ሙሃመድ",
      "ዘህራ አሊ",
      "ፈቲያ ኸይረዲን",
      "ሙኒራ ጭቅሳ",
      "ሀምዚያ ኑርሃሰን",
      "ነዒማ አደም",
      "ኢክራም ሙሃመድ",
      "ሙና ሊግቢቾ",
      "ሰሚራ ገብሬ",
      "አለይካ ቡሴር",
      "ፈቲያ ቡሴር",
      "ሀምዲያ ጀማል",
      "ዘኪያ ያሲን",
      "ሳረት ሸረፋ",
      "ሀያት ያሲን",
      "ሰፊነሽ ነጋሽ",
      "ዘህራ አህመድ",
      "ነዒማ አደም",
      "ኢክራም ሙሃመድ",
      "ጀሚላ ተማም",
      "ዘኪያ ያሲን",
      "ፈቲያ ሁሴን",
      "ዴቶ ሃሰን",
      "ረውዳ ሃሰን",
      "ነጂባ ሪድዋን",
      "ሰኪና ሪድዋን",
      "ካሚላ መካ",
      "ዚያዳ ዘበርጋ",
      "ቀመሪያ ሁምዳለ",
      "ሃያት ሸረፋ",
      "ሃምዲያ ጀማል",
      "ሰሚራ ናስር",
      "ፈቲያ አህመድ",
      "ኸድጃ አህመድ",
      "ኸድጃ መለስ",
      "ሃናን ሙሃመድ",
      "ካሚላ ፋሪስ",
      "ለይላ ሙሃመድ",
      "ዘቢባ አወል",
      "ሃያት ኑርሁሴን",
    ],
  },
  {
    ins: "ዘይባ ኸይረዲን",
    stds: [
      "ረምዚያ አደም",
      "ሀፍሳ ሙሃመድ",
      "ሀቢባ ሱልጣን",
      "አምሪያ ኡስማን",
      "ሀሊማ ኸድር",
      "ሰሚራ ቾምቤ",
      "ለይላ ሁሴን",
      "መህቡባ ጀማል",
      "ኢክራም ሳዲቅ",
      "ራህመት ኸይሩ",
      "ሰሚራ የሱፍ",
      "ሰውዳ ሙስጠፋ",
      "ለይላ ግርማ",
      "ፋይዛ እንዳለ",
      "ሰኪና አህመድ",
      "ሀያት አወል",
      "ለይላ ያሲን",
      "መኪያ ከማል",
      "ፈኪሃ አክመል",
      "ጀሚላ ኡስማን",
    ],
  },
  {
    ins: "ሸምሲያ Unknown",
    stds: [
      "አይሻ አብራር",
      "ዘቢባ ጠይብ",
      "መህዲያ ሸውሞሎ",
      "ሩቅያ ሙሰማ",
      "ፈዲላ ረዲ",
      "ረምላ ረዲ",
      "ሃቢባ አደም",
      "ፊርደውስ ቃሲም",
      "ነጂባ ናስር",
      "ሂክማ አ/ፈታ",
      "ፋጢማ ረዲ",
      "ሽምሲያ ሙሃመድ",
      "ሃዋ ኑሪ",
      "ሃናን ኑረዲን",
      "አሚና ሃምዛ",
    ],
  },
  {
    ins: "ሰኒያ ሁሴን",
    stds: [
      "መህቡባ መሃመድ",
      "ተሚማ መሃመድ",
      "መህቡባ ሽኩር",
      "ሃዲያ ድሌ",
      "አለይካ ፈድሉ",
      "ሰአዳ አወል",
      "መዲና አብደላህ",
      "ሃይሪያ ናስር",
      "ሁስኒያ ሃሰን",
      "አሚና ከድር",
      "ፋጤ አህመድ",
      "ሹክሪያ አ/ሃሊቅ",
      "ሂክማ መሃመድ",
      "ዘኪያ መሃመድ",
      "ዛይዳ ጀማል",
      "ኢክራም ከድር",
      "ዘይቱ ተማም",
      "ረሂማ በደዊ",
      "ሶፊያ ኑርሰቦ",
    ],
  },
  {
    ins: "ሙኒራ ሙሃመድ",
    stds: [
      "ዘይቱና አብዱ",
      "ረሂሙሽ ውድማ",
      "አመቱላህ ሙሃመድ",
      "አይሻ ተማም",
      "ሙሃባ ኸድር",
      "ረውዳ ሳኒ",
      "አልፊያ ዘይኔ",
      "ሉባባ በድሩ",
      "ባምሪካ ሙኒር",
      "ነጃት ኸድር",
      "ሩቂያ ሰዒድ",
      "አጃይባ ሁላላ",
      "ፈቲያ ከማል",
      "ረውዳ ተማም",
      "መህቡባ ሙሃመድ",
      "ኸድጃ ሙሃመድ",
      "አይሻ ኑርሰማ",
    ],
  },
  {
    ins: "ሃያት ያሲን",
    stds: [
      "ቀመሪያ ጠሃ",
      "ፈዲላ ሀሰን",
      "መህቡባ ወርቂቾ",
      "ሰኒያ ሻሚል",
      "ረህማ ኸድር",
      "ፈቲያ ሙዘሚል",
      "ዘይነባ ሙህዲን",
      "ዘይነባ ያሲን",
      "ራቢያ ኸድር",
      "ኢክራም ተማም",
      "ለይላ ሙዴ",
      "አሚና አብዱሰመድ",
      "ነዒማ ሙሃመድ",
      "ረሂማ ሙሃመድ",
      "አሚና ሀይደር",
      "ረሂማ አብዱልካፍ",
      "ሂክማ ሱልጣን",
      "አይሻ ኸሊፋ",
      "አቢዳ ኸሊል",
      "ፈዲላ",
      "ሰኪና ኸድር",
      "ኸድጃ ያሲን",
      "ረውዳ ኑሪ",
    ],
  },
  {
    ins: "ኢህሳን ከማል",
    stds: [
      "ፋጡማ ኡመር",
      "አስማ መሃመድ",
      "ሙኒራ ዳበራ",
      "ወርቅነሽ ከድር",
      "ለይላ መሃመድ",
      "አልሃም ቀድሩ",
      "አሽረቃ ሸምሱ",
      "ኑርያ ስሩር",
      "ሰአዳ ሙባረክ",
      "መህዲያ አሊ",
      "ኑሪያ ኢሳ",
      "ዘህራ ሙስጠፋ",
      "ኢህሳን ሃይዴ",
      "ሹክሪያ ኑረዲን",
      "ሃድራ ኸይረዲን",
      "መኪያ ከድር",
      "ራህማ ነስሬ",
      "ሰኒያ ሻሚል",
      "ዘይቱና ሰማን",
      "ሙሪዳ መኑር",
      "ሃያት ነስሬ",
      "ረሂማ ዩሱፍ",
      "ረሂሙሽ አክመል",
    ],
  },
];

function checkAndSeedDatabase() {
  if (state.instructors.length === 0 && state.students.length === 0) {
    seedData.forEach((item, idx) => {
      const parts = item.ins.split(" ");
      const insId =
        "ins_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      state.instructors.push({
        id: insId,
        firstName: parts[0],
        lastName: parts[1] || "Unknown",
        phone: "091100000" + idx,
      });

      item.stds.forEach((sName) => {
        const sParts = sName.split(" ");
        const stdId =
          "std_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        state.students.push({
          id: stdId,
          firstName: sParts[0],
          lastName: sParts[1] || "Unknown",
          instructorId: insId,
          phone: "-",
        });
      });
    });
    saveState();
  }
}

function saveState() {
  localStorage.setItem("medresa_ins", JSON.stringify(state.instructors));
  localStorage.setItem("medresa_std", JSON.stringify(state.students));
  localStorage.setItem("medresa_att", JSON.stringify(state.attendance));
}

