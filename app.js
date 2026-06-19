// -------------------------------------------------------------
// የኢትዮጵያ ካላንደር መዋቅር መቼቶች (E.C Calendar Variables)
// -------------------------------------------------------------
const monthsEthiopic = ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ"];

// ለቀመር ማቅለያ የአሁኑን ወር "ሰኔ" (Index 9) እናደርገዋለን
const CURRENT_MONTH_INDEX = 9; 
const DAYS_IN_MONTH = 30;

// -------------------------------------------------------------
// የካላንደር መለወጫ ረዳት ፈንክሽኖች (Calendar Converter Helpers)
// -------------------------------------------------------------
function startDayOfEthiopian(year) {
    const newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
    return (year - 1) % 4 === 3 ? newYearDay + 1 : newYearDay;
}

function toGregorian(year, month, date) {
    const newYearDay = startDayOfEthiopian(year);
    let gregorianYear = year + 7;
    let gregorianMonths = [0.0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30];
    const nextYear = gregorianYear + 1;
    if ((nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0) {
        gregorianMonths[6] = 29;
    }
    let until = (month - 1) * 30.0 + date;
    if (until <= 37 && year <= 1575) {
        until += 28;
        gregorianMonths[0] = 31;
    } else {
        until += newYearDay - 1;
    }
    if ((year - 1) % 4 === 3) {
        until += 1;
    }
    let m = 0;
    let gregorianDate;
    for (let i = 0; i < gregorianMonths.length; i++) {
        if (until <= gregorianMonths[i]) {
            m = i;
            gregorianDate = until;
            break;
        } else {
            m = i;
            until -= gregorianMonths[i];
        }
    }
    if (m > 4) {
        gregorianYear += 1;
    }
    const order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const gregorianMonth = order[m];
    return [gregorianYear, gregorianMonth, gregorianDate];
}

function toEthiopian(year, month, date) {
    let gregorianMonths = [0.0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let ethiopianMonths = [0.0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30];
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        gregorianMonths[2] = 29;
    }
    let ethiopianYear = year - 8;
    if (ethiopianYear % 4 === 3) {
        ethiopianMonths[10] = 6;
    }
    const newYearDay = startDayOfEthiopian(year - 8);
    let until = 0;
    for (let i = 1; i < month; i++) {
        until += gregorianMonths[i];
    }
    until += date;
    let tahissas = ethiopianYear % 4 === 0 ? 26 : 25;
    if (year < 1582) {
        ethiopianMonths[1] = 0;
        ethiopianMonths[2] = tahissas;
    } else if (until <= 277 && year === 1582) {
        ethiopianMonths[1] = 0;
        ethiopianMonths[2] = tahissas;
    } else {
        tahissas = newYearDay - 3;
        ethiopianMonths[1] = tahissas;
    }
    let m;
    let ethiopianDate;
    for (m = 1; m < ethiopianMonths.length; m++) {
        if (until <= ethiopianMonths[m]) {
            ethiopianDate = m === 1 || ethiopianMonths[m] === 0 ? until + (30 - tahissas) : until;
            break;
        } else {
            until -= ethiopianMonths[m];
        }
    }
    if (m > 10) {
        ethiopianYear += 1;
    }
    const order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
    const ethiopianMonth = order[m];
    return [ethiopianYear, ethiopianMonth, ethiopianDate];
}

function getCurrentEthiopianDay() {
    const todayGC = new Date();
    const todayEC = toEthiopian(todayGC.getFullYear(), todayGC.getMonth() + 1, todayGC.getDate());
    return todayEC[2];
}

function getDayNameShort(d) {
    const todayGC = new Date();
    const todayEC = toEthiopian(todayGC.getFullYear(), todayGC.getMonth() + 1, todayGC.getDate());
    const ethYear = todayEC[0];
    const ethMonth = CURRENT_MONTH_INDEX + 1; // Sene is 10
    const gregDateParts = toGregorian(ethYear, ethMonth, d);
    const dateGC = new Date(gregDateParts[0], gregDateParts[1] - 1, gregDateParts[2]);
    const dayNamesAmharic = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];
    return dayNamesAmharic[dateGC.getDay()];
}

function getDayLetter(d) {
    const todayGC = new Date();
    const todayEC = toEthiopian(todayGC.getFullYear(), todayGC.getMonth() + 1, todayGC.getDate());
    const ethYear = todayEC[0];
    const ethMonth = CURRENT_MONTH_INDEX + 1;
    const gregDateParts = toGregorian(ethYear, ethMonth, d);
    const dateGC = new Date(gregDateParts[0], gregDateParts[1] - 1, gregDateParts[2]);
    const dayLettersAmharic = ["እ", "ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ"];
    return dayLettersAmharic[dateGC.getDay()];
}

function getDayVerticalHtml(d) {
    const name = getDayNameShort(d); // e.g. "ማክሰኞ"
    return name.split("").join("<br>");
}

// -------------------------------------------------------------
// ማስተር ስቴት ሞተር (System Master State Engine)
// -------------------------------------------------------------
let state = {
    instructors: JSON.parse(localStorage.getItem('medresa_ins')) || [],
    students: JSON.parse(localStorage.getItem('medresa_std')) || [],
    attendance: JSON.parse(localStorage.getItem('medresa_att')) || {}, // Key: stdId_monthIdx_dayIdx -> '✓', 'X', 'ፍ'
    batchActive: false,
    batchTarget: 1,
    batchCount: 0,
    activeContext: null, // { type: 'instructor'/'student', id: '...' }
    currentAttendanceInstructor: ''
};

