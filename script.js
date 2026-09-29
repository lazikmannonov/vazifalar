const KALIT = "vazifalar";
const TEMA_KALITI = "vazifalar-theme";

const forma = document.getElementById("forma");
const matn = document.getElementById("matn");
const royxat = document.getElementById("royxat");
const tozalash = document.getElementById("tozalash");
const sana = document.getElementById("sana");

const kategoriya = document.getElementById("kategoriya");
const muddat = document.getElementById("muddat");

const qidiruv = document.getElementById("qidiruv");
const sortSelect = document.getElementById("sortSelect");

const themeBtn = document.getElementById("themeBtn");

const jamiEl = document.getElementById("jami");
const bajarilganEl = document.getElementById("bajarilgan");
const qolganEl = document.getElementById("qolgan");
const muhimEl = document.getElementById("muhim");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const importantCount = document.getElementById("importantCount");

const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressMessage = document.getElementById("progressMessage");

const emptyState = document.getElementById("emptyState");
const weekChart = document.getElementById("weekChart");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastText = document.getElementById("toastText");

let vazifalar = yukla();
let aktivFilter = "all";
let toastTimer = null;


/* =====================================================
   LOCAL STORAGE
===================================================== */

function yukla() {
    try {
        const data = JSON.parse(localStorage.getItem(KALIT));

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((v, index) => ({
            id: v.id || Date.now() + index,

            matn: v.matn || v.text || "",

            bajarilgan: Boolean(
                v.bajarilgan !== undefined
                    ? v.bajarilgan
                    : v.completed
            ),

            muhim: Boolean(
                v.muhim || v.important
            ),

            kategoriya:
                v.kategoriya ||
                v.category ||
                "Shaxsiy",

            muddat:
                v.muddat ||
                v.deadline ||
                "",

            yaratilgan:
                v.yaratilgan ||
                v.createdAt ||
                new Date().toISOString()
        }));

    } catch {
        return [];
    }
}

function saqla() {
    localStorage.setItem(
        KALIT,
        JSON.stringify(vazifalar)
    );
}


/* =====================================================
   SANA
===================================================== */

function bugungiSana() {
    const bugun = new Date();

    sana.textContent =
        bugun.toLocaleDateString(
            "uz-UZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    if (muddat) {
        muddat.min =
            bugun
                .toISOString()
                .split("T")[0];
    }
}


/* =====================================================
   TOAST
===================================================== */

