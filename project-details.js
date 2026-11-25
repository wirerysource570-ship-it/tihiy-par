"use strict";

const roomTypes = {
  changing: { label: "Предбанник", color: "#e0eae4" },
  lounge: { label: "Комната отдыха", color: "#d3e4de" },
  steam: { label: "Парилка", color: "#e8c9a6" },
  wash: { label: "Моечная", color: "#bedbd8" },
  toilet: { label: "Санузел", color: "#d5e9e9" },
  deck: { label: "Открытая терраса", planLabel: "Терраса", color: "#f7f9f8" }
};

const projectDetails = {
  birch: {
    rooms: { changing: 3.5, wash: 2, steam: 4.5 },
    walls: "Каркас из сухой строганой сосны", facade: "Планкен из лиственницы",
    interior: "Вагонка из осины, полки из липы", floor: "Лиственница в предбаннике, нескользкий керамогранит в моечной",
    roof: "Двускатная, деревянные стропила и стальной фальц"
  },
  hero: {
    rooms: { changing: 4, lounge: 11, wash: 5, steam: 8, toilet: 2 },
    walls: "Каркас из сухой сосны", facade: "Тёмный планкен из лиственницы",
    interior: "Вагонка из термоосины, полки из липы", floor: "Керамогранит в мокрых зонах, лиственница в комнате отдыха",
    roof: "Двускатная, деревянные стропила и стальной фальц", insulation: "Каменная вата в стенах, полу и кровле"
  },
  lake: {
    rooms: { changing: 4, lounge: 12, wash: 4.5, steam: 8.5, deck: 10 },
    walls: "Каркас из сухой сосны", facade: "Маслёный планкен из лиственницы",
    interior: "Вагонка и полки из липы", floor: "Нескользкий керамогранит в моечной, террасная доска из лиственницы",
    roof: "Односкатная, деревянные стропила и стальной фальц"
  },
  frost: {
    rooms: { changing: 7, wash: 5, steam: 8 },
    walls: "Каркас из сухой ели", facade: "Графитовый планкен из термососны",
    interior: "Вагонка из осины, полки из термоосины", floor: "Нескользкий керамогранит в моечной, деревянный настил в парилке",
    roof: "Малоуклонная, по деревянным балкам с покрытием из ПВХ-мембраны", insulation: "Каменная вата в стенах, полу и кровле"
  },
  hill: {
    rooms: { changing: 6.5, wash: 3.5, steam: 7 },
    walls: "Каркас из сухой сосны", facade: "Светлый планкен из лиственницы",
    interior: "Вагонка из осины, полки из осины", floor: "Доска из лиственницы в предбаннике, нескользкий керамогранит в моечной",
    roof: "Двускатная, деревянные стропила и стальной фальц"
  },
  meadow: {
    rooms: { changing: 4, lounge: 16, wash: 6, steam: 10, toilet: 3, deck: 16 },
    walls: "Деревянный каркас на клеёных балках", facade: "Планкен из лиственницы под прозрачным маслом",
    interior: "Вагонка из липы, полки из термоосины", floor: "Керамогранит в моечной и санузле, настил из лиственницы на террасе",
    roof: "Малоуклонная, по деревянным балкам с покрытием из ПВХ-мембраны"
  },
  cedar: {
    rooms: { changing: 4.5, wash: 3, steam: 5.5 },
    walls: "Каркас из сухой сосны", facade: "Тёмный планкен из термососны",
    interior: "Вагонка из липы, полки из осины", floor: "Лиственница в предбаннике, нескользкий керамогранит в моечной",
    roof: "Двускатная, деревянные стропила и стальной фальц", insulation: "Каменная вата в стенах, полу и кровле"
  },
  barrel: {
    rooms: { changing: 3, steam: 5 },
    walls: "Профилированная доска из сибирской кедровой сосны, стальные обручи", facade: "Деревянный корпус под защитным маслом",
    interior: "Стены из кедровой сосны, полки из липы", floor: "Доска и съёмный настил из лиственницы",
    roof: "Радиусная, гибкая битумная черепица по деревянному корпусу"
  },
  pine: {
    rooms: { changing: 6, wash: 4, steam: 7, deck: 10 },
    walls: "Профилированный сосновый брус", facade: "Сосновый брус под защитным маслом",
    interior: "Вагонка из осины, полки из липы", floor: "Керамогранит в моечной, террасная доска из лиственницы",
    roof: "Двускатная, деревянные стропила и стальной фальц"
  },
  snow: {
    rooms: { changing: 5, lounge: 16, wash: 7, steam: 11, toilet: 4 },
    walls: "Каркас из сухой сосны", facade: "Тёмный планкен из лиственницы",
    interior: "Вагонка и полки из термоосины", floor: "Керамогранит в мокрых зонах, доска из лиственницы в комнате отдыха",
    roof: "Односкатная, деревянные стропила и стальной фальц", insulation: "Каменная вата в стенах, полу и кровле"
  },
  north: {
    rooms: { changing: 5, lounge: 20, wash: 7, steam: 12, toilet: 3, deck: 15 },
    walls: "Деревянный каркас на клеёных балках", facade: "Планкен из лиственницы под маслом",
    interior: "Вагонка из липы, полки из термоосины", floor: "Керамогранит в мокрых зонах, террасная доска из лиственницы",
    roof: "Двускатная, клеёные деревянные балки и стальной фальц", insulation: "Каменная вата в стенах, полу и кровле"
  },
  evening: {
    rooms: { changing: 6, wash: 5, steam: 9, deck: 12 },
    walls: "Каркас из сухой ели", facade: "Графитовый планкен из термососны",
    interior: "Вагонка из термоосины, полки из липы", floor: "Нескользкий керамогранит в моечной, настил из лиственницы на террасе",
    roof: "Малоуклонная, деревянные балки и покрытие из ПВХ-мембраны", insulation: "Каменная вата в стенах, полу и кровле"
  }
};