// -------------------------------------------------------------
// መነሻ ዳታ ማፍሰሻ (Seed Data Injector Injection)
// -------------------------------------------------------------
const seedData = [
    { ins: "ጀሚላ ሁሴን", stds: ["ሙርሺዳ ሙጂብ","አሊማ ያሲን","ሙሪዳ አህመድ","ዘህራ ሙሃመድ","ሶፊያ ሙሃመድ","ካሚላ ሙሃመድ","ሲቲ ሙሃመድ","ኸይሪያ ሙሃመድ","ሰሚራ ናስር","ኢክራም ሙስጠፋ","ሀቢባ አወል","አመቱላህ ከማል","ኢክራም ሙሃመድ","ዘህራ አሊ","ፈቲያ ኸይረዲን","ሙኒራ ጭቅሳ","ሀምዚያ ኑርሃሰን","ነዒማ አደም","ኢክራም ሙሃመድ","ሙና 利ግቢቾ","ሰሚራ ገብሬ","አለይካ ቡሴር","ፈቲያ ቡሴር","ሀምዲያ ጀማል","ዘኪያ ያሲን","ሳረት ሸረፋ","ሀያት ያሲን","ሰፊነሽ ነጋሽ","ዘህራ አህመድ","ነዒማ አደም","ኢክራም ሙሃመድ","ጀሚላ ተማም","ዘኪያ ያሲን","ፈቲያ ሁሴን","ዴቶ ሃሰን","ረውዳ ሃሰን","ነጂባ ሪድዋን","ሰኪና ሪድዋን","ካሚላ መካ","ዚያዳ ዘበርጋ","ቀመሪያ ሁምዳለ","ሃያት ሸረፋ","ሃምዲያ ጀማል","ሰሚራ ናስር","ፈቲያ አህመድ","ኸድጃ አህመድ","ኸድጃ መለስ","ሃናን ሙሃመድ","ካሚላ ፋሪስ","ለይላ ሙሃመድ","ዘቢባ አወል","ሃያት ኑርሁሴን"] },
    { ins: "ዘይባ ኸይረዲን", stds: ["ረምዚያ አደም","ሀፍሳ ሙሃመድ","ሀቢባ ሱልጣን","አምሪያ ኡስማን","ሀሊማ ኸድር","ሰሚራ ቾምቤ","ለይላ ሁሴን","መህቡባ ጀማል","ኢክራም ሳዲቅ","ራህመት ኸይሩ","ሰሚራ የሱፍ","ሰውዳ ሙስጠፋ","ለይላ ግርማ","ፋይዛ እንዳለ","ሰኪና አህመድ","ሀያት አወል","ለይላ ያሲን","መኪያ ከማል","ፈኪሃ አክመል","ጀሚላ ኡስማን"] },
    { ins: "ሸምሲያ Unknown", stds: ["አይሻ አብራር","ዘቢባ ጠይብ","መህዲያ ሸውሞሎ","ሩቅያ ሙሰማ","ፈዲላ ረዲ","ረምላ ረዲ","ሃቢባ አደም","ፊርደውስ ቃሲም","ነጂባ ናስር","ሂክማ አ/ፈታ","ፋጢማ ረዲ","ሽምሲያ ሙሃመድ","ሃዋ ኑሪ","ሃናን ኑረዲን","አሚና ሃምዛ"] },
    { ins: "ሰኒያ ሁሴን", stds: ["መህቡባ መሃመድ","ተሚማ መሃመድ","መህቡባ ሽኩር","ሃዲያ ድሌ","አለይካ ፈድሉ","ሰአዳ አወል","መዲና አብደላህ","ሃይሪያ ናስር","ሁስኒያ ሃሰን","አሚና ከድር","ፋጤ አህመድ","ሹክሪያ አ/ሃሊቅ","ሂክማ መሃመድ","ዘኪያ መሃመድ","ዛይዳ ጀማል","ኢክራም ከድር","ዘይቱ ተማም","ረሂማ በደዊ","ሶፊያ ኑርሰቦ"] },
    { ins: "ሙኒራ ሙሃመድ", stds: ["ዘይቱና አብዱ","ረሂሙሽ ውድማ","አመቱላህ ሙሃመድ","አይሻ ተማም","ሙሃባ ኸድር","ረውዳ ሳኒ","አልፊያ ዘይኔ","ሉባባ በድሩ","ባምሪካ ሙኒር","ነጃት ኸድር","ሩቂያ ሰዒድ","አጃይባ ሁላላ","ፈቲያ ከማል","ረውዳ ተማም","መህቡባ ሙሃመድ","ኸድጃ ሙሃመድ","አይሻ ኑርሰማ"] },
    { ins: "ሃያት ያሲን", stds: ["ቀመሪያ ጠሃ","ፈዲላ ሀሰን","መህቡባ ወርቂቾ","ሰኒያ ሻሚል","ረህማ ኸድር","ፈቲያ ሙዘሚል","ዘይነባ ሙህዲን","ዘይነባ ያሲን","ራቢያ ኸድር","ኢክራም ተማም","ለይላ ሙዴ","አሚና አብዱሰመድ","ነዒማ ሙሃመድ","ረሂማ ሙሃመድ","አሚና ሀይደር","ረሂማ አብዱልካፍ","ሂክማ ሱልጣን","አይሻ ኸሊፋ","አቢዳ ኸሊል","ፈዲላ","ሰኪና ኸድር","ኸድጃ ያሲን","ረውዳ ኑሪ"] },
    { ins: "ኢህሳን ከማል", stds: ["ፋጡማ ኡመር","አስማ መሃመድ","ሙኒራ ዳበራ","ወርቅነሽ ከድር","ለይላ መሃመድ","አልሃም ቀድሩ","አሽረቃ ሸምሱ","ኑርያ ስሩር","ሰአዳ ሙባረክ","መህዲያ አሊ","ኑሪያ ኢሳ","ዘህራ ሙስጠፋ","ኢህሳን ሃይዴ","ሹክሪያ ኑረዲን","ሃድራ ኸይረዲን","መኪያ ከድር","ራህማ ነስሬ","ሰኒያ ሻሚል","ዘይቱና ሰማን","ሙሪዳ መኑር","ሃያት ነስሬ","ረሂማ ዩሱፍ","ረሂሙሽ አክመል"] }
];