function xabar(matnXabari, tur = "success") {

    if (!toast || !toastText) {
        return;
    }

    clearTimeout(toastTimer);

    toastText.textContent =
        matnXabari;

    if (toastIcon) {
        toastIcon.textContent =
            tur === "error"
                ? "!"
                : "✓";
    }

    toast.classList.remove(
        "show",
        "error"
    );

    if (tur === "error") {
        toast.classList.add("error");
    }

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* =====================================================
   STATISTIKA
===================================================== */

function statistika() {

    const jami =
        vazifalar.length;

    const bajarilgan =
        vazifalar.filter(
            v => v.bajarilgan
        ).length;

    const qolgan =
        jami - bajarilgan;

    const muhim =
        vazifalar.filter(
            v =>
                v.muhim ||
                v.kategoriya === "Muhim"
        ).length;

    jamiEl.textContent = jami;
    bajarilganEl.textContent = bajarilgan;
    qolganEl.textContent = qolgan;
    muhimEl.textContent = muhim;

    allCount.textContent = jami;

    activeCount.textContent =
        vazifalar.filter(
            v => !v.bajarilgan
        ).length;

    completedCount.textContent =
        bajarilgan;

    importantCount.textContent =
        muhim;

    let foiz = 0;

    if (jami > 0) {
        foiz =
            Math.round(
                (bajarilgan / jami) * 100
            );
    }

    progressPercent.textContent =
        `${foiz}%`;

    progressBar.style.width =
        `${foiz}%`;

    progressText.textContent =
        `${bajarilgan} / ${jami} bajarildi`;

    if (jami === 0) {

        progressMessage.textContent =
            "Boshlash vaqti";

    } else if (foiz === 100) {

        progressMessage.textContent =
            "Ajoyib! Hammasi bajarildi 🎉";

    } else if (foiz >= 75) {

        progressMessage.textContent =
            "Deyarli tugadi!";

    } else if (foiz >= 50) {

        progressMessage.textContent =
            "Yaxshi ketmoqda!";

    } else if (foiz > 0) {

        progressMessage.textContent =
            "Davom eting!";

    } else {

        progressMessage.textContent =
            "Boshlash vaqti";
    }
}


/* =====================================================
   FILTER
===================================================== */

function filterdanOtkaz(v) {

    if (aktivFilter === "active") {
        return !v.bajarilgan;
    }

    if (aktivFilter === "completed") {
        return v.bajarilgan;
    }

    if (aktivFilter === "important") {
        return (
            v.muhim ||
            v.kategoriya === "Muhim"
        );
    }

    return true;
}


/* =====================================================
   QIDIRUV
===================================================== */

function qidiruvdanOtkaz(v) {

    const soz =
        qidiruv.value
            .trim()
            .toLowerCase();

    if (!soz) {
        return true;
    }

    return (
        v.matn
            .toLowerCase()
            .includes(soz) ||

        v.kategoriya
            .toLowerCase()
            .includes(soz)
    );
}


/* =====================================================
   SARALASH
===================================================== */

function sarala(arr) {

    const turi =
        sortSelect.value;

    const nusxa = [...arr];

    if (turi === "new") {

        nusxa.sort(
            (a, b) =>
                Number(b.id) -
                Number(a.id)
        );
    }

    if (turi === "old") {

        nusxa.sort(
            (a, b) =>
                Number(a.id) -
                Number(b.id)
        );
    }

    if (turi === "priority") {

        nusxa.sort((a, b) => {

            const aImportant =
                a.muhim ||
                a.kategoriya === "Muhim";

            const bImportant =
                b.muhim ||
                b.kategoriya === "Muhim";

            if (
                aImportant !==
                bImportant
            ) {
                return (
                    bImportant -
                    aImportant
                );
            }

            return (
                Number(b.id) -
                Number(a.id)
            );
        });
    }

    if (turi === "deadline") {

        nusxa.sort((a, b) => {

            if (
                !a.muddat &&
                !b.muddat
            ) {
                return 0;
            }

            if (!a.muddat) {
                return 1;
            }

            if (!b.muddat) {
                return -1;
            }

            return (
                new Date(a.muddat) -
                new Date(b.muddat)
            );
        });
    }

    return nusxa;
}


/* =====================================================
   MUDDAT
===================================================== */

function muddatFormat(muddatQiymat) {

    if (!muddatQiymat) {
        return "";
    }

    const sanaObj =
        new Date(
            muddatQiymat +
            "T00:00:00"
        );

    if (
        Number.isNaN(
            sanaObj.getTime()
        )
    ) {
        return muddatQiymat;
    }

    return sanaObj.toLocaleDateString(
        "uz-UZ",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


/* MUHIM: apostrofsiz nom */

function muddatiOtgan(v) {

    if (
        !v.muddat ||
        v.bajarilgan
    ) {
        return false;
    }

    const bugun =
        new Date();

    bugun.setHours(
        0,
        0,
        0,
        0
    );

    const muddatObj =
        new Date(
            v.muddat +
            "T00:00:00"
        );

    return muddatObj < bugun;
}


/* =====================================================
   KATEGORIYA
===================================================== */

function kategoriyaEmoji(kat) {

    const belgilar = {

        "Shaxsiy": "👤",

        "O‘qish": "📚",

        "O'qish": "📚",

        "Ish": "💼",

        "Muhim": "🔥",

        "Boshqa": "📌"
    };

    return (
        belgilar[kat] ||
        "📌"
    );
}


/* =====================================================
   VAZIFALARNI CHIZISH
===================================================== */

function chiz() {

    royxat.innerHTML = "";

    let korsatiladigan =
        vazifalar
            .filter(filterdanOtkaz)
            .filter(qidiruvdanOtkaz);

    korsatiladigan =
        sarala(korsatiladigan);


    /* BO'SH HOLAT */

    if (
        korsatiladigan.length === 0
    ) {

        emptyState.style.display =
            "flex";

        const sarlavha =
            emptyState.querySelector("h3");

        const izoh =
            emptyState.querySelector("p");

        if (vazifalar.length === 0) {

            sarlavha.textContent =
                "Hozircha vazifa yo‘q";

            izoh.textContent =
                "Yuqoridagi maydondan yangi vazifa qo‘shing.";

        } else if (
            aktivFilter === "completed"
        ) {

            sarlavha.textContent =
                "Bajarilgan vazifalar yo‘q";

            izoh.textContent =
                "Hozircha bajarilgan vazifa mavjud emas.";

        } else if (
            aktivFilter === "important"
        ) {

            sarlavha.textContent =
                "Muhim vazifalar yo‘q";

            izoh.textContent =
                "Muhim vazifa qo‘shilganda shu yerda ko‘rinadi.";

        } else if (
            aktivFilter === "active"
        ) {

            sarlavha.textContent =
                "Jarayondagi vazifalar yo‘q";

            izoh.textContent =
                "Barcha vazifalar bajarilgan.";

        } else if (
            qidiruv.value.trim()
        ) {

            sarlavha.textContent =
                "Vazifa topilmadi";

            izoh.textContent =
                "Qidiruv so‘zini o‘zgartirib ko‘ring.";

        } else {

            sarlavha.textContent =
                "Hozircha vazifa yo‘q";

            izoh.textContent =
                "Yuqoridagi maydondan yangi vazifa qo‘shing.";
        }

        statistika();

        return;
    }


    emptyState.style.display =
        "none";


    /* HAR BIR VAZIFA */

    korsatiladigan.forEach(v => {

        const li =
            document.createElement("li");

        li.className =
            "task-item";


        if (v.bajarilgan) {
            li.classList.add(
                "bajarilgan"
            );
        }


        if (
            v.muhim ||
            v.kategoriya === "Muhim"
        ) {
            li.classList.add(
                "muhim-task"
            );
        }


        if (muddatiOtgan(v)) {
            li.classList.add(
                "muddat-otgan"
            );
        }


        /* CHECKBOX */

        const checkWrap =
            document.createElement("label");

        checkWrap.className =
            "task-check";


        const check =
            document.createElement("input");

        check.type =
            "checkbox";

        check.checked =
            v.bajarilgan;


        const checkVisual =
            document.createElement("span");

        checkVisual.className =
            "check-visual";


        check.addEventListener(
            "change",
            () => {

                v.bajarilgan =
                    check.checked;

                saqla();

                chiz();

                statistika();

                grafikChiz();

                if (v.bajarilgan) {

                    xabar(
                        "Vazifa bajarildi ✓"
                    );

                } else {

                    xabar(
                        "Vazifa qayta faollashtirildi"
                    );
                }
            }
        );


        checkWrap.append(
            check,
            checkVisual
        );


        /* BODY */

        const body =
            document.createElement("div");

        body.className =
            "task-body";


        const titleRow =
            document.createElement("div");

        titleRow.className =
            "task-title-row";


        const title =
            document.createElement("span");

        title.className =
            "task-title";

        title.textContent =
            v.matn;


        /* MUHIM STAR */

        const star =
            document.createElement("button");

        star.type =
            "button";

        star.className =
            "star-btn";


        if (
            v.muhim ||
            v.kategoriya === "Muhim"
        ) {
            star.classList.add(
                "active"
            );
        }


        star.textContent =
            "★";

        star.title =
            "Muhim";


        star.addEventListener(
            "click",
            () => {

                v.muhim =
                    !v.muhim;

                saqla();

                chiz();

                statistika();

                if (v.muhim) {

                    xabar(
                        "Vazifa muhim deb belgilandi"
                    );

                } else {

                    xabar(
                        "Muhim belgisi olib tashlandi"
                    );
                }
            }
        );


        titleRow.append(
            title,
            star
        );


        /* META */

        const meta =
            document.createElement("div");

        meta.className =
            "task-meta";


        const category =
            document.createElement("span");

        category.className =
            "task-category";

        category.textContent =
            `${kategoriyaEmoji(
                v.kategoriya
            )} ${v.kategoriya}`;


        meta.appendChild(
            category
        );


        if (v.muddat) {

            const deadline =
                document.createElement("span");

            deadline.className =
                "task-deadline";


            if (muddatiOtgan(v)) {

                deadline.classList.add(
                    "overdue"
                );

                deadline.textContent =
                    `⚠ Muddat o‘tgan · ${muddatFormat(
                        v.muddat
                    )}`;

            } else {

                deadline.textContent =
                    `◷ ${muddatFormat(
                        v.muddat
                    )}`;
            }


            meta.appendChild(
                deadline
            );
        }


        body.append(
            titleRow,
            meta
        );


        /* TAHRIRLASH */

        const edit =
            document.createElement("button");

        edit.type =
            "button";

        edit.className =
            "task-action edit-btn";

        edit.title =
            "Tahrirlash";

        edit.innerHTML =
            "✎";


        edit.addEventListener(
            "click",
            () => {
                tahrirlash(v);
            }
        );


        /* O‘CHIRISH */

        const ochir =
            document.createElement("button");

        ochir.type =
            "button";

        ochir.className =
            "task-action delete-btn";

        ochir.title =
            "O‘chirish";

        ochir.innerHTML =
            "×";


        ochir.addEventListener(
            "click",
            () => {

                const tasdiq =
                    confirm(
                        `"${v.matn}" vazifasini o‘chirmoqchimisiz?`
                    );

                if (!tasdiq) {
                    return;
                }


                vazifalar =
                    vazifalar.filter(
                        x =>
                            x.id !== v.id
                    );


                saqla();

                chiz();

                statistika();

                grafikChiz();

                xabar(
                    "Vazifa o‘chirildi"
                );
            }
        );


        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";


        actions.append(
            edit,
            ochir
        );


        li.append(
            checkWrap,
            body,
            actions
        );


        royxat.appendChild(li);
    });


    statistika();
}


/* =====================================================
   TAHRIRLASH
===================================================== */

function tahrirlash(v) {

    const yangiMatn =
        prompt(
            "Vazifani tahrirlang:",
            v.matn
        );


    if (yangiMatn === null) {
        return;
    }


    const qiymat =
        yangiMatn.trim();


    if (!qiymat) {

        xabar(
            "Vazifa matni bo‘sh bo‘lishi mumkin emas",
            "error"
        );

        return;
    }


    v.matn =
        qiymat;


    saqla();

    chiz();

    xabar(
        "Vazifa yangilandi ✓"
    );
}


/* =====================================================
   QO‘SHISH
===================================================== */

forma.addEventListener(
    "submit",
    e => {

        e.preventDefault();


        const qiymat =
            matn.value.trim();


        if (!qiymat) {

            xabar(
                "Vazifa yozing",
                "error"
            );

            matn.focus();

            return;
        }


        const kat =
            kategoriya.value ||
            "Shaxsiy";


        const yangi = {

            id: Date.now(),

            matn: qiymat,

            bajarilgan: false,

            muhim:
                kat === "Muhim",

            kategoriya: kat,

            muddat:
                muddat.value || "",

            yaratilgan:
                new Date().toISOString()
        };


        vazifalar.unshift(
            yangi
        );


        saqla();


        matn.value = "";

        muddat.value = "";

        kategoriya.value =
            "Shaxsiy";


        aktivFilter =
            "all";


        document
            .querySelectorAll(".filter")
            .forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.filter ===
                        "all"
                );
            });


        chiz();

        statistika();

        grafikChiz();


        xabar(
            "Yangi vazifa qo‘shildi ✓"
        );


        matn.focus();
    }
);


