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

// 🔴 COLOCA AQUÍ TUS LINKS DE EMBED DE YOUTUBE O VIMEO
const VIDEO_LINKS = {
  tutorial: '', // Ejemplo: 'https://www.youtube.com/embed/TU_ID'
  afp: '',
  curso1: '',
  kids: ''
};

const leaks = [
  { id: 'lista', text: 'Ir al súper sin lista escrita', amount: 30 },
  { id: 'comida', text: 'Comer fuera en horario laboral frecuentemente', amount: 40 },
  { id: 'recargas', text: 'Comprar recargas sueltas en vez de paquitos', amount: 12 },
  { id: 'subs', text: 'Suscripciones streaming que no usas', amount: 10 }
];
let leakChecked = {};

const kidsTasks = [
  { id: 'frasco', text: 'Ahorrar 3 monedas de la mesada en un pote claro.' },
  { id: 'vender', text: 'Vender un juguete o ropa que ya no use.' },
  { id: 'tarea', text: 'Hacer un mandado o labor extra por un incentivo.' }
];
let kidsChecked = {};

// SISTEMA DE NAVEGACIÓN ENTRE PÁGINAS (TABS)
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    const tabName = btn.dataset.tab;
    document.getElementById(`pane-${tabName}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Activar los reproductores cuando la pestaña se abra
    lazyLoadVideos();
  });
});

function lazyLoadVideos() {
  if (document.getElementById('pane-presupuesto').classList.contains('active') && VIDEO_LINKS.tutorial) {
    document.getElementById('embed-tutorial').innerHTML = `<iframe src="${VIDEO_LINKS.tutorial}" allowfullscreen></iframe>`;
  }
  if (document.getElementById('pane-academia').classList.contains('active')) {
    if (VIDEO_LINKS.afp) document.getElementById('embed-afp').innerHTML = `<iframe src="${VIDEO_LINKS.afp}" allowfullscreen></iframe>`;
    if (VIDEO_LINKS.curso1) document.getElementById('embed-curso').innerHTML = `<iframe src="${VIDEO_LINKS.curso1}" allowfullscreen></iframe>`;
    if (VIDEO_LINKS.kids && document.getElementById('kidsFull').classList.contains('show')) {
      document.getElementById('embed-kids').innerHTML = `<iframe src="${VIDEO_LINKS.kids}" allowfullscreen></iframe>`;
    }
  }
}

// LÓGICA DE PRESUPUESTO
const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const countTag = document.getElementById('countTag');

function buildChips() {
  Object.entries(categories).forEach(([key, cat]) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<span class="dot"></span>${cat.label}`;
    chip.addEventListener('click', () => {
      if (selected.has(key)) {
        selected.delete(key);
        delete locked[key];
      } else {
        selected.add(key);
      }
      chip.classList.toggle('active');
      render();
    });
    chipsEl.appendChild(chip);
  });
}

