const KALIT = "vazifalar";

const forma = document.getElementById("forma");
const matn = document.getElementById("matn");
const royxat = document.getElementById("royxat");
const hisob = document.getElementById("hisob");
const tozalash = document.getElementById("tozalash");
const sana = document.getElementById("sana");

let vazifalar = yukla();

function yukla() {
  try {
    return JSON.parse(localStorage.getItem(KALIT)) || [];
  } catch {
    return [];
  }
}

function saqla() {
  localStorage.setItem(KALIT, JSON.stringify(vazifalar));
}

function chiz() {
  royxat.innerHTML = "";

  if (vazifalar.length === 0) {
    const bosh = document.createElement("li");
    bosh.className = "bosh";
    bosh.textContent = "Hozircha vazifa yo'q. Birinchisini qo'shing!";
    royxat.appendChild(bosh);
  }

  vazifalar.forEach((v) => {
    const li = document.createElement("li");
    if (v.bajarilgan) li.classList.add("bajarilgan");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = v.bajarilgan;
    check.addEventListener("change", () => {
      v.bajarilgan = check.checked;
      saqla();
      chiz();
    });

    const matnEl = document.createElement("span");
    matnEl.textContent = v.matn; // textContent: xavfsiz, HTML sifatida o'qilmaydi

    const ochir = document.createElement("button");
    ochir.className = "ochir";
    ochir.textContent = "×";
    ochir.title = "O'chirish";
    ochir.addEventListener("click", () => {
      vazifalar = vazifalar.filter((x) => x.id !== v.id);
      saqla();
      chiz();
    });

    li.append(check, matnEl, ochir);
    royxat.appendChild(li);
  });

  const bajarilgan = vazifalar.filter((v) => v.bajarilgan).length;
  hisob.textContent = `${bajarilgan} / ${vazifalar.length} bajarildi`;
}

forma.addEventListener("submit", (e) => {
  e.preventDefault();
  const qiymat = matn.value.trim();
  if (!qiymat) return;
  vazifalar.push({ id: Date.now(), matn: qiymat, bajarilgan: false });
  matn.value = "";
  saqla();
  chiz();
});

tozalash.addEventListener("click", () => {
  vazifalar = vazifalar.filter((v) => !v.bajarilgan);
  saqla();
  chiz();
});

sana.textContent = new Date().toLocaleDateString("uz-UZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

chiz();