const formatArea = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const squareMetres = area => `${formatArea.format(area)} м²`;

function planRooms(rooms) {
  const width = 552;
  const height = 266;
  const inset = 24;
  const total = Object.values(rooms).reduce((sum, area) => sum + area, 0);
  const indoorHeight = height * (total - (rooms.deck ?? 0)) / total;
  const dryKeys = ["lounge", "changing"].filter(key => rooms[key]);
  const wetKeys = ["steam", "wash", "toilet"].filter(key => rooms[key]);
  const areaOf = keys => keys.reduce((sum, key) => sum + rooms[key], 0);
  const dryWidth = width * areaOf(dryKeys) / (areaOf(dryKeys) + areaOf(wetKeys));

  function column(keys, left, columnWidth) {
    let top = inset;
    return keys.map(key => {
      const roomHeight = indoorHeight * rooms[key] / areaOf(keys);
      const room = { key, x: left, y: top, w: columnWidth, h: roomHeight };
      top += roomHeight;
      return room;
    });
  }

  const dry = column(dryKeys, inset, dryWidth);
  const wet = column(wetKeys, inset + dryWidth, width - dryWidth);
  const outline = [...dry, ...wet];
  if (rooms.deck) outline.push({ key: "deck", x: inset, y: inset + indoorHeight, w: width, h: height - indoorHeight });

  const byRoom = Object.fromEntries(outline.map(room => [room.key, room]));
  const horizontalDoor = (x, y) => `M ${x - 12} ${y} h 24`;
  const verticalDoor = (x, y) => `M ${x} ${y - 10} v 20`;
  const changing = byRoom.changing;
  const wash = byRoom.wash ?? byRoom.steam;
  const doors = [horizontalDoor(changing.x + changing.w * .33, changing.y + changing.h)];
  if (byRoom.lounge) doors.push(horizontalDoor(changing.x + changing.w * .7, changing.y));
  if (byRoom.wash) doors.push(horizontalDoor(wash.x + wash.w * .25, wash.y));
  if (byRoom.toilet) doors.push(horizontalDoor(wash.x + wash.w * .25, wash.y + wash.h));
  const passageTop = Math.max(changing.y, wash.y);
  const passageBottom = Math.min(changing.y + changing.h, wash.y + wash.h);
  if (passageBottom - passageTop > 24) {
    doors.push(verticalDoor(wash.x, (passageTop + passageBottom) / 2));
  } else if (byRoom.lounge) {
    const lounge = byRoom.lounge;
    const loungeTop = Math.max(lounge.y, wash.y);
    const loungeBottom = Math.min(lounge.y + lounge.h, wash.y + wash.h);
    if (loungeBottom - loungeTop > 24) doors.push(verticalDoor(wash.x, (loungeTop + loungeBottom) / 2));
  }

  const shapes = outline.map(({ key, x, y, w, h }) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${roomTypes[key].color}" stroke-width="${key === "deck" ? 2 : 3.4}" ${key === "deck" ? 'stroke-dasharray="7 4"' : ""}/>
  `).join("");
  const labels = outline.map(({ key, x, y, w, h }) => {
    const label = roomTypes[key].planLabel ?? roomTypes[key].label;
    const area = squareMetres(rooms[key]);
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    if (h < 57) return `<text x="${centerX}" y="${centerY + 6}" font-size="18">${label} · ${area}</text>`;
    return `<text x="${centerX}" y="${centerY - 4}">${label}<tspan x="${centerX}" dy="24" font-size="18" font-weight="400">${area}</tspan></text>`;
  }).join("");

  return `<svg class="plan-drawing" viewBox="0 0 600 314" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#496766">${shapes}</g>
    <path d="${doors.join(" ")}" fill="none" stroke="#ebf0ee" stroke-width="5"/>
    <g fill="#172c2c" text-anchor="middle" font-size="21" font-weight="600">${labels}</g>
  </svg>`;
}

function projectSpecifications(project) {
  const details = projectDetails[project.image];
  const { rooms } = details;
  const rows = key => `<div><dt>${roomTypes[key].label}</dt><dd>${squareMetres(rooms[key])}</dd></div>`;
  const count = Object.values(rooms).reduce((sum, area) => sum + area, 0);
  const materialLabels = {
    walls: "Стены", facade: "Фасад", interior: "Отделка парилки", floor: "Пол", roof: "Крыша", insulation: "Утепление"
  };
  return `
    <section class="project-spec" data-plan-details hidden aria-labelledby="areas-heading">
      <h3 id="areas-heading">Площади помещений</h3>
      <dl class="spec-list">
        ${["changing", "steam", "wash", "lounge", "toilet", "deck"].filter(key => rooms[key]).map(rows).join("")}
        <div class="spec-total"><dt>Общая площадь${rooms.deck ? " с террасой" : ""}</dt><dd>${squareMetres(count)}</dd></div>
      </dl>
    </section>
    <section class="project-spec" aria-labelledby="materials-heading">
      <h3 id="materials-heading">Материалы</h3>
      <dl class="spec-list materials-list">
        ${Object.entries(materialLabels).filter(([key]) => details[key]).map(([key, label]) =>
          `<div><dt>${label}</dt><dd>${details[key]}</dd></div>`
        ).join("")}
      </dl>
    </section>
    <p class="project-note">Планировка и материалы приведены для примера. Схема показывает расположение помещений без строительных размеров.</p>`;
}
