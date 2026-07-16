// RETO NAVIDEÑO LÓGICA
let xmasLevel = 50;
let xmasChecked = {};
const xmasMonths = [
  ['AGOSTO', 4], ['SEPTIEMBRE', 4], ['OCTUBRE', 5], ['NOVIEMBRE', 4], ['DICIEMBRE', 5]
];

function buildXmas() {
  const container = document.getElementById('xmasWeeks');
  container.innerHTML = '';
  let weekNum = 1;

  xmasMonths.forEach(([monthName, count]) => {
    // Encabezado de Mes con estilo premium
    const monthHeader = document.createElement('div');
    monthHeader.className = 'xmas-month-header';
    monthHeader.style.gridColumn = '1 / -1';
    monthHeader.style.fontSize = '11px';
    monthHeader.style.fontWeight = '700';
    monthHeader.style.letterSpacing = '0.08em';
    monthHeader.style.color = 'var(--accent-solid)';
    monthHeader.style.marginTop = '14px';
    monthHeader.style.marginBottom = '4px';
    monthHeader.textContent = monthName;
    container.appendChild(monthHeader);

    for (let i = 0; i < count; i++) {
      const w = weekNum;
      const row = document.createElement('div');
      row.className = 'xmas-week';
      row.innerHTML = `
        <span class="xmas-week-label">Semana ${w < 10 ? '0' + w : w}</span>
        <span class="xmas-week-amt" id="xamt-${w}">RD$${fmt(w * xmasLevel)}</span>
        <span class="xmas-week-check" id="xbox-${w}"></span>
      `;
      row.addEventListener('click', () => {
        xmasChecked[w] = !xmasChecked[w];
        const checkbox = document.getElementById(`xbox-${w}`);
        checkbox.classList.toggle('checked', xmasChecked[w]);
        checkbox.textContent = xmasChecked[w] ? '✓' : '';
        renderXmasProgress();
      });
      container.appendChild(row);
      weekNum++;
    }
  });
  renderXmasProgress();
}

function renderXmasProgress() {
  let saved = 0;
  for (let i = 1; i <= 22; i++) {
    if (xmasChecked[i]) saved += i * xmasLevel;
  }
  const totalGoal = xmasLevel * 253;
  document.getElementById('xmasProgressNum').textContent = `RD$${fmt(saved)} de RD$${fmt(totalGoal)}`;
  const weeksLeft = 22 - Object.values(xmasChecked).filter(Boolean).length;
  document.getElementById('xmasProgressLbl').textContent = saved > 0
    ? `¡Sigue así! Te faltan ${weeksLeft} semanas`
    : 'Marca las semanas que ya depositaste';
}

document.querySelectorAll('.xmas-level').forEach(el => {
  el.addEventListener('click', () => {
    xmasLevel = parseInt(el.dataset.level);
    document.querySelectorAll('.xmas-level').forEach(l => l.classList.toggle('active', l === el));
    for (let w = 1; w <= 22; w++) {
      document.getElementById(`xamt-${w}`).textContent = `RD$${fmt(w * xmasLevel)}`;
    }
    renderXmasProgress();
  });
});
