/* ============ DATOS ============ */
const categories = {
  vivienda:   { label: 'Vivienda',       color: '#1F7A5C', maxRec: 0.35, tip: 'Alquiler, luz, agua, internet.' },
  comida:     { label: 'Comida',         color: '#3E9C77', maxRec: 0.20, tip: 'Supermercado y compras fijas de alimentos.' },
  transporte: { label: 'Transporte',     color: '#6BBE9A', maxRec: 0.15, tip: 'Combustible, concho y mantenimiento básico.' },
  colegio:    { label: 'Niños / Escuela', color: '#2D8ACE', tip: 'Mensualidades escolares y cuidado.' },
  salud:      { label: 'Salud',          color: '#3AA0A0', tip: 'Medicamentos y consultas médicas fijas.' },
  seguros:    { label: 'Seguros',        color: '#4C6B8A', tip: 'Cualquier póliza médica o de vehículo.' },
  mascotas:   { label: 'Mascotas',       color: '#C2447A', tip: 'Comida y cuidados veterinarios.' },
  deudas:     { label: 'Deudas',         color: '#8B5CF6', maxRec: 0.20, tip: 'Tarjetas o préstamos. Ataca la de mayor interés.' },
  ahorro:     { label: 'Ahorro',         color: '#B4432A', minRec: 0.10, minRecVariable: 0.15, tip: 'Tu colchón de tranquilidad. Míralo como factura obligatoria.' },
  familia:    { label: 'Remesas / Apoyo', color: '#E8A33D', tip: 'Dinero fijo enviado a padres o familiares.' },
  diversion:  { label: 'Diversión',      color: '#66766D', tip: 'Salidas y gustos. Pequeño pero necesario para no rendirte.' }
};

let amounts = {};       // lo que la persona realmente escribe por categoría
let incomeType = 'fijo';
let totalXmasWeeks = 0; // Se calculará dinámicamente

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

/* ============ ACCESIBILIDAD ============ */
function makeKeyboardActivatable(el) {
  if (!el) return;
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
    if(splash && mainApp) {
      splash.classList.add('fade-out');
      mainApp.style.display = 'flex';
      setTimeout(() => { splash.style.display = 'none'; }, 600);
      lazyLoadVideos();
    }
  });
}

/* ============ NAVEGACIÓN TABS ============ */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    
    const targetPane = document.getElementById(`pane-${btn.dataset.tab}`);
    if (targetPane) targetPane.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lazyLoadVideos();
  });
});

function lazyLoadVideos() {
  const splash = document.getElementById('app-splash');
  if (splash && splash.style.display === 'none') {
    const activePane = document.querySelector('.tab-pane.active');
    if (!activePane) return;

    if (activePane.id === 'pane-presupuesto' && VIDEO_LINKS.tutorial) {
      const el = document.getElementById('embed-tutorial');
      if (el) el.innerHTML = `<iframe src="${VIDEO_LINKS.tutorial}" allowfullscreen></iframe>`;
    }
    if (activePane.id === 'pane-reto' && VIDEO_LINKS.retoXmas) {
      const el = document.getElementById('embed-reto-xmas');
      if (el) el.innerHTML = `<iframe src="${VIDEO_LINKS.retoXmas}" allowfullscreen></iframe>`;
    }
    if (activePane.id === 'pane-academia') {
      const afpEl = document.getElementById('embed-afp');
      const cursoEl = document.getElementById('embed-curso');
      const kidsEl = document.getElementById('embed-kids');
      const kidsFull = document.getElementById('kidsFull');

      if (VIDEO_LINKS.afp && afpEl) afpEl.innerHTML = `<iframe src="${VIDEO_LINKS.afp}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.curso1 && cursoEl) cursoEl.innerHTML = `<iframe src="${VIDEO_LINKS.curso1}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.kids && kidsFull && kidsFull.classList.contains('show') && kidsEl) {
        kidsEl.innerHTML = `<iframe src="${VIDEO_LINKS.kids}" allowfullscreen></iframe>`;
      }
    }
  }
}

