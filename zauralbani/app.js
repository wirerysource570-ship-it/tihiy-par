"use strict";

const capacities = [
  { value: "2", label: "1–2", people: "1–2 человека", price: 480000, insulation: 95000 },
  { value: "4", label: "4", people: "до 4 человек", price: 640000, insulation: 125000 },
  { value: "6", label: "6", people: "до 6 человек", price: 860000, insulation: 165000 },
  { value: "8", label: "8", people: "до 8 человек", price: 1100000, insulation: 220000 },
  { value: "large", label: "Большая компания", people: "9–14 человек", price: 1480000, insulation: 285000 }
];

const seasons = [
  { value: "winter", label: "Тёплая, круглый год", tag: "Тёплая" },
  { value: "summer", label: "Летняя", tag: "Летняя" }
];

const stoves = [
  { value: "wood", label: "Дровяная", price: 0 },
  { value: "electric", label: "Электрическая", price: 35000 }
];

const extras = [
  { value: "glass", label: "Панорамное окно", price: 85000 },
  { value: "deck", label: "Открытая терраса", price: 125000 },
  { value: "lounge", label: "Комната отдыха", price: 180000 },
  { value: "tub", label: "Купель", price: 165000 }
];

const projects = [
  { name: "Берёза", capacity: "2", season: "summer", size: 10, image: "birch", extras: ["glass"], description: "Компактная парная с видом на сад. Светлое дерево, широкое окно и небольшая площадка перед входом." },
  { name: "Хвоя", capacity: "6", season: "winter", size: 30, image: "hero", extras: ["glass", "lounge"], description: "Утеплённая баня с тёмным фасадом, панорамным окном и отдельной комнатой, где можно отдохнуть между заходами." },
  { name: "Озеро", capacity: "8", season: "summer", size: 39, image: "lake", extras: ["deck", "lounge"], description: "Просторная баня с террасой для длинных летних вечеров. В комнате отдыха можно собрать всю компанию за одним столом." },
  { name: "Иней", capacity: "4", season: "winter", size: 20, image: "frost", extras: ["glass"], description: "Лаконичная баня с плоской кровлей и панорамным окном. Подойдёт для семейных выходных за городом круглый год." },
  { name: "Луговая", capacity: "4", season: "summer", size: 17, image: "hill", extras: [], description: "Небольшая двускатная баня из светлого дерева с парной и компактной зоной для переодевания." },
  { name: "Тёплый берег", capacity: "large", season: "summer", size: 55, image: "meadow", extras: ["deck", "lounge", "tub"], description: "Банный павильон с комнатой отдыха, террасой и уличной купелью для встреч большой компанией." },
  { name: "Кедр", capacity: "2", season: "winter", size: 13, image: "cedar", extras: ["glass"], description: "Утеплённая баня с большим окном. Подходит для небольшой дачи и спокойных вечеров вдвоём." },
  { name: "Бочка", capacity: "2", season: "summer", size: 8, image: "barrel", extras: [], description: "Круглая деревянная баня для небольшого участка. Внутри парная и место для переодевания." },
  { name: "Сосны", capacity: "6", season: "summer", size: 27, image: "pine", extras: ["deck"], description: "Летняя баня с просторной парной и открытой террасой, где можно остыть после пара." },
  { name: "Первый снег", capacity: "8", season: "winter", size: 43, image: "snow", extras: ["glass", "lounge"], description: "Тёплая баня для дружеских встреч. За широким окном — сад, внутри — парная и комната отдыха." },
  { name: "Север", capacity: "large", season: "winter", size: 62, image: "north", extras: ["deck", "lounge", "glass"], description: "Всесезонный банный дом с большой парной, комнатой отдыха и террасой. Планировка рассчитана на 9–14 гостей." },
  { name: "Вечерняя", capacity: "6", season: "winter", size: 32, image: "evening", extras: ["glass", "deck"], description: "Утеплённая баня с панорамным остеклением и террасой. После парной удобно выйти на прохладный воздух." }
];

const rubles = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const money = value => rubles.format(value);
const byId = id => document.getElementById(id);
const findOption = (options, value) => options.find(option => option.value === value);

function optionsFor(container, name, options, initial) {
  container.innerHTML = options.map(({ value, label }) => `
    <label class="chip"><input type="radio" name="${name}" value="${value}" ${value === initial ? "checked" : ""}><span>${label}</span></label>
  `).join("");
}