function checkAndSeedDatabase() {
    if (state.instructors.length === 0 && state.students.length === 0) {
        seedData.forEach((item, idx) => {
            const parts = item.ins.split(" ");
            const insId = "ins_" + Date.now() + "_" + Math.floor(Math.random()*1000);
            state.instructors.push({
                id: insId,
                firstName: parts[0],
                lastName: parts[1] || "Unknown",
                phone: "091100000" + idx
            });

            item.stds.forEach(sName => {
                const sParts = sName.split(" ");
                const stdId = "std_" + Date.now() + "_" + Math.floor(Math.random()*10000);
                state.students.push({
                    id: stdId,
                    firstName: sParts[0],
                    lastName: sParts[1] || "Unknown",
                    instructorId: insId
                });

                // መነሻ የመቅረት ታሪክ በሰኔ ወር (ዘፈቀደ ለመለማመጃ እንዲሆን)
                const randomAbsents = Math.floor(Math.random() * 4); // 0, 1, 2, 3 ቀናት መቅረት
                let setDays = new Set();
                while(setDays.size < randomAbsents) {
                    setDays.add(Math.floor(Math.random() * DAYS_IN_MONTH));
                }
                setDays.forEach(day => {
                    state.attendance[`${stdId}_${CURRENT_MONTH_INDEX}_${day}`] = 'X';
                });
            });
        });
        saveState();
    }
}

function saveState() {
    localStorage.setItem('medresa_ins', JSON.stringify(state.instructors));
    localStorage.setItem('medresa_std', JSON.stringify(state.students));
    localStorage.setItem('medresa_att', JSON.stringify(state.attendance));
}

// -------------------------------------------------------------
// ጭብጥ መቆጣጠሪያ ሞዱል (Theme Switcher Module)
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem('medresa_theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const themeBtnSidebar = document.getElementById('themeToggleSidebar');
    const themeIconMobile = document.getElementById('themeIconMobile');
    
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtnSidebar) themeBtnSidebar.innerText = '☀️ ብርሃን';
        if (themeIconMobile) {
            // Sun SVG Path
            themeIconMobile.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
        }
        localStorage.setItem('medresa_theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        if (themeBtnSidebar) themeBtnSidebar.innerText = '🌙 ጨለማ';
        if (themeIconMobile) {
            // Moon SVG Path
            themeIconMobile.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        }
        localStorage.setItem('medresa_theme', 'dark');
    }
}

// -------------------------------------------------------------
// የመተግበሪያው አስነሺ መሪ ሞዱል (App Lifecycle Handlers)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    checkAndSeedDatabase();
    initTheme();
    initInterfaceCore();

    // Determine default view to render on start
    const activeViewEl = document.querySelector('.app-view.active');
    const activeViewId = activeViewEl ? activeViewEl.id : 'dash-view';
    switchView(activeViewId);

    // የውጪ ጠቅታዎችን በመጥለፍ ሜኑ ለመዝጋት
    document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('dots-btn')) {
            const menu = document.getElementById('actionDropdownDeck');
            if (menu) menu.classList.remove('show');
        }
    });
});