/* ============ PRESUPUESTO ============ */
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const countTag = document.getElementById('countTag');

function fmt(n) { return Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

function getIncome() {
  if (!incomeEl) return 0;
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

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
        html: `Lo sano aquí sería no pasar de <b>RD$${fmt(recommended)}</b> (${Math.round(cat.maxRec * 100)}% de tu ingreso). Estás <b>RD$${fmt(exceso)}</b> por encima. Baja este gasto en RD$${fmt(exceso)}, o sube tu ingreso a RD$${fmt(neededIncome)} (+${pctIncrease.toFixed(0)}%).`
      };
    }
    return { level: 'green', html: `Vas bien — estás dentro del ${Math.round(cat.maxRec * 100)}% recomendado.` };
  }

  if (cat.minRec != null) {
    const minRec = incomeType === 'variable' && cat.minRecVariable != null ? cat.minRecVariable : cat.minRec;
    const recommended = income * minRec;
    if (amount < recommended) {
      const falta = recommended - amount;
      return {
        level: amount === 0 ? 'red' : 'amber',
        html: `El mínimo saludable sería <b>RD$${fmt(recommended)}</b> (${Math.round(minRec * 100)}% de tu ingreso). Te faltan RD$${fmt(falta)}.`
      };
    }
    return { level: 'green', html: `¡Bien! Estás ahorrando por encima del ${Math.round(minRec * 100)}% mínimo.` };
  }

  return null;
}

function buildCategoryRows() {
  if (!resultsEl) return;
  let html = `
    <div class="sticky-total-box">
      <div class="sticky-total-num" id="stickyTotalNum">RD$0</div>
      <div class="sticky-total-of" id="stickyTotalOf">de RD$0 ganado este mes</div>
      <div class="bar" style="margin:8px 0 0;"><div class="bar-seg" id="totalBarSeg" style="width:0%; background:var(--accent-solid)"></div></div>
      <div class="sticky-total-status" id="totalOverWarning" style="display:none;"></div>
    </div>
  `;

  Object.entries(categories).forEach(([key, cat]) => {
    html += `
      <div class="cat-row">
        <div class="cat-row-label"><span class="cat-dot" id="dot-${key}"></span>${cat.label}</div>
        <div class="cat-row-input-wrap">
          <span class="amt-currency">RD$</span>
          <input class="amt-input" type="number" inputmode="decimal" data-key="${key}" placeholder="0" value="${amounts[key] ? amounts[key] : ''}">
        </div>
      </div>`;
  });

  html += `<button class="summary-btn" id="summaryBtn">Ver mi resumen y consejos →</button>`;
  resultsEl.innerHTML = html;

  resultsEl.querySelectorAll('.amt-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value);
      amounts[key] = isNaN(val) ? 0 : val;
      updateCategoryDot(key);
      showActiveAdvice(key);
      updateCount();
      updateTotals(false);
    });
    inp.addEventListener('focus', (e) => showActiveAdvice(e.target.dataset.key));
    inp.addEventListener('blur', () => updateTotals(true));
  });

  const summaryBtn = document.getElementById('summaryBtn');
  if (summaryBtn) {
    summaryBtn.addEventListener('click', openSummary);
  }

  setTimeout(() => {
    Object.keys(categories).forEach(key => updateCategoryDot(key));
    updateCount();
    updateTotals(true);
  }, 0);
}

function updateCount() {
  if (!countTag) return;
  const withAmount = Object.values(amounts).filter(v => v > 0).length;
  countTag.textContent = `${withAmount} con monto`;
}

function updateCategoryDot(key) {
  const dot = document.getElementById(`dot-${key}`);
  if (!dot) return;
  const amt = amounts[key] || 0;
  if (!amt) { dot.className = 'cat-dot'; return; }
  const advice = categoryAdvice(key, amt, getIncome());
  dot.className = 'cat-dot' + (advice ? ` ${advice.level}` : '');
}