function selectOptions(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` +
    options.map(({ value, label }) => `<option value="${value}">${label}</option>`).join("");
}

function breakdown(capacityValue, seasonValue, stoveValue, extraValues) {
  const capacity = findOption(capacities, capacityValue);
  const season = findOption(seasons, seasonValue);
  const stove = findOption(stoves, stoveValue);
  return [
    { label: `База · ${capacity.people}`, price: capacity.price },
    { label: season.label, price: season.value === "winter" ? capacity.insulation : 0 },
    { label: `Печь · ${stove.label.toLowerCase()}`, price: stove.price },
    ...extras.filter(extra => extraValues.includes(extra.value))
  ];
}

const totalFor = items => items.reduce((total, { price }) => total + price, 0);
const projectPrice = project => totalFor(breakdown(project.capacity, project.season, "wood", project.extras));

const grid = byId("project-grid");
const seasonFilter = byId("catalog-season");
const capacityFilter = byId("catalog-capacity");
const moreButton = byId("catalog-more");
const pageSize = 6;
let visibleCount = pageSize;

function projectCard(project) {
  const capacity = findOption(capacities, project.capacity);
  const season = findOption(seasons, project.season);
  return `
    <article class="card">
      <button class="card-button" type="button" data-project="${projects.indexOf(project)}" aria-label="Подробнее о проекте «${project.name}»">
        <div class="card-media">
          <img src="photos/examples/${project.image}.webp" alt="" loading="lazy" width="840" height="560">
          <span class="card-tag">${season.tag}</span>
        </div>
        <div class="card-body">
          <h3>${project.name}</h3>
          <p class="card-info">${capacity.people} · ${project.size} м²</p>
          <div class="card-bottom"><strong>от ${money(projectPrice(project))}</strong><span>Подробнее</span></div>
        </div>
      </button>
    </article>`;
}

function renderCatalog() {
  const filtered = projects.filter(project =>
    (!seasonFilter.value || project.season === seasonFilter.value) &&
    (!capacityFilter.value || project.capacity === capacityFilter.value)
  );
  grid.innerHTML = filtered.length
    ? filtered.slice(0, visibleCount).map(projectCard).join("")
    : '<p class="catalog-empty">По этим условиям проектов нет. Измените вместимость или сезон.</p>';
  byId("catalog-count").textContent = `Показано ${Math.min(visibleCount, filtered.length)} из ${filtered.length}`;
  byId("reset-filters").hidden = !seasonFilter.value && !capacityFilter.value;
  moreButton.hidden = filtered.length <= visibleCount;
}

function applyFilters() {
  visibleCount = pageSize;
  renderCatalog();
}

selectOptions(capacityFilter, capacities.map(option => ({ ...option, label: option.people })), "Любая");
selectOptions(seasonFilter, seasons, "Любой");
byId("filters").addEventListener("change", applyFilters);
byId("filters").addEventListener("reset", event => {
  event.preventDefault();
  seasonFilter.value = "";
  capacityFilter.value = "";
  applyFilters();
  capacityFilter.focus();
});
moreButton.addEventListener("click", () => {
  const firstNewIndex = visibleCount;
  visibleCount += pageSize;
  renderCatalog();
  grid.querySelectorAll(".card-button")[firstNewIndex]?.focus();
});
renderCatalog();

const quiz = byId("quiz");
const heroPick = byId("hero-pick");
const quizForm = byId("quiz-form");
optionsFor(byId("quiz-capacity"), "capacity", capacities, "4");
optionsFor(byId("quiz-season"), "season", seasons, "winter");

function hideQuiz() {
  quiz.hidden = true;
  heroPick.hidden = false;
}

byId("quiz-close").addEventListener("click", () => {
  hideQuiz();
  heroPick.focus();
});
document.querySelectorAll("[data-quiz]").forEach(button => {
  button.addEventListener("click", () => {
    quiz.hidden = false;
    heroPick.hidden = true;
    quiz.querySelector("input:checked").focus({ preventScroll: true });
    quiz.scrollIntoView({ block: "nearest" });
  });
});
quizForm.addEventListener("submit", event => {
  event.preventDefault();
  const selection = new FormData(quizForm);
  capacityFilter.value = selection.get("capacity");
  seasonFilter.value = selection.get("season");
  applyFilters();
  hideQuiz();
  location.hash = "catalog";
  capacityFilter.focus({ preventScroll: true });
  byId("catalog").scrollIntoView();
});

const builderForm = byId("builder-form");
optionsFor(byId("builder-capacity"), "capacity", capacities);
optionsFor(byId("builder-season"), "season", seasons);
optionsFor(byId("builder-stove"), "stove", stoves);
const construction = createConstructionScene(byId("build-scene"));
byId("builder-extras").innerHTML = extras.map(({ value, label, price }) => `
  <label class="extra"><input type="checkbox" name="extras" value="${value}"><span>${label}</span><small>+${money(price)}</small></label>
`).join("");

function currentEstimate() {
  const data = new FormData(builderForm);
  return breakdown(data.get("capacity"), data.get("season"), data.get("stove"), data.getAll("extras"));
}

function renderEstimate() {
  const data = new FormData(builderForm);
  const capacity = findOption(capacities, data.get("capacity"));
  const size = construction.update(data);
  const ready = Boolean(capacity);
  byId("clear-build").hidden = !ready;
  byId("save-estimate").disabled = !ready;
  byId("scene-title").textContent = ready ? `Баня · ${capacity.people}` : "Пустая площадка";
  byId("scene-detail").textContent = ready ? `Базовый модуль ≈ ${size} м · эскиз` : "Выберите вместимость";
  byId("build-scene").setAttribute("aria-label", ready ? [
    byId("scene-title").textContent, byId("scene-detail").textContent,
    findOption(seasons, data.get("season")).label,
    `${findOption(stoves, data.get("stove")).label} печь`,
    ...data.getAll("extras").map(value => findOption(extras, value).label)
  ].join(", ") : "Пустая площадка для бани");
  if (!ready) {
    byId("estimate-total").textContent = "—";
    byId("estimate-items").replaceChildren();
    return;
  }
  const items = currentEstimate();
  byId("estimate-total").textContent = money(totalFor(items));
  byId("estimate-items").innerHTML = items.map(({ label, price }) =>
    `<li><span>${label}</span><span>${price ? money(price) : "включено"}</span></li>`
  ).join("");
}

builderForm.addEventListener("change", () => {
  for (const [name, initial] of [["capacity", "4"], ["season", "summer"], ["stove", "wood"]]) {
    if (!builderForm.elements[name].value) builderForm.elements[name].value = initial;
  }
  renderEstimate();
});
byId("clear-build").addEventListener("click", () => {
  builderForm.reset();
  renderEstimate();
  builderForm.querySelector("input").focus({ preventScroll: true });
});
renderEstimate();

byId("save-estimate").addEventListener("click", () => {
  const items = currentEstimate();
  const file = new Blob([
    "\uFEFFЗа Урал Бани — предварительный расчёт\r\n\r\n",
    ...items.map(({ label, price }) => `${label} — ${price ? money(price) : "включено"}\r\n`),
    `\r\nИтого: ${money(totalFor(items))}\r\n`,
    "Демо-цены. Доставка, фундамент и работы на участке считаются отдельно.\r\n"
  ], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "За Урал Бани — расчёт.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const dialog = byId("project-dialog");
let activeProject;
let activeSlide = "photo";
let motionGallery;
let galleryModule;

function showProjectSlide(slide, direction = slide === "plan" ? 1 : -1) {
  const switching = activeSlide !== slide;
  activeSlide = slide;
  if (motionGallery) {
    if (switching) motionGallery.show(slide, direction, true);
  } else {
    dialog.querySelectorAll("[data-slide]").forEach(panel => {
      panel.hidden = panel.dataset.slide !== slide;
    });
  }
  dialog.querySelectorAll("[data-show-slide]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.showSlide === slide));
  });
  dialog.querySelector("[data-plan-details]").hidden = slide !== "plan";
}

function switchProjectSlide(direction) {
  showProjectSlide(activeSlide === "photo" ? "plan" : "photo", direction);
}

function enableGallerySwipe(gallery) {
  let start;
  gallery.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    gallery.setPointerCapture(event.pointerId);
  });
  gallery.addEventListener("pointerup", event => {
    if (event.pointerId !== start?.id) return;
    const movement = event.clientX - start.x;
    const distance = Math.abs(movement);
    const drift = Math.abs(event.clientY - start.y);
    start = undefined;
    if (distance >= 40 && distance > drift * 1.3) switchProjectSlide(-Math.sign(movement));
  });
  gallery.addEventListener("lostpointercapture", () => { start = undefined; });
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-project]");
  if (!button) return;
  motionGallery?.destroy();
  motionGallery = undefined;
  activeProject = projects[Number(button.dataset.project)];
  const { name, capacity, season, image, size, description } = activeProject;
  const source = ["hill", "cedar", "barrel"].includes(image)
    ? { name: "Wooden Planet", url: "https://wooden-planet.ru/" }
    : { name: "Fresh Баня", url: "https://freshbania.ru/foto" };
  byId("dialog-content").innerHTML = `
    <div class="project-gallery" id="project-gallery" role="group" aria-label="Фото и планировка">
      <div class="gallery-slide" data-slide="photo">
        <img class="dialog-photo" src="photos/examples/${image}.webp" alt="Пример внешнего вида для планировки «${name}»" width="840" height="560" draggable="false">
      </div>
      <div class="gallery-slide plan-slide" data-slide="plan" hidden>
        ${planRooms(projectDetails[image].rooms)}
      </div>
    </div>
    <div class="gallery-controls" role="group" aria-label="Выбор изображения">
      <button type="button" data-show-slide="photo" aria-pressed="true" aria-controls="project-gallery">Фото</button>
      <button type="button" data-show-slide="plan" aria-pressed="false" aria-controls="project-gallery">Планировка</button>
    </div>
    <div class="dialog-body">
      <h2 id="project-title">${name}</h2>
      <p class="card-info">${findOption(capacities, capacity).people} · ${squareMetres(size)}${projectDetails[image].rooms.deck ? " с террасой" : ""} · ${findOption(seasons, season).tag}</p>
      <p>${description}</p>
      <p class="card-info">Фото для примера · <a href="${source.url}" target="_blank" rel="noopener">${source.name}</a></p>
      ${projectSpecifications(activeProject)}
      <p><strong>от ${money(projectPrice(activeProject))}</strong></p>
      <button class="button button-dark" type="button" data-build-project>Изменить комплектацию</button>
    </div>`;
  const gallery = byId("project-gallery");
  enableGallerySwipe(gallery);
  showProjectSlide("photo");
  dialog.showModal();
  byId("dialog-content").scrollTop = 0;
  galleryModule ??= import("../gallery-motion.js").catch(() => null);
  galleryModule.then(module => {
    if (!module || !dialog.open || !gallery.isConnected) return;
    motionGallery = module.mountMotionGallery(gallery);
    motionGallery.show(activeSlide, 1, false);
  });
});

const closeProject = byId("dialog-close");
closeProject.addEventListener("click", () => dialog.close());
closeProject.addEventListener("touchend", event => {
  const touch = event.changedTouches[0];
  const bounds = closeProject.getBoundingClientRect();
  if (touch.clientX >= bounds.left && touch.clientX <= bounds.right &&
      touch.clientY >= bounds.top && touch.clientY <= bounds.bottom) {
    event.preventDefault();
    dialog.close();
  }
}, { passive: false });
dialog.addEventListener("keydown", event => {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    switchProjectSlide(event.key === "ArrowRight" ? 1 : -1);
  }
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
  const slideButton = event.target.closest("[data-show-slide]");
  if (slideButton) showProjectSlide(slideButton.dataset.showSlide);
  if (!event.target.closest("[data-build-project]")) return;
  builderForm.elements.capacity.value = activeProject.capacity;
  builderForm.elements.season.value = activeProject.season;
  builderForm.elements.stove.value = "wood";
  builderForm.querySelectorAll("[name='extras']").forEach(input => {
    input.checked = activeProject.extras.includes(input.value);
  });
  renderEstimate();
  dialog.close();
  location.hash = "builder";
  builderForm.querySelector("input:checked").focus({ preventScroll: true });
  byId("builder").scrollIntoView();
});

const menuToggle = document.querySelector(".menu-toggle");
const menu = byId("navigation");
menuToggle.addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", String(menu.classList.toggle("open")));
});
menu.addEventListener("click", event => {
  if (event.target.closest("a")) {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
