/* ============ DATOS ============ */
// Ya NO reparte automático por peso. Cada categoría solo trae un tip base
// y, cuando aplica, un benchmark de "rango sano" (maxRec) o mínimo recomendado (minRec)
// para poder darle asesoría dinámica a lo que la persona escriba.
const categories = {
  vivienda:   { label: 'Vivienda',        color: '#1F7A5C', maxRec: 0.35, tip: 'Alquiler, luz, agua, internet.' },
  comida:     { label: 'Comida',          color: '#3E9C77', maxRec: 0.20, tip: 'Supermercado y compras fijas de alimentos.' },
  transporte: { label: 'Transporte',      color: '#6BBE9A', maxRec: 0.15, tip: 'Combustible, concho y mantenimiento básico.' },
  colegio:    { label: 'Niños / Escuela', color: '#2D8ACE', tip: 'Mensualidades escolares y cuidado.' },
  salud:      { label: 'Salud',           color: '#3AA0A0', tip: 'Medicamentos y consultas médicas fijas.' },
  seguros:    { label: 'Seguros',         color: '#4C6B8A', tip: 'Cualquier póliza médica o de vehículo.' },
  mascotas:   { label: 'Mascotas',        color: '#C2447A', tip: 'Comida y cuidados veterinarios.' },
  deudas:     { label: 'Deudas',          color: '#8B5CF6', maxRec: 0.20, tip: 'Tarjetas o préstamos. Ataca la de mayor interés.' },
  ahorro:     { label: 'Ahorro',          color: '#B4432A', minRec: 0.10, minRecVariable: 0.15, tip: 'Tu colchón de tranquilidad. Míralo como factura obligatoria.' },
  familia:    { label: 'Remesas / Apoyo', color: '#E8A33D', tip: 'Dinero fijo enviado a padres o familiares.' },
  diversion:  { label: 'Diversión',       color: '#66766D', tip: 'Salidas y gustos. Pequeño pero necesario para no rendirte.' }
};

let selected = new Set();
let amounts = {};       // lo que la persona realmente escribe por categoría
let incomeType = 'fijo';

const VIDEO_LINKS = {
  tutorial: '',
  afp: '',
  curso1: '',
  kids: '',
  retoXmas: ''
};