function getIncome() {
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

function computeAmounts() {
  const income = getIncome();
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
  countTag.textContent = `${selected.size} seleccionado${selected.size === 1 ? '' : 's'}`;
  if (selected.size === 0) {
    resultsEl.innerHTML = `<div class="empty" style="text-align:center; font-size:13px; color:var(--muted); padding:20px; border:1px dashed var(--line); border-radius:12px;">Marca qué pagarás este mes para armar la sugerencia.</div>`;
    return;
  }

  const { amounts, income } = computeAmounts();
  const total = Object.values(amounts).reduce((a, b) => a + b, 0);

  let html = `<div class="bar"><div class="bar-seg" style="width:${income > 0 ? (total / income * 100) : 0}%; background:var(--accent-solid)"></div></div>`;
  html += `<div class="bar-caption"><span>$${fmt(total)} asignados</span><span>de $${fmt(income)}</span></div>`;

  selected.forEach(key => {
    const cat = categories[key];
    const amt = amounts[key] || 0;
    const isLocked = locked[key] != null;
    html += `
      <div class="cat-card" style="margin-top:12px;">
        <div class="cat-top">
          <span style="font-weight:600; font-size:14px;">${cat.label}</span>
          <span class="pct" style="font-size:12px; color:var(--muted);">${cat.tip}</span>
        </div>
        <div class="cat-bottom">
          <span class="amt-currency">$</span>
          <input class="amt-input" type="number" data-key="${key}" value="${amt.toFixed(0)}">
          ${isLocked ? `<button class="reset-btn" data-reset="${key}">Auto</button>` : ''}
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
  document.getElementById('summaryTotal').textContent = `$${fmt(total)}`;
  let rows = '';
  selected.forEach(key => {
    rows += `<div class="summary-row"><span>${categories[key].label}</span><strong>$${fmt(amounts[key])}</strong></div>`;
  });
  document.getElementById('summaryRows').innerHTML = rows;
  document.getElementById('modalOverlay').classList.add('show');
}

document.getElementById('closeModal').addEventListener('click', () => document.getElementById('modalOverlay').classList.remove('show'));

// DINERO OCULTO LÓGICA
function buildLeaks() {
  const box = document.getElementById('leakItems');
  leaks.forEach(l => {
    const item = document.createElement('div');
    item.className = 'leak-item';
    item.innerHTML = `<span class="leak-checkbox" id="lbox-${l.id}"></span><span class="leak-text">${l.text} (~$${l.amount}/mes)</span>`;
    item.addEventListener('click', () => {
      leakChecked[l.id] = !leakChecked[l.id];
      document.getElementById(`lbox-${l.id}`).classList.toggle('checked', leakChecked[l.id]);
      document.getElementById(`lbox-${l.id}`).textContent = leakChecked[l.id] ? '✓' : '';
      const totalLeak = leaks.reduce((s, curr) => s + (leakChecked[curr.id] ? curr.amount : 0), 0);
      document.getElementById('leakAmount').textContent = `~$${totalLeak}/mes`;
      document.getElementById('leakMsg').textContent = totalLeak > 0 ? 'Esos cuartos se te escapan en automático — controlarlo te da un respiro directo.' : '';
      document.getElementById('leakResult').classList.toggle('show', totalLeak > 0);
    });
    box.appendChild(item);
  });
}

// RETO NAVIDEÑO LÓGICA
let xmasLevel = 50;
let xmasChecked = {};
function buildXmas() {
  const container = document.getElementById('xmasWeeks');
  container.innerHTML = '';
  for (let w = 1; w <= 22; w++) {
    const row = document.createElement('div');
    row.className = 'xmas-week';
    row.innerHTML = `<span class="xmas-week-label">Semana ${w}</span><span class="xmas-week-amt" id="xamt-${w}">$${w * xmasLevel}</span><span class="xmas-week-check" id="xbox-${w}"></span>`;
    row.addEventListener('click', () => {
      xmasChecked[w] = !xmasChecked[w];
      document.getElementById(`xbox-${w}`).classList.toggle('checked', xmasChecked[w]);
      document.getElementById(`xbox-${w}`).textContent = xmasChecked[w] ? '✓' : '';
      let saved = 0; for (let i = 1; i <= 22; i++) if (xmasChecked[i]) saved += i * xmasLevel;
      const totalGoal = xmasLevel * 253;
      document.getElementById('xmasProgressNum').textContent = `$${fmt(saved)} de $${fmt(totalGoal)}`;
    });
    container.appendChild(row);
  }
}

document.querySelectorAll('.xmas-level').forEach(el => {
  el.addEventListener('click', () => {
    xmasLevel = parseInt(el.dataset.level);
    document.querySelectorAll('.xmas-level').forEach(l => l.classList.toggle('active', l === el));
    for (let w = 1; w <= 22; w++) document.getElementById(`xamt-${w}`).textContent = `$${w * xmasLevel}`;
    let saved = 0; for (let i = 1; i <= 22; i++) if (xmasChecked[i]) saved += i * xmasLevel;
    document.getElementById('xmasProgressNum').textContent = `$${fmt(saved)} de $${fmt(xmasLevel * 253)}`;
  });
});

// SIMULADOR AFP
document.getElementById('afpSalario').addEventListener('input', (e) => {
  const salario = parseFloat(e.target.value);
  const res = document.getElementById('afpSimResult');
  if (!salario || salario <= 0) { res.classList.remove('show'); return; }
  res.innerHTML = `Tu retención mensual de nómina es de <b>$${fmt(salario * 0.0287)}</b>. Tu empleador aporta obligatoriamente otros <b>$${fmt(salario * 0.0710)}</b> adicionales que van directos a tu patrimonio de vejez.`;
  res.classList.add('show');
});

// INTERACCIONES UPSELL NIÑOS
document.getElementById('kidsUnlockBtn').addEventListener('click', () => {
  document.getElementById('kidsPreview').style.display = 'none';
  document.getElementById('kidsFull').classList.add('show');
  const taskBox = document.getElementById('kidsTasks');
  taskBox.innerHTML = '';
  kidsTasks.forEach(t => {
    const item = document.createElement('div'); item.className = 'kids-task';
    item.innerHTML = `<span class="kids-task-check" id="kbox-${t.id}"></span><span class="kids-task-text">${t.text}</span>`;
    item.addEventListener('click', () => {
      kidsChecked[t.id] = !kidsChecked[t.id];
      document.getElementById(`kbox-${t.id}`).classList.toggle('checked', kidsChecked[t.id]);
      document.getElementById(`kbox-${t.id}`).textContent = kidsChecked[t.id] ? '✓' : '';
      const done = Object.values(kidsChecked).filter(Boolean).length;
      document.getElementById('kidsProgress').textContent = `${done} de 3 retos completados`;
    });
    taskBox.appendChild(item);
  });
  lazyLoadVideos();
});

// CONTROL DE TIPO DE INGRESO
document.querySelectorAll('.type-btn').forEach(b => {
  b.addEventListener('click', () => {
    incomeType = b.dataset.type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.toggle('active', btn === b));
    document.getElementById('variableBanner').classList.toggle('show', incomeType === 'variable');
    render();
  });
});

// INICIALIZADORES
buildChips();
buildLeaks();
buildXmas();
incomeEl.addEventListener('input', render);
lazyLoadVideos();