function showActiveAdvice(key) {
  const warnBox = document.getElementById('totalOverWarning');
  if (!warnBox) return;
  const advice = categoryAdvice(key, amounts[key] || 0, getIncome());
  
  if (!advice) { 
    warnBox.style.display = 'none'; 
    return; 
  }
  
  const colors = {
    green: { bg: 'var(--accent-soft)', fg: 'var(--accent-solid)' },
    amber: { bg: 'var(--brand-orange-soft)', fg: 'var(--brand-orange)' },
    red:   { bg: 'rgba(180,67,42,0.08)', fg: '#8a3320' }
  };
  const c = colors[advice.level];
  warnBox.style.display = 'block';
  warnBox.style.background = c.bg;
  warnBox.style.color = c.fg;
  warnBox.innerHTML = `<b>${categories[key].label}:</b> ${advice.html}`;
}

function updateTotals(showOverallStatus) {
  const income = getIncome();
  let total = 0;
  Object.keys(categories).forEach(key => { total += (amounts[key] || 0); });

  const seg = document.getElementById('totalBarSeg');
  const numEl = document.getElementById('stickyTotalNum');
  const ofEl = document.getElementById('stickyTotalOf');
  const warnBox = document.getElementById('totalOverWarning');
  if (!seg) return;

  const pct = income > 0 ? Math.min((total / income) * 100, 100) : 0;
  seg.style.width = `${pct}%`;
  seg.style.background = total > income && income > 0 ? '#B4432A' : 'var(--accent-solid)';
  if (numEl) numEl.textContent = `RD$${fmt(total)}`;
  if (ofEl) ofEl.textContent = `de RD$${fmt(income)} ganado este mes`;

  if (!showOverallStatus) return;

  if (income > 0 && total > income) {
    const exceso = total - income;
    if (warnBox) {
      warnBox.style.display = 'block';
      warnBox.style.background = 'rgba(180,67,42,0.08)';
      warnBox.style.color = '#8a3320';
      warnBox.innerHTML = `RD$${fmt(exceso)} por encima de lo que ganas. No es un error — es información real.`;
    }
  } else if (income > 0 && total > 0) {
    if (warnBox) {
      warnBox.style.display = 'block';
      warnBox.style.background = 'var(--accent-soft)';
      warnBox.style.color = 'var(--accent-solid)';
      warnBox.innerHTML = `Te queda RD$${fmt(income - total)} sin asignar todavía.`;
    }
  } else if (warnBox) {
    warnBox.style.display = 'none';
  }

  Object.keys(categories).forEach(key => updateCategoryDot(key));
}

function openSummary() {
  const income = getIncome();
  const usedKeys = Object.keys(categories).filter(key => (amounts[key] || 0) > 0);
  let total = 0;
  usedKeys.forEach(key => { total += (amounts[key] || 0); });

  const summaryTotalEl = document.getElementById('summaryTotal');
  if (summaryTotalEl) summaryTotalEl.textContent = `RD$${fmt(total)}`;

  let rows = '';
  let waText = `📋 Los números de la casa este mes:\n\n`;
  usedKeys.forEach(key => {
    const amt = amounts[key] || 0;
    const advice = categoryAdvice(key, amt, income);
    rows += `<div class="summary-row" style="flex-direction:column; align-items:stretch; gap:4px;">
      <div style="display:flex; justify-content:space-between;"><span>${categories[key].label}</span><strong>RD$${fmt(amt)}</strong></div>
      ${advice ? `<div style="font-size:11px; line-height:1.4; color:${advice.level === 'green' ? 'var(--accent-solid)' : advice.level === 'amber' ? 'var(--brand-orange)' : '#8a3320'};">${advice.html}</div>` : ''}
    </div>`;
    waText += `• ${categories[key].label}: RD$${fmt(amt)}\n`;
  });

  waText += `\nTotal: RD$${fmt(total)} de RD$${fmt(income)} de ingreso`;
  if (income > 0 && total > income) {
    waText += `\n⚠️ Nos pasamos por RD$${fmt(total - income)} — hay que ajustar algo.`;
  }
  waText += `\n\nAsí quedamos este mes 🤝`;

  const summaryRowsEl = document.getElementById('summaryRows');
  if (summaryRowsEl) summaryRowsEl.innerHTML = rows;
  
  const waBtn = document.getElementById('whatsappBtn');
  if (waBtn) {
    waBtn.textContent = 'Enviar acuerdo del mes por WhatsApp';
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  }
  
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.add('show');
}