function initInterfaceCore() {
    // የጎን አሞሌ ሊንኮች
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchView(e.currentTarget.getAttribute('data-view'));
            closeMobileSidebar();
        });
    });

    // የሞባይል መቆጣጠሪያዎች
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebarOverlay').classList.add('active');
    });
    
    document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);

    // ገጽታ መቀያየሪያ ቁልፎች
    const themeBtnSidebar = document.getElementById('themeToggleSidebar');
    if (themeBtnSidebar) {
        themeBtnSidebar.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('medresa_theme') || 'dark';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    const themeBtnMobile = document.getElementById('themeToggleMobile');
    if (themeBtnMobile) {
        themeBtnMobile.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('medresa_theme') || 'dark';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // የፎርሞች መዝጋቢ
    document.getElementById('instructorRegForm').addEventListener('submit', handleInstructorReg);
    
    document.getElementById('batchLimitSelect').addEventListener('change', (e) => {
        state.batchTarget = parseInt(e.target.value);
        state.batchCount = 0;
        updateBatchUI();
    });

    document.getElementById('attendanceInstructorSelect').addEventListener('change', (e) => {
        state.currentAttendanceInstructor = e.target.value;
        renderAttendanceMatrix();
    });

    // ሁሉንም መጣ በል (Mark All Present)
    const btnMarkAll = document.getElementById('btnMarkAllPresent');
    if (btnMarkAll) {
        btnMarkAll.addEventListener('click', markAllStudentsPresent);
    }

    // ተማሪ ማጣሪያ
    const filterSelect = document.getElementById('studentInstructorFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderStudentTable();
        });
    }

    // ሪፖርት ማጣሪያ
    const previewFilter = document.getElementById('previewInstructorFilter');
    if (previewFilter) {
        previewFilter.addEventListener('change', () => {
            renderMasterReportPreview();
        });
    }

    document.getElementById('btnDownloadPdf').addEventListener('click', executePdfGeneration);

    // የአክሽን ፖፕአፕ ክሊክ ማስተናገጃዎች
    document.getElementById('btnDropdownDelete').addEventListener('click', executeContextDeletion);
    document.getElementById('btnDropdownUpdate').addEventListener('click', triggerContextUpdate);
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function switchView(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const activeView = document.getElementById(viewId);
    if (activeView) activeView.classList.add('active');
    
    renderView(viewId);
    
    if(viewId === 'attendance-view') {
        setTimeout(scrollToCurrentMonthColumn, 300);
    }
}

function renderView(viewId) {
    // Lazy Render: Rebuild only the view currently shown
    if (viewId === 'dash-view') {
        renderDashboard();
    } else if (viewId === 'attendance-view') {
        populateInstructorDropdowns();
        renderAttendanceMatrix();
    } else if (viewId === 'preview-view') {
        populatePreviewFilterDropdown();
        renderMasterReportPreview();
    } else if (viewId === 'instructor-manage-view') {
        renderInstructorTable();
    } else if (viewId === 'student-reg-view') {
        renderStudentFormArea();
    } else if (viewId === 'student-manage-view') {
        populateStudentFilterDropdown();
        renderStudentTable();
    }
}

function populatePreviewFilterDropdown() {
    const filterSelect = document.getElementById('previewInstructorFilter');
    if (!filterSelect) return;
    const savedVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">ሁሉም (All)</option>';
    
    state.instructors.forEach(ins => {
        let opt = document.createElement('option');
        opt.value = ins.id;
        opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
        filterSelect.appendChild(opt);
    });

    if (savedVal && (savedVal === 'all' || state.instructors.find(i => i.id === savedVal))) {
        filterSelect.value = savedVal;
    } else {
        filterSelect.value = 'all';
    }
}

function populateInstructorDropdowns() {
    const attSelect = document.getElementById('attendanceInstructorSelect');
    const savedVal = attSelect.value;
    attSelect.innerHTML = '';
    
    if(state.instructors.length > 0) {
        state.instructors.forEach(ins => {
            let opt = document.createElement('option');
            opt.value = ins.id;
            opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
            attSelect.appendChild(opt);
        });
        if(savedVal && state.instructors.find(i => i.id === savedVal)) {
            attSelect.value = savedVal;
        }
        state.currentAttendanceInstructor = attSelect.value;
    }
}

function populateStudentFilterDropdown() {
    const filterSelect = document.getElementById('studentInstructorFilter');
    if (!filterSelect) return;
    const savedVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">ሁሉም (All)</option>';
    
    state.instructors.forEach(ins => {
        let opt = document.createElement('option');
        opt.value = ins.id;
        opt.innerText = `ኡስታዛ ${ins.firstName} ${ins.lastName}`;
        filterSelect.appendChild(opt);
    });

    if (savedVal && (savedVal === 'all' || state.instructors.find(i => i.id === savedVal))) {
        filterSelect.value = savedVal;
    } else {
        filterSelect.value = 'all';
    }
}