const leaks = [
  { id: 'lista',    text: 'Ir al súper sin lista escrita', amount: 1500 },
  { id: 'comida',   text: 'Comer fuera en el trabajo frecuentemente', amount: 2500 },
  { id: 'recargas', text: 'Comprar recargas sueltas en vez de paquetes', amount: 600 },
  { id: 'subs',     text: 'Suscripciones que no usas pero sigues pagando', amount: 800 },
  { id: 'compara',  text: 'Comprar cosas grandes sin comparar precio primero', amount: 1000 }
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

/* ============ ACCESIBILIDAD: helper para divs interactivos ============ */
// Cualquier div que se comporte como botón necesita poder alcanzarse con Tab
// y activarse con Enter/Espacio, no solo con clic de mouse.
function makeKeyboardActivatable(el) {
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}

/* ============ SPLASH ============ */
if (document.getElementById('enterAppBtn')) {
  document.getElementById('enterAppBtn').addEventListener('click', () => {
    const splash = document.getElementById('app-splash');
    const mainApp = document.getElementById('mainAppContainer');
    splash.classList.add('fade-out');
    mainApp.style.display = 'flex';
    setTimeout(() => { splash.style.display = 'none'; }, 600);
    lazyLoadVideos();
  });
}

/* ============ NAVEGACIÓN TABS ============ */
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

/* ============ PRESUPUESTO: entrada manual + asesoría dinámica ============ */
const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const extraIncomeEl = document.getElementById('extraIncome');
const countTag = document.getElementById('countTag');

function fmt(n) { return Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

function buildChips() {
  if (!chipsEl) return;
  chipsEl.innerHTML = '';
  Object.entries(categories).forEach(([key, cat]) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<span class="dot"></span>${cat.label}`;
    makeKeyboardActivatable(chip);
    chip.addEventListener('click', () => {
      if (selected.has(key)) {
        selected.delete(key);
        delete amounts[key];
      } else {
        selected.add(key);
      }
      chip.classList.toggle('active');
      renderCategoryList();
    });
    chipsEl.appendChild(chip);
  });
}

function getIncome() {
  if (!incomeEl) return 0;
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

// Calcula la asesoría dinámica para UNA categoría, según lo que la persona
// realmente escribió — no reparte nada, solo evalúa qué tan sano es.
function categoryAdvice(key, amount, income) {
  const cat = categories[key];
  if (!income || income <= 0) return null;

  if (cat.maxRec != null) {
    const recommended = income * cat.maxRec;
    if (amount > recommended) {
      const exceso = amount - recommended;
      const neededIncome = amount / cat.maxRec;
      const pctIncrease = ((neededIncome / income) - 1) * 100;
      const severo = amount > recommended * 1.15;
      return {
        level: severo ? 'red' : 'amber',
        html: `Lo sano aquí sería no pasar de <b>RD$${fmt(recommended)}</b> (${Math.round(cat.maxRec * 100)}% de tu ingreso). Ahora mismo estás <b>RD$${fmt(exceso)}</b> por encima. Tus dos salidas reales: bajar este gasto en RD$${fmt(exceso)}, o subir tu ingreso a RD$${fmt(neededIncome)} (+${pctIncrease.toFixed(0)}%) para que este gasto deje de ahogarte.`
      };
    }
    return { level: 'green', html: `Vas bien — estás dentro del ${Math.round(cat.maxRec * 100)}% recomendado (hasta RD$${fmt(recommended)}).` };
  }

  if (cat.minRec != null) {
    const minRec = incomeType === 'variable' && cat.minRecVariable != null ? cat.minRecVariable : cat.minRec;
    const recommended = income * minRec;
    if (amount < recommended) {
      const falta = recommended - amount;
      return {
        level: amount === 0 ? 'red' : 'amber',
        html: `El mínimo saludable aquí sería <b>RD$${fmt(recommended)}</b> (${Math.round(minRec * 100)}% de tu ingreso). Te faltan RD$${fmt(falta)} para llegar — cada peso que sumes aquí es tranquilidad futura, no gasto.`
      };
    }
    return { level: 'green', html: `¡Bien! Estás ahorrando por encima del ${Math.round(minRec * 100)}% mínimo recomendado.` };
  }

  return null; // categorías sin benchmark: solo se queda el tip base, sin semáforo
}

function renderCategoryList() {
  if (!countTag) return;
  countTag.textContent = `${selected.size} seleccionado${selected.size === 1 ? '' : 's'}`;

  if (selected.size === 0) {
    resultsEl.innerHTML = `<div class="empty" style="text-align:center; font-size:13px; color:var(--muted); padding:20px; border:1px dashed var(--line); border-radius:12px; margin-top: 14px;">Marca qué pagarás este mes para empezar a anotar tus montos reales.</div>`;
    return;
  }

  let html = `
    <div class="bar" id="totalBar"><div class="bar-seg" id="totalBarSeg" style="width:0%; background:var(--accent-solid)"></div></div>
    <div class="bar-caption"><span id="totalPaidLbl">RD$0 asignados</span><span id="totalIncomeLbl">de RD$0</span></div>
    <div id="totalOverWarning" style="display:none; font-size:11.5px; color:#8a3320; background:rgba(180,67,42,0.08); padding:8px 10px; border-radius:8px; margin-top:6px; line-height:1.4;"></div>
  `;

  selected.forEach(key => {
    const cat = categories[key];
    html += `
      <div class="cat-card" style="margin-top:12px;">
        <div class="cat-top">
          <div style="font-weight:600; font-size:14px; margin-bottom: 2px;">${cat.label}</div>
          <div class="pct" style="font-size:11.5px; color:var(--muted); line-height: 1.3;">${cat.tip}</div>
        </div>
        <div class="cat-bottom">
          <span class="amt-currency">RD$</span>
          <input class="amt-input" type="number" inputmode="decimal" data-key="${key}" placeholder="0" value="${amounts[key] != null ? amounts[key] : ''}">
        </div>
        <div class="cat-advice" id="advice-${key}" style="display:none; font-size:11.5px; line-height:1.5; padding:8px 10px; border-radius:8px; margin-top:8px;"></div>
      </div>`;
  });

  html += `<button class="summary-btn" id="summaryBtn">Ver mi resumen →</button>`;
  resultsEl.innerHTML = html;

  resultsEl.querySelectorAll('.amt-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value);
      amounts[key] = isNaN(val) ? 0 : val;
      updateCategoryAdvice(key);
      updateTotals();
    });
  });

  document.getElementById('summaryBtn').addEventListener('click', openSummary);

  // pinta todo el estado inicial (por si ya había montos cargados)
  selected.forEach(key => updateCategoryAdvice(key));
  updateTotals();
}

function updateCategoryAdvice(key) {
  const box = document.getElementById(`advice-${key}`);
  if (!box) return;
  const income = getIncome();
  const amount = amounts[key] || 0;
  const advice = categoryAdvice(key, amount, income);

  if (!advice) {
    box.style.display = 'none';
    return;
  }
  const colors = {
    green: { bg: 'var(--accent-soft)', fg: 'var(--accent-solid)' },
    amber: { bg: 'var(--brand-orange-soft)', fg: 'var(--brand-orange)' },
    red:   { bg: 'rgba(180,67,42,0.08)', fg: '#8a3320' }
  };
  const c = colors[advice.level];
  box.style.display = 'block';
  box.style.background = c.bg;
  box.style.color = c.fg;
  box.innerHTML = advice.html;
}

function updateTotals() {
  const income = getIncome();
  let total = 0;
  selected.forEach(key => { total += (amounts[key] || 0); });

  const seg = document.getElementById('totalBarSeg');
  const paidLbl = document.getElementById('totalPaidLbl');
  const incomeLbl = document.getElementById('totalIncomeLbl');
  const warnBox = document.getElementById('totalOverWarning');
  if (!seg) return;

  const pct = income > 0 ? Math.min((total / income) * 100, 100) : 0;
  seg.style.width = `${pct}%`;
  seg.style.background = total > income && income > 0 ? '#B4432A' : 'var(--accent-solid)';
  paidLbl.textContent = `RD$${fmt(total)} asignados`;
  incomeLbl.textContent = `de RD$${fmt(income)}`;

  if (income > 0 && total > income) {
    const exceso = total - income;
    warnBox.style.display = 'block';
    warnBox.innerHTML = `Tu presupuesto suma RD$${fmt(exceso)} más de lo que ingresa este mes. No es un error del sistema — es información real: algo tiene que ceder, o el ingreso tiene que crecer.`;
  } else if (warnBox) {
    warnBox.style.display = 'none';
  }

  // recalcula todos los tooltips de categorías que dependen del % de ingreso
  selected.forEach(key => updateCategoryAdvice(key));
}

function openSummary() {
  const income = getIncome();
  let total = 0;
  selected.forEach(key => { total += (amounts[key] || 0); });

  document.getElementById('summaryTotal').textContent = `RD$${fmt(total)}`;
  let rows = '';
  let waText = `📋 Mi presupuesto de este mes (armado con Miscuartos):\n\n`;
  selected.forEach(key => {
    const amt = amounts[key] || 0;
    rows += `<div class="summary-row"><span>${categories[key].label}</span><strong>RD$${fmt(amt)}</strong></div>`;
    waText += `${categories[key].label}: RD$${fmt(amt)}\n`;
  });
  waText += `\nTotal: RD$${fmt(total)} de RD$${fmt(income)} de ingreso\n\nArma el tuyo en minutos con Miscuartos, tu coach financiero de bolsillo 🧭`;

  document.getElementById('summaryRows').innerHTML = rows;
  const waBtn = document.getElementById('whatsappBtn');
  if (waBtn) waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  document.getElementById('modalOverlay').classList.add('show');
}

if (document.getElementById('closeModal')) {
  document.getElementById('closeModal').addEventListener('click', () => document.getElementById('modalOverlay').classList.remove('show'));
}

/* ============ DINERO OCULTO ============ */
function buildLeaks() {
  const box = document.getElementById('leakItems');
  if (!box) return;
  box.innerHTML = '';
  leaks.forEach(l => {
    const item = document.createElement('div');
    item.className = 'leak-item';
    item.innerHTML = `<span class="leak-checkbox" id="lbox-${l.id}"></span><span class="leak-text">${l.text} (~RD$${fmt(l.amount)}/mes)</span>`;
    makeKeyboardActivatable(item);
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

/* ============ RETO NAVIDEÑO ============ */
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
      makeKeyboardActivatable(row);
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
  makeKeyboardActivatable(el);
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

/* ============ SIMULADOR AFP ============ */
if (document.getElementById('afpSalario')) {
  document.getElementById('afpSalario').addEventListener('input', (e) => {
    const salario = parseFloat(e.target.value);
    const res = document.getElementById('afpSimResult');
    if (!salario || salario <= 0) { res.classList.remove('show'); return; }
    res.innerHTML = `Tu retención mensual es de <b>RD$${fmt(salario * 0.0287)}</b>. Tu empleador aporta obligatoriamente otros <b>RD$${fmt(salario * 0.0710)}</b> adicionales que van directos a tu fondo.`;
    res.classList.add('show');
  });
}

/* ============ CRÉDITO INTELIGENTE ============ */
const CREDIT_BALANCE = 25000;
const CREDIT_APR = 0.52;
const creditSlider = document.getElementById('creditSlider');
function renderCreditSim() {
  if (!creditSlider) return;
  const pct = parseInt(creditSlider.value);
  const paid = Math.round(CREDIT_BALANCE * pct / 100);
  const remaining = CREDIT_BALANCE - paid;
  const interest = Math.round(remaining * CREDIT_APR / 12);

  document.getElementById('creditPctLabel').textContent = `${pct}%`;
  document.getElementById('creditPaid').textContent = `RD$${fmt(paid)}`;
  document.getElementById('creditRemaining').textContent = `RD$${fmt(remaining)}`;
  document.getElementById('creditInterest').textContent = pct >= 100 ? 'RD$0' : `RD$${fmt(interest)}`;

  const tag = document.getElementById('creditTag');
  if (pct >= 100) {
    tag.textContent = 'Totalero — RD$0 en intereses';
    tag.className = 'credit-slider-tag good';
  } else if (pct >= 60) {
    tag.textContent = 'Buen avance';
    tag.className = 'credit-slider-tag good';
  } else if (pct >= 20) {
    tag.textContent = 'Riesgo moderado';
    tag.className = 'credit-slider-tag warn';
  } else {
    tag.textContent = 'La trampa del mínimo';
    tag.className = 'credit-slider-tag bad';
  }
}
if (creditSlider) {
  creditSlider.addEventListener('input', renderCreditSim);
  renderCreditSim();
}

/* ============ INTERACCIONES UPSELL NIÑOS ============ */
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
      makeKeyboardActivatable(item);
      item.addEventListener('click', () => {
        kidsChecked[t.id] = !kidsChecked[t.id];
        document.getElementById(`kbox-${t.id}`).classList.toggle('checked', kidsChecked[t.id]);
        document.getElementById(`kbox-${t.id}`).textContent = kidsChecked[t.id] ? '✓' : '';
        const done = Object.values(kidsChecked).filter(Boolean).length;
        document.getElementById('kidsProgress').textContent = `${done} de ${kidsTasks.length} retos completados`;
      });
      taskBox.appendChild(item);
    });
    lazyLoadVideos();
  });
}

/* ============ LECCIONES BLOQUEADAS DEL MINICURSO ============ */
document.querySelectorAll('.course-item.locked').forEach(item => {
  makeKeyboardActivatable(item);
  item.addEventListener('click', () => {
    const titleEl = item.querySelector('.course-info-text b');
    const title = titleEl ? titleEl.textContent : 'Esta clase';
    alert(`"${title}" se desbloquea con tu compra de Miscuartos ($9).`);
  });
});

/* ============ EXTRA / CHIRIPA: consejo separado, no se mezcla con el presupuesto ============ */
if (extraIncomeEl) {
  extraIncomeEl.addEventListener('input', () => {
    const v = parseFloat(extraIncomeEl.value);
    const tipEl = document.getElementById('extraTip');
    if (!tipEl) return;
    if (!v || v <= 0) {
      tipEl.classList.remove('show');
      return;
    }
    const deuda = Math.round(v * 0.5);
    const gusto = Math.round(v * 0.3);
    const proximo = Math.round(v * 0.2);
    tipEl.innerHTML = `Con ese extra, una guía simple: <b>RD$${fmt(deuda)}</b> directo a deudas o ahorro, <b>RD$${fmt(gusto)}</b> para un gusto, y <b>RD$${fmt(proximo)}</b> guardado para adelantar el próximo mes. No lo mezcles con tu presupuesto de arriba — trátalo aparte.`;
    tipEl.classList.add('show');
  });
}

/* ============ TIPO DE INGRESO ============ */
document.querySelectorAll('.type-btn').forEach(b => {
  makeKeyboardActivatable(b);
  b.addEventListener('click', () => {
    incomeType = b.dataset.type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.toggle('active', btn === b));
    document.getElementById('variableBanner').classList.toggle('show', incomeType === 'variable');
    updateTotals();
  });
});

/* ============ INICIALIZADORES ============ */
buildChips();
buildLeaks();
buildXmas();

if (incomeEl) {
  incomeEl.addEventListener('input', updateTotals);
}

renderCategoryList();
