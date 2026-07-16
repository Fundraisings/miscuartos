const categories = {
  vivienda:   { label: 'Vivienda', color: '#1F7A5C', wFijo: 0.25, wVariable: 0.23, maxRec: 0.35, tip: 'Alquiler, luz, agua, internet. Intenta no pasar del 35%.' },
  comida:     { label: 'Comida', color: '#3E9C77', wFijo: 0.13, wVariable: 0.13, tip: 'Supermercado y compras fijas de alimentos.' },
  transporte: { label: 'Transporte', color: '#6BBE9A', wFijo: 0.08, wVariable: 0.08, tip: 'Combustible, concho y mantenimiento básico.' },
  colegio:    { label: 'Niños / Escuela', color: '#2D8ACE', wFijo: 0.09, wVariable: 0.09, tip: 'Mensualidades escolares y cuidado.' },
  salud:      { label: 'Salud', color: '#3AA0A0', wFijo: 0.04, wVariable: 0.05, tip: 'Medicamentos y consultas médicas fijas.' },
  seguros:    { label: 'Seguros', color: '#4C6B8A', wFijo: 0.05, wVariable: 0.04, tip: 'Cualquier póliza médica o de vehículo.' },
  mascotas:   { label: 'Mascotas', color: '#C2447A', wFijo: 0.05, wVariable: 0.04, tip: 'Comida y cuidados veterinarios.' },
  deudas:     { label: 'Deudas', color: '#8B5CF6', wFijo: 0.10, wVariable: 0.09, maxRec: 0.20, tip: 'Tarjetas o préstamos. Ataca la de mayor interés.' },
  ahorro:     { label: 'Ahorro', color: '#B4432A', wFijo: 0.13, wVariable: 0.19, tip: 'Tu colchón de tranquilidad. Míralo como factura obligatoria.' },
  familia:    { label: 'Remesas / Apoyo', color: '#E8A33D', wFijo: 0.04, wVariable: 0.03, tip: 'Dinero fijo enviado a padres o familiares.' },
  diversion:  { label: 'Diversión', color: '#66766D', wFijo: 0.04, wVariable: 0.03, tip: 'Salidas y gustos. Pequeño pero necesario para no rendirte.' }
};

let selected = new Set();
let locked = {};
let incomeType = 'fijo';

const VIDEO_LINKS = {
  tutorial: '', 
  afp: '',
  curso1: '',
  kids: '',
  retoXmas: ''
};

const leaks = [
  { id: 'lista', text: 'Ir al súper sin lista escrita', amount: 1500 },
  { id: 'comida', text: 'Comer fuera en el trabajo frecuentemente', amount: 2500 },
  { id: 'recargas', text: 'Comprar recargas sueltas en vez de paquetes', amount: 600 },
  { id: 'subs', text: 'Suscripciones que no usas pero sigues pagando', amount: 800 }
];
let leakChecked = {};

const kidsTasks = [
  { id: 'frasco', text: 'Ahorrar 3 monedas de tu mesada en un frasco transparente.' },
  { id: 'vender', text: 'Vender algo propio que ya no uses (a un familiar o vecino).' },
  { id: 'tarea', text: 'Haz una labor extra en casa a cambio de una "paga".' },
  { id: 'inventar', text: 'Inventar algo simple para vender un día (limonada, pulseras).' },
  { id: 'regalo', text: 'Al recibir dinero de regalo, guarda la mitad antes de gastar.' },
  { id: 'adulto', text: 'Cuéntale a un adulto qué harías si tuvieras tu propio negocio.' }
];
let kidsChecked = {};

// BOTÓN PARA ENTRAR DESDE EL SPLASH SCREEN
if (document.getElementById('enterAppBtn')) {
  document.getElementById('enterAppBtn').addEventListener('click', () => {
    const splash = document.getElementById('app-splash');
    const mainApp = document.getElementById('mainAppContainer');
    
    splash.classList.add('fade-out');
    mainApp.style.display = 'flex';
    
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
    
    lazyLoadVideos();
  });
}