/* =====================================================
   TOZALASH
===================================================== */

tozalash.addEventListener(
    "click",
    () => {

        const son =
            vazifalar.filter(
                v => v.bajarilgan
            ).length;


        if (son === 0) {

            xabar(
                "Tozalash uchun bajarilgan vazifa yo‘q",
                "error"
            );

            return;
        }


        const tasdiq =
            confirm(
                `${son} ta bajarilgan vazifani o‘chirmoqchimisiz?`
            );


        if (!tasdiq) {
            return;
        }


        vazifalar =
            vazifalar.filter(
                v => !v.bajarilgan
            );


        saqla();

        chiz();

        statistika();

        grafikChiz();


        xabar(
            "Bajarilgan vazifalar tozalandi"
        );
    }
);


/* =====================================================
   FILTER TUGMALARI
===================================================== */

document
    .querySelectorAll(".filter")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                aktivFilter =
                    btn.dataset.filter;


                document
                    .querySelectorAll(".filter")
                    .forEach(b => {
                        b.classList.remove(
                            "active"
                        );
                    });


                btn.classList.add(
                    "active"
                );


                chiz();
            }
        );
    });


/* =====================================================
   QIDIRUV
===================================================== */

qidiruv.addEventListener(
    "input",
    chiz
);


/* =====================================================
   SORT
===================================================== */

