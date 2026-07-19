document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. FLUJO INICIAL Y NAVEGACIÓN DE PESTAÑAS
  // ==========================================
  const splashScreen = document.getElementById('splashScreen');
  const mainApp = document.getElementById('mainApp');
  const btnComenzar = document.getElementById('btnComenzar');
  const bottomNav = document.getElementById('bottomNav');
  const navItems = document.querySelectorAll('.nav-item');
  const appViews = document.querySelectorAll('.app-view');

  // Botón para entrar a la aplicación
  if (btnComenzar && splashScreen && mainApp && bottomNav) {
    btnComenzar.addEventListener('click', () => {
      splashScreen.style.display = 'none';
      mainApp.style.display = 'flex';
      bottomNav.style.display = 'grid'; // Muestra la barra de navegación
      window.scrollTo(0, 0);
    });
  }

  // Lógica de cambio de pestañas (Tabs)
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetViewId = item.getAttribute('data-target');
      
      // Cambiar estado activo en botones de navegación
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Cambiar visibilidad de las vistas
      appViews.forEach(view => {
        if (view.id === targetViewId) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      window.scrollTo(0, 0);
    });
  });

  // Botón final del presupuesto que redirige a Metas
  const btnVerResumen = document.getElementById('btnVerResumen');
  if (btnVerResumen) {
    btnVerResumen.addEventListener('click', () => {
      const tabMetas = document.querySelector('[data-target="viewGoals"]');
      if (tabMetas) tabMetas.click(); // Simula el click para llevarlo a metas
    });
  }


  // ==========================================
  // 2. LÓGICA DEL RETO NAVIDEÑO (22 SEMANAS)
  // ==========================================
  const weeksGrid = document.getElementById('weeksGrid');
  const christmasStar = document.getElementById('christmasStar');
  const motivationAlert = document.getElementById('motivationAlert');
  const currentSavedText = document.getElementById('currentSavedText');
  const targetGoalText = document.getElementById('targetGoalText');
  const customLevelBox = document.getElementById('customLevelBox');
  const customWeeklyInput = document.getElementById('customWeeklyInput');
  const radioLevels = document.querySelectorAll('input[name="challengeLevel"]');

  let currentGoal = 11550; // Meta por defecto (Básico)
  let weeklyAmount = 50;
  let selectedWeeks = new Set(); // Guardar semanas marcadas

  // Definición de metas fijas por nivel
  const levelsConfig = {
    basico: { weekly: 50, total: 11550 },
    medio: { weekly: 100, total: 23100 },
    alto: { weekly: 200, total: 46200 },
    medida: { weekly: 0, total: 0 }
  };

  // Escuchar cambio de nivel de ahorro
  radioLevels.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const level = e.target.value;
      
      // Manejo visual de filas seleccionadas en la tabla
      radioLevels.forEach(r => r.closest('tr').classList.remove('selected'));
      e.target.closest('tr').classList.add('selected');

      if (level === 'medida') {
        customLevelBox.style.display = 'block';
        recalcularMetaPersonalizada();
      } else {
        customLevelBox.style.display = 'none';
        weeklyAmount = levelsConfig[level].weekly;
        currentGoal = levelsConfig[level].total;
        actualizarProgresoNavideno();
      }
    });
  });

  if (customWeeklyInput) {
    customWeeklyInput.addEventListener('input', recalcularMetaPersonalizada);
  }

  function recalcularMetaPersonalizada() {
    const val = parseFloat(customWeeklyInput.value) || 0;
    weeklyAmount = val;
    currentGoal = val * 22; // Multiplicación directa por las 22 semanas de la meta
    const lblMetaMedida = document.getElementById('lblMetaMedida');
    if (lblMetaMedida) lblMetaMedida.innerHTML = `<strong>RD$${currentGoal.toLocaleString()}</strong>`;
    actualizarProgresoNavideno();
  }

  // Generar dinámicamente las 22 bolitas navideñas
  if (weeksGrid) {
    for (let i = 1; i <= 22; i++) {
      const btn = document.createElement('button');
      btn.className = 'ornament-button';
      btn.innerHTML = `<span class="week-num">${i}</span>`;
      
      btn.addEventListener('click', () => {
        if (selectedWeeks.has(i)) {
          selectedWeeks.delete(i);
          btn.classList.remove('active');
        } else {
          selectedWeeks.add(i);
          btn.classList.add('active');
        }
        actualizarProgresoNavideno();
      });
      
      weeksGrid.appendChild(btn);
    }
  }

  function actualizarProgresoNavideno() {
    const totalSemanasMarcadas = selectedWeeks.size;
    const totalAhorrado = totalSemanasMarcadas * weeklyAmount;

    // Actualizar textos superiores en el dashboard
    if (currentSavedText) currentSavedText.textContent = `RD$${totalAhorrado.toLocaleString()}`;
    if (targetGoalText) targetGoalText.textContent = `RD$${currentGoal.toLocaleString()}`;

    // Control de la Estrella del Árbol
    if (christmasStar) {
      if (totalSemanasMarcadas === 22 && currentGoal > 0) {
        christmasStar.classList.add('active');
      } else {
        christmasStar.classList.remove('active');
      }
    }

    // Disparador de Mensajes Motivacionales Dinámicos
    if (motivationAlert) {
      motivationAlert.className = 'motivation-alert'; // Resetear clases
      motivationAlert.style.display = 'block';

      if (totalSemanasMarcadas === 5) {
        motivationAlert.textContent = '¡Arrancaste con todo! 🎉 5 semanas seguidas — ya el hábito se está agarrando.';
      } else if (totalSemanasMarcadas === 10) {
        motivationAlert.textContent = 'Vas a la mitad del camino. 10 semanas cumplidas — tu Navidad ya se siente más cerca.';
      } else if (totalSemanasMarcadas === 15) {
        motivationAlert.textContent = '15 semanas. Ya llevas más de lo que te falta — no aflojes ahora.';
      } else if (totalSemanasMarcadas === 20) {
        motivationAlert.textContent = '20 semanas completas. Solo te faltan 2 para encender la estrella. 🌟';
      } else if (totalSemanasMarcadas === 22) {
        motivationAlert.classList.add('final-win');
        motivationAlert.textContent = '🌟 ¡Lo lograste! Completaste tu Reto Navideño con disciplina, semana a semana. Esto es tuyo — disfrútalo sin culpa.';
      } else {
        motivationAlert.style.display = 'none'; // Ocultar si no coincide con las marcas
      }
    }
  }


  // ==========================================
  // 3. LÓGICA DE METAS & PROGRESO (CÁLCULO CRUZADO)
  // ==========================================
  const goalNameInput = document.getElementById('goalNameInput');
  const goalAmountInput = document.getElementById('goalAmountInput');
  const goalMonthsInput = document.getElementById('goalMonthsInput');
  const budgetSavingInput = document.getElementById('budgetSavingInput');
  
  const goalResultCard = document.getElementById('goalResultCard');
  const goalCalcText = document.getElementById('goalCalcText');
  const goalConnectionBadge = document.getElementById('goalConnectionBadge');
  const goalStatusFeedback = document.getElementById('goalStatusFeedback');
  const extraIncomeCatalog = document.getElementById('extraIncomeCatalog');
  const iconOptions = document.querySelectorAll('.icon-option');

  // Listener para el selector de íconos
  iconOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      iconOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      calcularMetasYProgreso(); // Recalcular con el nuevo emoji si aplica
    });
  });

  // Escuchar cambios en los inputs de Metas y también en el Ahorro de la Pestaña 1
  if (goalNameInput) goalNameInput.addEventListener('input', calcularMetasYProgreso);
  if (goalAmountInput) goalAmountInput.addEventListener('input', calcularMetasYProgreso);
  if (goalMonthsInput) goalMonthsInput.addEventListener('input', calcularMetasYProgreso);
  if (budgetSavingInput) budgetSavingInput.addEventListener('input', calcularMetasYProgreso);

  function calcularMetasYProgreso() {
    const nombre = goalNameInput.value.trim();
    const montoTotal = parseFloat(goalAmountInput.value) || 0;
    const meses = parseInt(goalMonthsInput.value) || 0;
    const ahorroDisponible = parseFloat(budgetSavingInput.value) || 0; // Conexión directa a Presupuesto

    // Si faltan datos básicos, mantenemos la tarjeta de resultados oculta
    if (!nombre || montoTotal <= 0 || meses <= 0) {
      if (goalResultCard) goalResultCard.style.display = 'none';
      return;
    }

    // Mostrar contenedor principal de resultados
    if (goalResultCard) goalResultCard.style.display = 'block';

    // Obtener ícono seleccionado
    const selectedOpt = document.querySelector('.icon-option.selected');
    const icon = selectedOpt ? selectedOpt.getAttribute('data-icon') : '🎯';

    // 1. Cálculo de cuota mensual requerida
    const cuotaMensual = Math.round(montoTotal / meses);
    if (goalCalcText) {
      goalCalcText.innerHTML = `${icon} Para lograr <strong>"${nombre}"</strong> necesitas ahorrar <strong>RD$${cuotaMensual.toLocaleString()}/mes</strong> durante <strong>${meses} meses</strong>.`;
    }

    // 2. Badge de conexión cruzada con Presupuesto
    if (goalConnectionBadge) {
      goalConnectionBadge.innerHTML = `🔗 Ya tienes <strong>RD$${ahorroDisponible.toLocaleString()}</strong> separados en tu categoría de Ahorro — eso ya te acerca a esta meta.`;
    }

    // 3. Validación de brechas (Margen disponible vs Requerido)
    if (goalStatusFeedback && extraIncomeCatalog) {
      if (ahorroDisponible >= cuotaMensual) {
        // ¡Alcanza el presupuesto! (Mensaje de Celebración)
        goalStatusFeedback.className = 'goal-status-feedback success';
        goalStatusFeedback.innerHTML = `¡Buenas noticias! Con tu presupuesto actual, "${nombre}" es alcanzable en el tiempo que pusiste. Dale con todo. 🎉`;
        extraIncomeCatalog.style.display = 'none'; // Se oculta el motor de ingresos extras
      } else {
        // No alcanza (Mensaje de Alerta Sin Regaños + Brecha)
        const diferencia = cuotaMensual - ahorroDisponible;
        goalStatusFeedback.className = 'goal-status-feedback alert';
        goalStatusFeedback.innerHTML = `Para lograr "${nombre}" necesitas RD$${cuotaMensual.toLocaleString()}/mes, pero tu presupuesto actual solo tiene margen para RD$${ahorroDisponible.toLocaleString()}/mes. Te faltan <strong>RD$${diferencia.toLocaleString()} al mes</strong> — mira abajo algunas formas reales de cerrar esa brecha.`;
        extraIncomeCatalog.style.display = 'block'; // ¡Se activa automáticamente el catálogo!
      }
    }
  }

});