// NAVEGACIÓN TABS
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`pane-${btn.dataset.tab}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lazyLoadVideos();
  });
});

function lazyLoadVideos() {
  const splash = document.getElementById('app-splash');
  if (splash && splash.style.display === 'none') {
    if (document.getElementById('pane-presupuesto').classList.contains('active') && VIDEO_LINKS.tutorial) {
      document.getElementById('embed-tutorial').innerHTML = `<iframe src="${VIDEO_LINKS.tutorial}" allowfullscreen></iframe>`;
    }
    if (document.getElementById('pane-reto').classList.contains('active') && VIDEO_LINKS.retoXmas) {
      document.getElementById('embed-reto-xmas').innerHTML = `<iframe src="${VIDEO_LINKS.retoXmas}" allowfullscreen></iframe>`;
    }
    if (document.getElementById('pane-academia').classList.contains('active')) {
      if (VIDEO_LINKS.afp) document.getElementById('embed-afp').innerHTML = `<iframe src="${VIDEO_LINKS.afp}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.curso1) document.getElementById('embed-curso').innerHTML = `<iframe src="${VIDEO_LINKS.curso1}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.kids && document.getElementById('kidsFull').classList.contains('show')) {
        document.getElementById('embed-kids').innerHTML = `<iframe src="${VIDEO_LINKS.kids}" allowfullscreen></iframe>`;
      }
    }
  }
}

// PRESUPUESTO LÓGICA
const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const extraIncomeEl = document.getElementById('extraIncome');
const countTag = document.getElementById('countTag');