if (document.getElementById('closeModal')) {
  document.getElementById('closeModal').addEventListener('click', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
  });
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
      if (checkbox) {
        checkbox.classList.toggle('checked', leakChecked[l.id]);
        checkbox.textContent = leakChecked[l.id] ? '✓' : '';
      }
      const totalLeak = leaks.reduce((s, curr) => s + (leakChecked[curr.id] ? curr.amount : 0), 0);
      const leakAmountEl = document.getElementById('leakAmount');
      const leakMsgEl = document.getElementById('leakMsg');
      if (leakAmountEl) leakAmountEl.textContent = `~RD$${fmt(totalLeak)}/mes`;
      if (leakMsgEl) leakMsgEl.textContent = totalLeak > 0 ? 'Esos cuartos se te van sin darte cuenta.' : '';
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
        if (checkbox) {
          checkbox.classList.toggle('checked', xmasChecked[w]);
          checkbox.textContent = xmasChecked[w] ? '✓' : '';
        }
        renderXmasProgress();
      });
      container.appendChild(row);
      weekNum++;
    }
  });

  totalXmasWeeks = weekNum - 1; 
  renderXmasProgress();
}

function updateAllXmasLabels() {
  for (let w = 1; w <= totalXmasWeeks; w++) {
    const amtEl = document.getElementById(`xamt-${w}`);
    if (amtEl) amtEl.textContent = `RD$${fmt(w * xmasLevel)}`;
  }
}

function renderXmasProgress() {
  let saved = 0;
  for (let i = 1; i <= totalXmasWeeks; i++) {
    if (xmasChecked[i]) saved += i * xmasLevel;
  }
  
  const totalGoal = xmasLevel * ((totalXmasWeeks * (totalXmasWeeks + 1)) / 2);
  
  const progressNumEl = document.getElementById('xmasProgressNum');
  const progressLblEl = document.getElementById('xmasProgressLbl');
  const customMetaTag = document.getElementById('xmasCustomMetaTag');
  
  if (progressNumEl) progressNumEl.textContent = `RD$${fmt(saved)} de RD$${fmt(totalGoal)}`;
  if (customMetaTag) customMetaTag.textContent = `Meta: RD$${fmt(totalGoal)}`; // Actualiza la etiqueta personalizada
  
  if (progressLblEl) {
    const checkedCount = Object.values(xmasChecked).filter(Boolean).length;
    const weeksLeft = totalXmasWeeks - checkedCount;
    progressLblEl.textContent = saved > 0 ? `¡Sigue así! Te faltan ${weeksLeft} semanas` : 'Marca las semanas que ya depositaste';
  }
}

// Lógica de Niveles (Incluye el caso personalizado)
document.querySelectorAll('.xmas-level').forEach(el => {
  makeKeyboardActivatable(el);
  el.addEventListener('click', () => {
    const levelVal = el.dataset.level;
    const customRow = document.getElementById('xmasCustomInputRow');
    
    document.querySelectorAll('.xmas-level').forEach(l => l.classList.toggle('active', l === el));
    
    if (levelVal === 'custom') {
      if (customRow) customRow.style.display = 'block';
      const customInput = document.getElementById('xmasCustomAmount');
      xmasLevel = customInput ? (parseInt(customInput.value) || 0) : 0;
    } else {
      if (customRow) customRow.style.display = 'none';
      xmasLevel = parseInt(levelVal);
    }
    
    updateAllXmasLabels();
    renderXmasProgress();
  });
});

// Escuchar input personalizado
const customInput = document.getElementById('xmasCustomAmount');
if (customInput) {
  customInput.addEventListener('input', () => {
    xmasLevel = parseInt(customInput.value) || 0;
    updateAllXmasLabels();
    renderXmasProgress();
  });
}