// -------------------------------------------------------------
// 1. ዳሽቦርድ ሞዱል ቀመሮች (Dashboard Metrics Engine)
// -------------------------------------------------------------
function renderDashboard() {
    document.getElementById('cardTotalStudents').innerText = state.students.length;
    document.getElementById('lblAbsent1').innerText = `1 ቀን የቀሩ (በ${monthsEthiopic[CURRENT_MONTH_INDEX]})`;
    document.getElementById('lblAbsent2').innerText = `2 ቀን የቀሩ (በ${monthsEthiopic[CURRENT_MONTH_INDEX]})`;
    document.getElementById('lblAbsent3').innerText = `3 ቀንና ከዚያ በላይ የቀሩ (በ${monthsEthiopic[CURRENT_MONTH_INDEX]})`;

    let absentMap = {}; // stdId -> count
    state.students.forEach(s => absentMap[s.id] = 0);

    // FIX: Parsing composite student IDs correctly by splitting from the right side of the attendance key
    Object.keys(state.attendance).forEach(key => {
        const lastUnderscore = key.lastIndexOf('_');
        if (lastUnderscore !== -1) {
            const secondLastUnderscore = key.lastIndexOf('_', lastUnderscore - 1);
            if (secondLastUnderscore !== -1) {
                const stdId = key.substring(0, secondLastUnderscore);
                const mIdx = parseInt(key.substring(secondLastUnderscore + 1, lastUnderscore));
                const status = state.attendance[key];
                
                if(mIdx === CURRENT_MONTH_INDEX && status === 'X' && absentMap[stdId] !== undefined) {
                    absentMap[stdId]++;
                }
            }
        }
    });

    let c1 = 0, c2 = 0, c3 = 0;
    let criticalStudents = [];

    state.students.forEach(s => {
        const count = absentMap[s.id] || 0;
        if(count === 1) c1++;
        else if(count === 2) c2++;
        else if(count >= 3) {
            c3++;
            criticalStudents.push({ name: `${s.firstName} ${s.lastName}`, count: count });
        }
    });

    document.getElementById('cardAbsent1').innerText = c1;
    document.getElementById('cardAbsent2').innerText = c2;
    document.getElementById('cardAbsent3').innerText = c3;

    // የአስጊ ተማሪዎች ዝርዝር ማሳያ (3 ቀን የቀሩ)
    const listContainer = document.getElementById('dashCriticalAbsentList');
    listContainer.innerHTML = '';
    if(criticalStudents.length === 0) {
        listContainer.innerHTML = `<div style="color:var(--text-muted); font-size:12.5px; text-align:center; padding-top:20px;">በዚህ ወር አስጊ ተማሪ የለም።</div>`;
    } else {
        let listHtml = '';
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
    const chartContainer = document.getElementById('barChartContainer');
    chartContainer.innerHTML = '';

    if(state.instructors.length === 0) {
        chartContainer.innerHTML = `<div style="color:var(--text-muted); text-align:center; width:100%;">ምንም መረጃ የለም</div>`;
        return;
    }

    let maxAbsentsFoundInGroup = 1;
    let insMetrics = state.instructors.map(ins => {
        let totalGroupAbsents = 0;
        const myStudents = state.students.filter(s => s.instructorId === ins.id);
        myStudents.forEach(s => {
            totalGroupAbsents += (absentMap[s.id] || 0);
        });
        if(totalGroupAbsents > maxAbsentsFoundInGroup) maxAbsentsFoundInGroup = totalGroupAbsents;
        return { name: ins.firstName, total: totalGroupAbsents };
    });

    let chartHtml = '';
    insMetrics.forEach(metric => {
        const heightPercentage = Math.min(100, Math.max(10, (metric.total / maxAbsentsFoundInGroup) * 100));
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

// -------------------------------------------------------------
// 2. የኡስታዛቶች ሞዱል አሠራር (Instructor Engine)
// -------------------------------------------------------------
function handleInstructorReg(e) {
    e.preventDefault();
    const ins = {
        id: "ins_" + Date.now(),
        firstName: document.getElementById('insFirstName').value.trim(),
        lastName: document.getElementById('insLastName').value.trim(),
        phone: document.getElementById('insPhone').value.trim()
    };
    state.instructors.push(ins);
    saveState();
    document.getElementById('instructorRegForm').reset();
    document.getElementById('insLastName').value = "Unknown";
    switchView('instructor-manage-view');
}

function renderInstructorTable() {
    const tbody = document.getElementById('instructorTableBody');
    tbody.innerHTML = '';
    if(state.instructors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted); padding:30px;">ምንም የተመዘገበ ኡስታዛ የለም።</td></tr>`;
        return;
    }
    let tableHtml = '';
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
// 3. የተማሪዎች ምዝገባ እና ባች ሞዱል (Student & Batch Engine)
// -------------------------------------------------------------
function updateBatchUI() {
    const indicator = document.getElementById('batchCounterIndicator');
    if(state.batchTarget > 1) {
        state.batchActive = true;
        indicator.innerText = `ባች ሞድ፦ ${state.batchCount + 1} ከ ${state.batchTarget}`;
    } else {
        state.batchActive = false;
        state.batchCount = 0;
        indicator.innerText = `ነጠላ ሞድ`;
    }
}

function renderStudentFormArea() {
    const container = document.getElementById('studentFormContainer');
    if(state.instructors.length === 0) {
        container.innerHTML = `
            <div class="alert-card">
                <p>⚠️ ተማሪ ከመመዝገብዎ በፊት ቢያንስ አንድ ኡስታዛ በሲስተሙ ላይ መመዝገብ ይኖርባታል።</p>
                <button class="btn btn-primary" onclick="switchView('instructor-reg-view')">🏃‍♂️ መጀመሪያ ኡስታዛ ለመመዝገብ እዚህ ይጫኑ</button>
            </div>
        `;
        return;
    }

    let insOptions = '';
    state.instructors.forEach(ins => {
        insOptions += `<option value="${ins.id}">ኡስታዛ ${ins.firstName} ${ins.lastName}</option>`;
    });

    container.innerHTML = `
        <div class="card" style="max-width: 550px;">
            <form id="studentRegForm" onsubmit="handleStudentReg(event)">
                <div class="form-group">
                    <label>የተማሪ መጀመሪያ ስም *</label>
                    <input type="text" id="stdFirstName" class="form-control" required placeholder="ለምሳሌ፦ ሙርሺዳ">
                </div>
                <div class="form-group">
                    <label>የአባት ስም *</label>
                    <input type="text" id="stdLastName" class="form-control" required placeholder="ለምሳሌ፦ ሙጂብ">
                </div>
                <div class="form-group">
                    <label>የሚከታተልበት ኡስታዛ *</label>
                    <select id="stdInstructorSelect" class="form-control" required>${insOptions}</select>
                </div>
                <div style="display:flex; gap:12px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;">ተማሪ መዝግብ</button>
                    <button type="button" id="btnSkipBatch" class="btn btn-secondary" style="display:none;" onclick="handleBatchSkip()">ለጊዜው ዝለል</button>
                </div>
            </form>
        </div>
    `;
    
    if(state.batchActive) {
        document.getElementById('btnSkipBatch').style.display = 'inline-flex';
    }
}

function handleStudentReg(e) {
    e.preventDefault();
    const std = {
        id: "std_" + Date.now() + "_" + Math.floor(Math.random()*100),
        firstName: document.getElementById('stdFirstName').value.trim(),
        lastName: document.getElementById('stdLastName').value.trim(),
        instructorId: document.getElementById('stdInstructorSelect').value
    };

    state.students.push(std);
    saveState();

    if(state.batchActive) {
        state.batchCount++;
        if(state.batchCount >= state.batchTarget) {
            // የባች ምዝገባ ተጠናቋል
            state.batchActive = false;
            state.batchCount = 0;
            state.batchTarget = 1;
            document.getElementById('batchLimitSelect').value = "1";
            switchView('student-manage-view');
        } else {
            updateBatchUI();
            renderStudentFormArea();
            document.getElementById('stdFirstName').focus();
        }
    } else {
        switchView('student-manage-view');
    }
}

function handleBatchSkip() {
    if(state.batchActive) {
        state.batchCount++;
        if(state.batchCount >= state.batchTarget) {
            state.batchActive = false;
            state.batchCount = 0;
            state.batchTarget = 1;
            document.getElementById('batchLimitSelect').value = "1";
            switchView('student-manage-view');
        } else {
            updateBatchUI();
            renderStudentFormArea();
        }
    }
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    const filterSelect = document.getElementById('studentInstructorFilter');
    const filterVal = filterSelect ? filterSelect.value : 'all';

    let targetStudents = state.students;
    if (filterVal !== 'all') {
        targetStudents = state.students.filter(s => s.instructorId === filterVal);
    }

    if(targetStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted); padding:30px;">ምንም የተመዘገበ ተማሪ የለም።</td></tr>`;
        return;
    }
    
    let tableHtml = '';
    targetStudents.forEach((std, idx) => {
        const ins = state.instructors.find(i => i.id === std.instructorId);
        const insName = ins ? `ኡስታዛ ${ins.firstName} ${ins.lastName}` : 'ያልተመደበ';
        tableHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${std.firstName} ${std.lastName}</strong></td>
                <td style="color:var(--accent); font-weight:500;">${insName}</td>
                <td class="action-cell">
                    <button class="dots-btn" onclick="openActionDropdown(event, 'student', '${std.id}')">⋮</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = tableHtml;
}

// -------------------------------------------------------------
// 4. አክሽን ፖፕአፕ ሞዱል (Action Dropdown Deck System)
// -------------------------------------------------------------
function openActionDropdown(e, type, id) {
    e.stopPropagation();
    state.activeContext = { type: type, id: id };
    const menu = document.getElementById('actionDropdownDeck');
    menu.classList.add('show');
    
    // የፖፕአፑን አቀማመጥ ከተጫንበት ቁልፍ አጠገብ ማድረግ
    const rect = e.target.getBoundingClientRect();
    menu.style.top = (rect.top + window.scrollY) + 'px';
    menu.style.left = (rect.left + window.scrollX - 140) + 'px';
}

function executeContextDeletion() {
    if(!state.activeContext) return;
    const ctx = state.activeContext;
    
    if(ctx.type === 'instructor') {
        state.instructors = state.instructors.filter(i => i.id !== ctx.id);
        // ተማሪዎችን ወደ አልተመደበ መቀየር
        state.students.forEach(s => {
            if(s.instructorId === ctx.id) s.instructorId = '';
        });
    } else if(ctx.type === 'student') {
        state.students = state.students.filter(s => s.id !== ctx.id);
        // የመገኘት ታሪክ መሰረዝ
        Object.keys(state.attendance).forEach(key => {
            if(key.startsWith(ctx.id + "_")) delete state.attendance[key];
        });
    }
    saveState();
    
    // Re-render only the active view
    const activeViewEl = document.querySelector('.app-view.active');
    if (activeViewEl) {
        renderView(activeViewEl.id);
    }
}

function triggerContextUpdate() {
    if(!state.activeContext) return;
    const ctx = state.activeContext;
    
    if(ctx.type === 'instructor') {
        const ins = state.instructors.find(i => i.id === ctx.id);
        if(!ins) return;
        const newFirst = prompt("የመጀመሪያ ስም ያሻሽሉ፦", ins.firstName);
        const newLast = prompt("የአባት ስም ያሻሽሉ፦", ins.lastName);
        const newPhone = prompt("ስልክ ቁጥር ያሻሽሉ፦", ins.phone);
        if(newFirst) {
            ins.firstName = newFirst.trim();
            ins.lastName = (newLast || ins.lastName).trim();
            ins.phone = (newPhone || ins.phone).trim();
            saveState();
            
            const activeViewEl = document.querySelector('.app-view.active');
            if (activeViewEl) renderView(activeViewEl.id);
        }
    } else if(ctx.type === 'student') {
        const std = state.students.find(s => s.id === ctx.id);
        if(!std) return;
        const newFirst = prompt("የተማሪ ስም ያሻሽሉ፦", std.firstName);
        const newLast = prompt("የአባት ስም ያሻሽሉ፦", std.lastName);
        if(newFirst && newLast) {
            std.firstName = newFirst.trim();
            std.lastName = newLast.trim();
            saveState();
            
            const activeViewEl = document.querySelector('.app-view.active');
            if (activeViewEl) renderView(activeViewEl.id);
        }
    }
}

// -------------------------------------------------------------
// 5. ዕለታዊ መገኘት ማትሪክስ ሰሌዳ (Attendance Matrix Engine)
// -------------------------------------------------------------
function renderAttendanceMatrix() {
    const container = document.getElementById('attendanceMatrixContainer');
    if(!state.currentAttendanceInstructor) {
        container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:30px;">ምንም የተመደበ ኡስታዛ የለም።</div>`;
        return;
    }

    const targetStudents = state.students.filter(s => s.instructorId === state.currentAttendanceInstructor);
    if(targetStudents.length === 0) {
        container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:30px;">በዚህ ኡስታዛ ስር የተመዘገበ ተማሪ የለም።</div>`;
        return;
    }

    const todayGC = new Date();
    const todayEC = toEthiopian(todayGC.getFullYear(), todayGC.getMonth() + 1, todayGC.getDate());
    const isTodayMonth = (CURRENT_MONTH_INDEX === todayEC[1] - 1);
    const currentDay = todayEC[2];

    let tableHtml = `<table class="app-table attendance-matrix"><thead><tr><th style="width:50px;">ተ.ቁ</th><th>ተማሪ ሙሉ ስም</th>`;
    for(let d = 1; d <= DAYS_IN_MONTH; d++) {
        const isToday = isTodayMonth && (d === currentDay);
        const dayName = getDayNameShort(d);
        tableHtml += `<th class="${isToday ? 'current-day-col' : ''}">
            <div class="day-header-container">
                <span class="day-name">${dayName}</span>
                <div class="day-header-circle">${d < 10 ? '0' + d : d}</div>
            </div>
        </th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    targetStudents.forEach((std, idx) => {
        tableHtml += `<tr>
            <td>${idx + 1}</td>
            <td><strong>${std.firstName} ${std.lastName}</strong></td>`;
        for(let d = 0; d < DAYS_IN_MONTH; d++) {
            const isToday = isTodayMonth && ((d + 1) === currentDay);
                        const isFuture = isTodayMonth && ((d + 1) > currentDay);
            const key = `${std.id}_${CURRENT_MONTH_INDEX}_${d}`;
            const currentStatus = state.attendance[key] || '';
            let bubbleClass = 'attendance-bubble ';
            let displaySymbol = '';
            
            if(currentStatus === '✓') {
                bubbleClass += 'state-present';
                displaySymbol = '✓';
            } else if(currentStatus === 'X') {
                bubbleClass += 'state-absent';
                displaySymbol = '✕';
            } else if(currentStatus === 'Ref') {
                bubbleClass += 'state-permission';
                displaySymbol = 'ፍ';
            } else {
                bubbleClass += 'state-empty';
            }

            if (isFuture) {
                bubbleClass += 'state-future';
                tableHtml += `<td class="attendance-cell"><div class="${bubbleClass}">${displaySymbol}</div></td>`;
            } else {
                tableHtml += `<td class="attendance-cell ${isToday ? 'current-day-col' : ''}"><div class="${bubbleClass}" onclick="cycleAttendanceState(this, '${std.id}', ${d})">${displaySymbol}</div></td>`;
            }
        }
        tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
}

function cycleAttendanceState(bubbleElement, stdId, dayIdx) {
    const todayGC = new Date();
    const todayEC = toEthiopian(todayGC.getFullYear(), todayGC.getMonth() + 1, todayGC.getDate());
    const isTodayMonth = (CURRENT_MONTH_INDEX === todayEC[1] - 1);
    const currentDay = todayEC[2];
    
    if (isTodayMonth && (dayIdx + 1 > currentDay)) {
        return; // Disable clicking future days
    }

    const key = `${stdId}_${CURRENT_MONTH_INDEX}_${dayIdx}`;
    const current = state.attendance[key] || '✓';
    let newStatus;
    
    if(current === '✓') {
        newStatus = 'X';
    } else if(current === 'X') {
        newStatus = 'Ref'; // ፍቃድ
    } else {
        newStatus = '✓';
    }
    
    if (newStatus === '✓') {
        delete state.attendance[key];
    } else {
        state.attendance[key] = newStatus;
    }
    saveState();
    
    // update cell bubble in DOM immediately
    bubbleElement.className = 'attendance-bubble ';
    let displaySymbol = '✓';
    
    if(newStatus === '✓') {
        bubbleElement.className += 'state-present';
    } else if(newStatus === 'X') {
        bubbleElement.className += 'state-absent';
        displaySymbol = '✕';
    } else if(newStatus === 'Ref') {
        bubbleElement.className += 'state-permission';
        displaySymbol = 'ፍ';
    }
    bubbleElement.innerText = displaySymbol;
}

function markAllStudentsPresent() {
    if (!state.currentAttendanceInstructor) return;
    const targetStudents = state.students.filter(s => s.instructorId === state.currentAttendanceInstructor);
    if (targetStudents.length === 0) return;
    
    if (!confirm("በዚህ ኡስታዛ ስር ያሉትን ሁሉንም ተማሪዎች ለዛሬ 'መጣ' (✓) ለማለት እርግጠኛ ነዎት?")) return;
    
    // reset all attendance overrides to default present
    targetStudents.forEach(std => {
        for(let d = 0; d < DAYS_IN_MONTH; d++) {
            const key = `${std.id}_${CURRENT_MONTH_INDEX}_${d}`;
            delete state.attendance[key];
        }
    });
    saveState();
    renderAttendanceMatrix();
}

function scrollToCurrentMonthColumn() {
    const container = document.getElementById('attendanceMatrixContainer');
    if(container) {
        const todayHeader = container.querySelector('.current-day-col');
        if (todayHeader) {
            todayHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            container.scrollLeft = 0;
        }
    }
}

// -------------------------------------------------------------
// 6. ማስተር ሪፖርት እና ፒዲኤፍ ሞዱል (Master Report & PDF Generator)
// -------------------------------------------------------------

function renderMasterReportPreview() {
    const container = document.getElementById('pdfExportWrapper');
    container.innerHTML = '';

    if(state.students.length === 0) {
        container.innerHTML = `<div style="color:black; padding:30px; text-align:center; font-family:var(--font);">ሪፖርት ለማመንጨት ተማሪዎች መመዝገብ አለባቸው።</div>`;
        return;
    }

    const filterVal = document.getElementById('previewInstructorFilter').value;
    let targetInstructors = state.instructors;
    if (filterVal !== 'all') {
        targetInstructors = state.instructors.filter(ins => ins.id === filterVal);
    }

    let pagesRendered = 0;

    targetInstructors.forEach(ins => {
        const myStudents = state.students.filter(s => s.instructorId === ins.id);
        if(myStudents.length === 0) return;

        const ROWS_PER_PAGE = 30;
        const totalPages = Math.ceil(myStudents.length / ROWS_PER_PAGE);

        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
            const studentSlice = myStudents.slice(pageIdx * ROWS_PER_PAGE, (pageIdx + 1) * ROWS_PER_PAGE);
            
            const page = document.createElement('div');
            page.className = 'pdf-page-wrapper';

            let rowsHtml = '';
            studentSlice.forEach((std, sIdx) => {
                const overallIdx = pageIdx * ROWS_PER_PAGE + sIdx;
                let cells = `<td>${overallIdx + 1}</td><td><strong>${std.firstName} ${std.lastName}</strong></td>`;

                for(let d = 0; d < DAYS_IN_MONTH; d++) {
                    const key = `${std.id}_${CURRENT_MONTH_INDEX}_${d}`;
                    const status = state.attendance[key] || '';
                    
                    if(status === '✓') {
                        cells += `<td style="color:#059669; font-weight:500;">✓</td>`;
                    } else if(status === 'X') {
                        cells += `<td style="background:#fee2e2; color:#dc2626; font-weight:bold;">✕</td>`;
                    } else if(status === 'Ref') {
                        cells += `<td style="background:#fef3c7; color:#d97706; font-weight:bold;">ፍ</td>`;
                    } else {
                        cells += `<td></td>`;
                    }
                }

                rowsHtml += `<tr>${cells}</tr>`;
            });

            let dayHeaders = '';
            for(let d=1; d<=DAYS_IN_MONTH; d++) {
                const verticalHtml = getDayVerticalHtml(d);
                dayHeaders += `<th style="width:18px; padding:2px 0 !important; font-size:8px !important; font-weight:normal; line-height:1.15;">
                    <div style="font-size:7px; color:#475569; margin-bottom:2px; font-weight:bold;">${verticalHtml}</div>
                    <div style="border-top:1px solid #cbd5e1; padding-top:2px; font-weight:bold;">${d}</div>
                </th>`;
            }

            page.innerHTML = `
                <h1>ኢብኑ ዑመር ኢስላማዊ መድረሳ</h1>
                <h3 style="margin-bottom:12px;">የተማሪዎች ወርሃዊ መገኘት ማስተር ማውጫ — ወር፦ ${monthsEthiopic[CURRENT_MONTH_INDEX]} | ኡስታዛ፦ ${ins.firstName} ${ins.lastName}</h3>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th style="width:30px;">ተ.ቁ</th>
                            <th style="width:140px; text-align:left;">ተማሪ ሙሉ ስም</th>
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

    if(pagesRendered === 0) {
        container.innerHTML = `<div style="color:black; padding:30px; text-align:center;">ምንም ንቁ መረጃ የለም።</div>`;
    }
}

function executePdfGeneration() {
    const element = document.getElementById('pdfExportWrapper');
    element.classList.add('pdf-exporting');

    const opt = {
        margin:       0,
        filename:     `Ibnu_Oumar_Attendance_Report.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };
    
    // Explicit worker chain to ensure correct class toggling order during export
    html2pdf().set(opt).from(element).toPdf().get('pdf').save().then(() => {
        element.classList.remove('pdf-exporting');
    });
}