function buildChips() {
  if (!chipsEl) return;
  chipsEl.innerHTML = '';
  Object.entries(categories).forEach(([key, cat]) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<span class="dot"></span>${cat.label}`;
    chip.addEventListener('click', () => {
      if (selected.has(key)) { selected.delete(key); delete locked[key]; }
      else { selected.add(key); }
      chip.classList.toggle('active');
      render();
    });
    chipsEl.appendChild(chip);
  });
}

function getIncome() {
  if (!incomeEl) return 0;
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

function getExtraIncome() {
  if (!extraIncomeEl) return 0;
  const e = parseFloat(extraIncomeEl.value);
  return isNaN(e) || e < 0 ? 0 : e;
}

function computeAmounts() {
  const income = getIncome() + getExtraIncome();
  const amounts = {};
  let lockedSum = 0;
  let unlockedWeightSum = 0;

  selected.forEach(key => {
    if (locked[key] != null) lockedSum += locked[key];
    else unlockedWeightSum += (incomeType === 'variable' ? categories[key].wVariable : categories[key].wFijo);
  });

  let remaining = income - lockedSum;
  if (remaining < 0) remaining = 0;

  selected.forEach(key => {
    if (locked[key] != null) amounts[key] = locked[key];
    else {
      const w = unlockedWeightSum > 0 ? (incomeType === 'variable' ? categories[key].wVariable : categories[key].wFijo) / unlockedWeightSum : 0;
      amounts[key] = remaining * w;
    }
  });
  return { amounts, income };
}

function fmt(n) { return n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }

function render() {
  if (!countTag) return;
  countTag.textContent = `${selected.size} seleccionado${selected.size === 1 ? '' : 's'}`;
  if (selected.size === 0) {
    resultsEl.innerHTML = `<div class="empty" style="text-align:center; font-size:13px; color:var(--muted); padding:20px; border:1px dashed var(--line); border-radius:12px; margin-top: 14px;">Marca qué pagarás este mes para armar la sugerencia.</div>`;
    return;
  }

  const { amounts, income } = computeAmounts();
  const total = Object.values(amounts).reduce((a, b) => a + b, 0);

  let html = `<div class="bar"><div class="bar-seg" style="width:${income > 0 ? (total / income * 100) : 0}%; background:var(--accent-solid)"></div></div>`;
  html += `<div class="bar-caption"><span>RD$${fmt(total)} asignados</span><span>de RD$${fmt(income)}</span></div>`;

  selected.forEach(key => {
    const cat = categories[key];
    const amt = amounts[key] || 0;
    const isLocked = locked[key] != null;
    html += `
      <div class="cat-card" style="margin-top:12px;">
        <div class="cat-top">
          <div style="font-weight:600; font-size:14px; margin-bottom: 2px;">${cat.label}</div>
          <div class="pct" style="font-size:11.5px; color:var(--muted); line-height: 1.3;">${cat.tip}</div>
        </div>
        <div class="cat-bottom">
          <span class="amt-currency">RD$</span>
          <input class="amt-input" type="number" data-key="${key}" value="${amt.toFixed(0)}">
          ${isLocked ? `<button class="reset-btn" data-reset="${key}" style="padding: 4px 8px; font-size: 11px; background: var(--line); border: none; border-radius: 4px; color: var(--ink); cursor: pointer;">Auto</button>` : ''}
        </div>
      </div>`;
  });

  html += `<button class="summary-btn" id="summaryBtn">Ver mi resumen →</button>`;
  resultsEl.innerHTML = html;

  resultsEl.querySelectorAll('.amt-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value);
      locked[key] = isNaN(val) ? 0 : val;
      render();
    });
  });

  resultsEl.querySelectorAll('[data-reset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      delete locked[e.target.dataset.reset];
      render();
    });
  });

  document.getElementById('summaryBtn').addEventListener('click', openSummary);
}

function openSummary() {
  const { amounts, income } = computeAmounts();
  const total = Object.values(amounts).reduce((a, b) => a + b, 0);
  document.getElementById('summaryTotal').textContent = `RD$${fmt(total)}`;
  let rows = '';
  selected.forEach(key => {
    rows += `<div class="summary-row"><span>${categories[key].label}</span><strong>RD$${fmt(amounts[key])}</strong></div>`;
  });
  document.getElementById('summaryRows').innerHTML = rows;
  document.getElementById('modalOverlay').classList.add('show');
}

if (document.getElementById('closeModal')) {
  document.getElementById('closeModal').addEventListener('click', () => document.getElementById('modalOverlay').classList.remove('show'));
}

// DINERO OCULTO
function buildLeaks() {
  const box = document.getElementById('leakItems');
  if (!box) return;
  box.innerHTML = '';
  leaks.forEach(l => {
    const item = document.createElement('div');
    item.className = 'leak-item';
    item.innerHTML = `<span class="leak-checkbox" id="lbox-${l.id}"></span><span class="leak-text">${l.text} (~RD$${fmt(l.amount)}/mes)</span>`;
    item.addEventListener('click', () => {
      leakChecked[l.id] = !leakChecked[l.id];
      const checkbox = document.getElementById(`lbox-${l.id}`);
      checkbox.classList.toggle('checked', leakChecked[l.id]);
      checkbox.textContent = leakChecked[l.id] ? '✓' : '';
      const totalLeak = leaks.reduce((s, curr) => s + (leakChecked[curr.id] ? curr.amount : 0), 0);
      document.getElementById('leakAmount').textContent = `~RD$${fmt(totalLeak)}/mes`;
      document.getElementById('leakMsg').textContent = totalLeak > 0 ? 'Esos cuartos se te van sin darte cuenta. Frenar un par te da control directo.' : '';
    });
    box.appendChild(item);
  });
}

// RETO NAVIDEÑO
let xmasLevel = 50;
let xmasChecked = {};
const xmasMonths = [['AGOSTO', 4], ['SEPTIEMBRE', 4], ['OCTUBRE', 5], ['NOVIEMBRE', 4], ['DICIEMBRE', 5]];

function buildXmas() {
  const container = document.getElementById('xmasWeeks');
  if (!container) return;
  container.innerHTML = '';
  let weekNum = 1;
  xmasMonths.forEach(([monthName, count]) => {
    const monthHeader = document.createElement('div');
    monthHeader.className = 'xmas-month-header';
    monthHeader.style.gridColumn = '1 / -1';
    monthHeader.style.fontSize = '11px';
    monthHeader.style.fontWeight = '700';
    monthHeader.style.letterSpacing = '0.08em';
    monthHeader.style.color = 'var(--brand-orange)';
    monthHeader.style.marginTop = '14px';
    monthHeader.style.marginBottom = '4px';
    monthHeader.textContent = monthName;
    container.appendChild(monthHeader);

    for (let i = 0; i < count; i++) {
      const w = weekNum;
      const row = document.createElement('div');
      row.className = 'xmas-week';
      row.innerHTML = `<span class="xmas-week-label">Semana ${w < 10 ? '0' + w : w}</span><span class="xmas-week-amt" id="xamt-${w}">RD$${fmt(w * xmasLevel)}</span><span class="xmas-week-check" id="xbox-${w}"></span>`;
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
  document.getElementById('xmasProgressLbl').textContent = saved > 0 ? `¡Sigue así! Te faltan ${weeksLeft} semanas` : 'Marca las semanas que ya depositaste';
}

document.querySelectorAll('.xmas-level').forEach(el => {
  el.addEventListener('click', () => {
    xmasLevel = parseInt(el.dataset.level);
    document.querySelectorAll('.xmas-level').forEach(l => l.classList.toggle('active', l === el));
    for (let w = 1; w <= 22; w++) {
      const amtEl = document.getElementById(`xamt-${w}`);
      if (amtEl) amtEl.textContent = `RD$${fmt(w * xmasLevel)}`;
    }
    renderXmasProgress();
  });
});

// SIMULADOR AFP
if (document.getElementById('afpSalario')) {
  document.getElementById('afpSalario').addEventListener('input', (e) => {
    const salario = parseFloat(e.target.value);
    const res = document.getElementById('afpSimResult');
    if (!salario || salario <= 0) { res.classList.remove('show'); return; }
    res.innerHTML = `Tu retención mensual es de <b>RD$${fmt(salario * 0.0287)}</b>. Tu empleador aporta obligatoriamente otros <b>RD$${fmt(salario * 0.0710)}</b> adicionales que van directos a tu fondo.`;
    res.classList.add('show');
  });
}

// INTERACCIONES UPSELL NIÑOS
if (document.getElementById('kidsUnlockBtn')) {
  document.getElementById('kidsUnlockBtn').addEventListener('click', () => {
    document.getElementById('kidsPreview').style.display = 'none';
    document.getElementById('kidsFull').classList.add('show');
    const taskBox = document.getElementById('kidsTasks');
    taskBox.innerHTML = '';
    kidsTasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'kids-task';
      item.innerHTML = `<span class="kids-task-check" id="kbox-${t.id}"></span><span class="kids-task-text">${t.text}</span>`;
      item.addEventListener('click', () => {
        kidsChecked[t.id] = !kidsChecked[t.id];
        document.getElementById(`kbox-${t.id}`).classList.toggle('checked', kidsChecked[t.id]);
        document.getElementById(`kbox-${t.id}`).textContent = kidsChecked[t.id] ? '✓' : '';
        const done = Object.values(kidsChecked).filter(Boolean).length;
        document.getElementById('kidsProgress').textContent = `${done} de 6 retos completados`;
      });
      taskBox.appendChild(item);
    });
    lazyLoadVideos();
  });
}

// CONTROL DE TIPO DE INGRESO
document.querySelectorAll('.type-btn').forEach(b => {
  b.addEventListener('click', () => {
    incomeType = b.dataset.type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.toggle('active', btn === b));
    document.getElementById('variableBanner').classList.toggle('show', incomeType === 'variable');
    render();
  });
});

// INICIALIZADORES AL CARGAR
buildChips();
buildLeaks();
buildXmas();

if (incomeEl) {
  incomeEl.addEventListener('input', render);
}
if (extraIncomeEl) {
  extraIncomeEl.addEventListener('input', render);
}

render();