sortSelect.addEventListener(
    "change",
    chiz
);


/* =====================================================
   TEMA
===================================================== */

function temaOrnat(theme) {

    document.documentElement.dataset.theme =
        theme;


    localStorage.setItem(
        TEMA_KALITI,
        theme
    );


    if (themeBtn) {

        themeBtn.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";


        themeBtn.title =
            theme === "dark"
                ? "Yorug‘ rejim"
                : "Tungi rejim";
    }
}


function temaYukla() {

    const saqlangan =
        localStorage.getItem(
            TEMA_KALITI
        );


    if (saqlangan) {

        temaOrnat(
            saqlangan
        );

    } else {

        temaOrnat(
            "light"
        );
    }
}


themeBtn.addEventListener(
    "click",
    () => {

        const hozir =
            document.documentElement
                .dataset
                .theme;


        temaOrnat(
            hozir === "dark"
                ? "light"
                : "dark"
        );


        xabar(
            hozir === "dark"
                ? "Yorug‘ rejim yoqildi"
                : "Tungi rejim yoqildi"
        );
    }
);


/* =====================================================
   HAFTALIK GRAFIK
===================================================== */

function grafikChiz() {

    if (!weekChart) {
        return;
    }


    weekChart.innerHTML = "";


    const bugun =
        new Date();

    bugun.setHours(
        0,
        0,
        0,
        0
    );


    const kunlar = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const sanaObj =
            new Date(bugun);


        sanaObj.setDate(
            bugun.getDate() - i
        );


        kunlar.push(
            sanaObj
        );
    }


    const qiymatlar =
        kunlar.map(kun => {

            return vazifalar.filter(
                v => {

                    if (!v.bajarilgan) {
                        return false;
                    }


                    const manba =
                        v.yaratilgan
                            ? new Date(
                                v.yaratilgan
                            )
                            : null;


                    if (
                        !manba ||
                        Number.isNaN(
                            manba.getTime()
                        )
                    ) {
                        return false;
                    }


                    return (
                        manba.getFullYear() ===
                            kun.getFullYear() &&

                        manba.getMonth() ===
                            kun.getMonth() &&

                        manba.getDate() ===
                            kun.getDate()
                    );
                }
            ).length;
        });


    const maksimal =
        Math.max(
            ...qiymatlar,
            1
        );


    const nomlar = [
        "Ya",
        "Du",
        "Se",
        "Cho",
        "Pa",
        "Ju",
        "Sha"
    ];


    kunlar.forEach(
        (kun, index) => {

            const ustun =
                document.createElement(
                    "div"
                );

            ustun.className =
                "chart-column";


            const qiymat =
                document.createElement(
                    "div"
                );

            qiymat.className =
                "chart-value";

            qiymat.textContent =
                qiymatlar[index];


            const bar =
                document.createElement(
                    "div"
                );

            bar.className =
                "chart-bar";


            const foiz =
                qiymatlar[index] === 0
                    ? 6
                    : Math.max(
                        12,
                        (
                            qiymatlar[index] /
                            maksimal
                        ) * 100
                    );


            bar.style.height =
                `${foiz}%`;


            const label =
                document.createElement(
                    "span"
                );

            label.className =
                "chart-label";


            label.textContent =
                nomlar[
                    kun.getDay()
                ];


            ustun.append(
                qiymat,
                bar,
                label
            );


            weekChart.appendChild(
                ustun
            );
        }
    );
}


/* =====================================================
   KLAVIATURA
===================================================== */

document.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "/" &&
            document.activeElement.tagName !==
                "INPUT" &&
            document.activeElement.tagName !==
                "TEXTAREA"
        ) {

            e.preventDefault();

            qidiruv.focus();
        }


        if (
            e.key === "Escape" &&
            document.activeElement ===
                qidiruv
        ) {

            qidiruv.value = "";

            qidiruv.blur();

            chiz();
        }
    }
);


/* =====================================================
   BOSHLANG‘ICH ISHGA TUSHIRISH
===================================================== */

temaYukla();

bugungiSana();

chiz();

statistika();

grafikChiz();