/* ============ SIMULADOR AFP ============ */
if (document.getElementById('afpSalario')) {
  document.getElementById('afpSalario').addEventListener('input', (e) => {
    const salario = parseFloat(e.target.value);
    const res = document.getElementById('afpSimResult');
    if (!res) return;
    if (!salario || salario <= 0) { res.classList.remove('show'); return; }
    res.innerHTML = `Tu retención mensual es de <b>RD$${fmt(salario * 0.0287)}</b>. Tu empleador aporta obligatoriamente otros <b>RD$${fmt(salario * 0.0710)}</b> adicionales.`;
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

  const pctLabel = document.getElementById('creditPctLabel');
  const creditPaid = document.getElementById('creditPaid');
  const creditRemaining = document.getElementById('creditRemaining');
  const creditInterest = document.getElementById('creditInterest');
  
  if (pctLabel) pctLabel.textContent = `${pct}%`;
  if (creditPaid) creditPaid.textContent = `RD$${fmt(paid)}`;
  if (creditRemaining) creditRemaining.textContent = `RD$${fmt(remaining)}`;
  if (creditInterest) creditInterest.textContent = pct >= 100 ? 'RD$0' : `RD$${fmt(interest)}`;

  const tag = document.getElementById('creditTag');
  if (tag) {
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
}
if (creditSlider) {
  creditSlider.addEventListener('input', renderCreditSim);
  renderCreditSim();
}

/* ============ INTERACCIONES NIÑOS ============ */
if (document.getElementById('kidsUnlockBtn')) {
  document.getElementById('kidsUnlockBtn').addEventListener('click', () => {
    const preview = document.getElementById('kidsPreview');
    const full = document.getElementById('kidsFull');
    const taskBox = document.getElementById('kidsTasks');
    
    if (preview) preview.style.display = 'none';
    if (full) full.classList.add('show');
    if (!taskBox) return;
    
    taskBox.innerHTML = '';
    kidsTasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'kids-task';
      item.innerHTML = `<span class="kids-task-check" id="kbox-${t.id}"></span><span class="kids-task-text">${t.text}</span>`;
      makeKeyboardActivatable(item);
      item.addEventListener('click', () => {
        kidsChecked[t.id] = !kidsChecked[t.id];
        const kbox = document.getElementById(`kbox-${t.id}`);
        if (kbox) {
          kbox.classList.toggle('checked', kidsChecked[t.id]);
          kbox.textContent = kidsChecked[t.id] ? '✓' : '';
        }
        const done = Object.values(kidsChecked).filter(Boolean).length;
        const kidsProgress = document.getElementById('kidsProgress');
        if (kidsProgress) kidsProgress.textContent = `${done} de ${kidsTasks.length} retos completados`;
      });
      taskBox.appendChild(item);
    });
    lazyLoadVideos();
  });
}

/* ============ LECCIONES BLOQUEADAS ============ */
document.querySelectorAll('.course-item.locked').forEach(item => {
  makeKeyboardActivatable(item);
  item.addEventListener('click', () => {
    const titleEl = item.querySelector('.course-info-text b');
    const title = titleEl ? titleEl.textContent : 'Esta clase';
    alert(`"${title}" se desbloquea con tu compra.`);
  });
});

/* ============ TIPO DE INGRESO ============ */
document.querySelectorAll('.type-btn').forEach(b => {
  makeKeyboardActivatable(b);
  b.addEventListener('click', () => {
    incomeType = b.dataset.type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.toggle('active', btn === b));
    const vBanner = document.getElementById('variableBanner');
    if (vBanner) vBanner.classList.toggle('show', incomeType === 'variable');
    updateTotals(true);
  });
});

/* ============ INICIALIZADOR SEGURO ============ */
const initApp = () => {
  Object.keys(categories).forEach(key => {
    if (amounts[key] == null) amounts[key] = 0;
  });

  buildLeaks();
  buildXmas();
  buildCategoryRows();

  if (incomeEl) {
    incomeEl.addEventListener('input', () => updateTotals(true));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
