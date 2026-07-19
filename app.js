/**
 * miscuartos — Core Application Logic
 * Dashboard interactivo, retos de ahorro y coach financiero dinámico.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- A. INICIALIZACIÓN Y NAVEGACIÓN ---
  const enterAppBtn = document.getElementById("enterAppBtn");
  const splashScreen = document.getElementById("app-splash");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (enterAppBtn) {
    enterAppBtn.addEventListener("click", () => {
      splashScreen.style.transition = "opacity 0.4s ease";
      splashScreen.style.opacity = "0";
      setTimeout(() => {
        splashScreen.style.display = "none";
        mainAppContainer.style.display = "flex";
        // Ejecutar cálculos iniciales para setear la interfaz en 0
        calcularYAnalizarGastos();
        actualizarFondoEmergencia();
      }, 400);
    });
  }

  // Manejo de tabs inferiores
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  const tabPanes = document.querySelectorAll(".app-content .tab-pane");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.getAttribute("data-tab");

      navItems.forEach(nav => nav.classList.remove("active"));
      tabPanes.forEach(pane => pane.style.display = "none");

      item.classList.add("active");
      const targetPane = document.getElementById(`pane-${targetTab}`);
      if (targetPane) {
        targetPane.style.display = "block";
      }
    });
  });

  // --- B. SECCIÓN 1: LÓGICA DE PRESUPUESTO Y GASTOS (5 ITEMS + COACH) ---
  const incomeInput = document.getElementById("income");
  const gastoInputs = document.querySelectorAll(".input-gasto-item");

  if (incomeInput) {
    incomeInput.addEventListener("input", () => {
      calcularYAnalizarGastos();
      actualizarFondoEmergencia();
      calcularBrechaMetas();
    });
  }

  gastoInputs.forEach(input => {
    input.addEventListener("input", () => {
      calcularYAnalizarGastos();
      actualizarFondoEmergencia();
      calcularBrechaMetas();
    });
  });

  function calcularYAnalizarGastos() {
    let totalGastos = 0;
    
    // Sumar los valores de los 5 ítems de gastos
    gastoInputs.forEach(input => {
      totalGastos += parseFloat(input.value) || 0;
    });

    // Actualizar el monto general en la esquina superior de la tarjeta
    const txtTotal = document.getElementById("totalGastosMonto");
    if (txtTotal) {
      txtTotal.textContent = `RD$ ${totalGastos.toLocaleString('es-DO')}`;
    }

    const ingresosMensuales = incomeInput ? (parseFloat(incomeInput.value) || 0) : 0;
    const boxFeedback = document.getElementById("coachGastosFeedback");
    
    if (!boxFeedback) return;

    if (ingresosMensuales <= 0) {
      boxFeedback.innerHTML = `💡 <strong>Coach:</strong> Define tus ingresos en la casilla de arriba para darte un diagnóstico exacto de cómo se distribuyen tus cuartos este mes.`;
      boxFeedback.style.background = "#edf2f7";
      boxFeedback.style.borderColor = "#e2e8f0";
      boxFeedback.style.color = "#4a5568";
      return;
    }

    // Lógica educativa proporcional según niveles de alerta
    const porcentajeConsumido = (totalGastos / ingresosMensuales) * 100;
    
    if (porcentajeConsumido === 0) {
      boxFeedback.innerHTML = `💡 <strong>Coach:</strong> Comienza a registrar tus montos gastados. Evaluaremos tus consumos frente al límite saludable recomendado.`;
      boxFeedback.style.background = "#f7fafc";
      boxFeedback.style.borderColor = "#e2e8f0";
      boxFeedback.style.color = "#4a5568";
    } else if (porcentajeConsumido <= 50) {
      boxFeedback.innerHTML = `✅ <strong>¡Vas excelente!</strong> Has consumido el ${porcentajeConsumido.toFixed(1)}% de tus ingresos. Mantienes tus gastos esenciales y fijos dentro de la zona segura. Te queda margen ideal para tus metas y ahorros.`;
      boxFeedback.style.background = "#EBF8FF";
      boxFeedback.style.borderColor = "#BEE3F8";
      boxFeedback.style.color = "#2B6CB0";
    } else if (porcentajeConsumido <= 80) {
      boxFeedback.innerHTML = `⚠️ <strong>Zona de Cuidado:</strong> Tus gastos consumen el ${porcentajeConsumido.toFixed(1)}% de tu presupuesto. Ojo con los gustos extras y salidas esta semana para evitar quedar en cero antes del próximo cobro.`;
      boxFeedback.style.background = "#FFF9E6";
      boxFeedback.style.borderColor = "#FFEAA7";
      boxFeedback.style.color = "#B7791F";
    } else {
      boxFeedback.innerHTML = `🚨 <strong>Alerta Financiera:</strong> Has comprometido el ${porcentajeConsumido.toFixed(1)}% de tus ingresos. Estás al borde de gastar más de lo que ganas. Frena de golpe las salidas y evalúa qué suscripción puedes suspender hoy mismo.`;
      boxFeedback.style.background = "#FFF5F5";
      boxFeedback.style.borderColor = "#FED7D7";
      boxFeedback.style.color = "#C53030";
    }
  }

  // --- C. SECCIÓN 2: RETO NAVIDEÑO DE AHORRO (22 SEMANAS) ---
  const xmasLevels = document.querySelectorAll(".xmas-levels .xmas-level");
  const xmasWeeksContainer = document.getElementById("xmasWeeks");
  const xmasProgressNum = document.getElementById("xmasProgressNum");
  const xmasCustomInputRow = document.getElementById("xmasCustomInputRow");
  const xmasCustomAmount = document.getElementById("xmasCustomAmount");
  
  let nivelSeleccionado = 50; // Por defecto Medio (RD$50)
  let depositoSemanas = new Array(22).fill(false);

  xmasLevels.forEach(levelBtn => {
    levelBtn.addEventListener("click", () => {
      xmasLevels.forEach(l => l.classList.remove("active"));
      levelBtn.classList.add("active");

      const levelType = levelBtn.getAttribute("data-level");
      if (levelType === "custom") {
        xmasCustomInputRow.style.display = "block";
        nivelSeleccionado = parseFloat(xmasCustomAmount.value) || 0;
      } else {
        xmasCustomInputRow.style.display = "none";
        nivelSeleccionado = parseFloat(levelType);
      }
      
      generarSemanasReto();
      actualizarProgresoReto();
    });
  });

  if (xmasCustomAmount) {
    xmasCustomAmount.addEventListener("input", () => {
      nivelSeleccionado = parseFloat(xmasCustomAmount.value) || 0;
      const customMetaTag = document.getElementById("xmasCustomMetaTag");
      if (customMetaTag) {
        let metaCalculada = 0;
        for (let i = 1; i <= 22; i++) metaCalculada += (nivelSeleccionado * i);
        customMetaTag.textContent = `Meta: RD$ ${metaCalculada.toLocaleString('es-DO')}`;
      }
      generarSemanasReto();
      actualizarProgresoReto();
    });
  }

  function generarSemanasReto() {
    if (!xmasWeeksContainer) return;
    xmasWeeksContainer.innerHTML = "";

    for (let i = 0; i < 22; i++) {
      const numSemana = i + 1;
      const montoSemana = nivelSeleccionado * numSemana;
      
      const weekCard = document.createElement("div");
      weekCard.className = `xmas-week-item ${depositoSemanas[i] ? 'completed' : ''}`;
      weekCard.style = `display: flex; justify-content: space-between; align-items: center; background: ${depositoSemanas[i] ? '#E6FFFA' : '#f8f9fa'}; border: 1px solid ${depositoSemanas[i] ? '#319795' : '#edf2f7'}; padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; user-select: none;`;
      
      weekCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" ${depositoSemanas[i] ? 'checked' : ''} style="accent-color: #319795; transform: scale(1.1);">
          <span style="font-size: 13px; font-weight: 600; color: #2d3748;">Semana ${numSemana}</span>
        </div>
        <span style="font-family: 'IBM Plex Mono', monospace; font-size: 13.5px; font-weight: 700; color: ${depositoSemanas[i] ? '#234E52' : '#4a5568'};">RD$ ${montoSemana.toLocaleString('es-DO')}</span>
      `;

      weekCard.addEventListener("click", (e) => {
        // Prevenir doble ejecución si hacen click directo en el checkbox
        if (e.target.tagName !== "INPUT") {
          depositoSemanas[i] = !depositoSemanas[i];
        } else {
          depositoSemanas[i] = e.target.checked;
        }
        generarSemanasReto();
        actualizarProgresoReto();
      });

      xmasWeeksContainer.appendChild(weekCard);
    }
  }

  function actualizarProgresoReto() {
    let acumuladoAhorrado = 0;
    let metaTotalReto = 0;

    for (let i = 0; i < 22; i++) {
      const montoSemana = nivelSeleccionado * (i + 1);
      metaTotalReto += montoSemana;
      if (depositoSemanas[i]) {
        acumuladoAhorrado += montoSemana;
      }
    }

    if (xmasProgressNum) {
      xmasProgressNum.textContent = `RD$ ${acumuladoAhorrado.toLocaleString('es-DO')} de RD$ ${metaTotalReto.toLocaleString('es-DO')}`;
    }
  }

  // Inicializar las semanas del reto por primera vez
  generarSemanasReto();

  // --- D. SECCIÓN 3: RUTA DE METAS (FONDO DE EMERGENCIA, BRECHA E INGRESOS) ---
  const emergencySlider = document.getElementById("emergencySlider");
  const emergencyMonthsLabel = document.getElementById("emergencyMonthsLabel");
  const emergencyTotalVal = document.getElementById("emergencyTotalVal");

  if (emergencySlider) {
    emergencySlider.addEventListener("input", actualizarFondoEmergencia);
  }

  function actualizarFondoEmergencia() {
    if (!emergencySlider || !emergencyTotalVal) return;
    
    const meses = parseInt(emergencySlider.value);
    if (emergencyMonthsLabel) emergencyMonthsLabel.textContent = `${meses} meses`;

    // Calcular en base a los gastos declarados del mes
    let totalGastosFijos = 0;
    gastoInputs.forEach(input => {
      totalGastosFijos += parseFloat(input.value) || 0;
    });

    const fondoCalculado = totalGastosFijos * meses;
    emergencyTotalVal.textContent = `RD$ ${fondoCalculado.toLocaleString('es-DO')}`;
  }

  // Lógica del planificador de metas (Cálculo de Brecha + Módulo Dinero Oculto)
  const targetGoalName = document.getElementById("targetGoalName");
  const targetGoalAmount = document.getElementById("targetGoalAmount");
  const targetGoalMonths = document.getElementById("targetGoalMonths");
  const coachAlertBox = document.getElementById("coachAlertBox");
  const entrepreneurshipModule = document.getElementById("entrepreneurshipModule");
  const ideasContainer = document.getElementById("entrepreneurshipIdeasContainer");

  if (targetGoalName) targetGoalName.addEventListener("input", calcularBrechaMetas);
  if (targetGoalAmount) targetGoalAmount.addEventListener("input", calcularBrechaMetas);
  if (targetGoalMonths) targetGoalMonths.addEventListener("input", calcularBrechaMetas);

  function calcularBrechaMetas() {
    if (!targetGoalAmount || !targetGoalMonths || !coachAlertBox) return;

    const montoMeta = parseFloat(targetGoalAmount.value) || 0;
    const mesesMeta = parseInt(targetGoalMonths.value) || 0;
    const nombreMeta = targetGoalName ? targetGoalName.value.trim() : "tu meta";

    if (montoMeta <= 0 || mesesMeta <= 0) {
      coachAlertBox.style.display = "none";
      if (entrepreneurshipModule) entrepreneurshipModule.style.display = "none";
      return;
    }

    const ahorroMensualRequerido = montoMeta / mesesMeta;

    // Calcular capacidad actual de ahorro (Ingresos - Gastos)
    const ingresos = incomeInput ? (parseFloat(incomeInput.value) || 0) : 0;
    let gastos = 0;
    gastoInputs.forEach(input => gastos += parseFloat(input.value) || 0);
    const capacidadAhorroActual = Math.max(0, ingresos - gastos);

    coachAlertBox.style.display = "block";

    if (capacidadAhorroActual >= ahorroMensualRequerido) {
      // Tiene suficiente capacidad con sus finanzas actuales
      coachAlertBox.style.background = "#E6FFFA";
      coachAlertBox.style.border = "1px solid #319795";
      coachAlertBox.style.color = "#234E52";
      coachAlertBox.innerHTML = `🌟 <strong>¡Felicidades!</strong> Tu capacidad de ahorro actual (RD$ ${capacidadAhorroActual.toLocaleString('es-DO')}/mes) cubre perfectamente los RD$ ${ahorroMensualRequerido.toLocaleString('es-DO')}/mes necesarios para alcanzar la meta de <strong>${nombreMeta}</strong> en ${mesesMeta} meses. ¡Mantén la disciplina!`;
      if (entrepreneurshipModule) entrepreneurshipModule.style.display = "none";
    } else {
      // Existe una brecha financiera: desplegar Dinero Oculto y sugerir Micro-emprendimientos
      const brecha = ahorroMensualRequerido - capacidadAhorroActual;
      
      coachAlertBox.style.background = "#FFF5F5";
      coachAlertBox.style.border = "1px solid #FED7D7";
      coachAlertBox.style.color = "#742A2A";
      
      coachAlertBox.innerHTML = `
        💥 <strong>Tenemos una brecha:</strong> Para lograr <strong>${nombreMeta}</strong> necesitas ahorrar <strong>RD$ ${ahorroMensualRequerido.toLocaleString('es-DO')}/mes</strong>, pero tu saldo actual solo te permite guardar RD$ ${capacidadAhorroActual.toLocaleString('es-DO')}/mes. 
        <br><br>
        ⚠️ Te faltan <strong>RD$ ${brecha.toLocaleString('es-DO')} cada mes</strong>. 
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #FED7D7;">
        🔍 <strong>Módulo de Dinero Oculto:</strong> Antes de estresarte, ¿has revisado tus <i>gastos hormiga</i> en "Gustos y Salidas"? Si recortas un 15% de ahí o cancelas esa suscripción que no usas, puedes recuperar parte del dinero oculto para tu meta. Mira las sugerencias de abajo para generar el resto.
      `;

      // Activar catálogo dinámico de Micro-emprendimientos dominicanos para cubrir la brecha
      if (entrepreneurshipModule) {
        entrepreneurshipModule.style.display = "block";
        desplegarIdeasEmprendimiento(brecha);
      }
    }
  }

  function desplegarIdeasEmprendimiento(brechaMensual) {
    if (!ideasContainer) return;
    ideasContainer.innerHTML = "";

    // Ideas adaptadas localmente al mercado dominicano
    const catalogo = [
      { titulo: "📸 Gestión de Redes Sociales (Freelance)", retorno: 6000, desc: "Maneja el Instagram o TikTok de 1 o 2 negocios locales de tu sector los fines de semana." },
      { titulo: "🍪 Repostería o Snacks por encargo", retorno: 4500, desc: "Hornea galletas, brownies o bizcochos los viernes y véndelos entre tus compañeros de trabajo o vecinos." },
      { titulo: "🇬🇧 Tutorías de Inglés o Clases Particulares", retorno: 5000, desc: "Si dominas un segundo idioma o materia, ofrece 4 horas de asesoría semanales vía Zoom a estudiantes escolares." },
      { titulo: "🧼 Car Wash premium a domicilio", retorno: 7000, desc: "Lava y detalla vehículos en los parqueos de tu mismo residencial los sábados por la mañana." }
    ];

    catalogo.forEach(idea => {
      const mesesParaBrecha = Math.ceil(brechaMensual / idea.retorno);
      
      const itemIdea = document.createElement("div");
      itemIdea.style = "background: #fff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);";
      itemIdea.innerHTML = `
        <div style="font-weight: 700; color: #1a202c; font-size: 13.5px;">${idea.titulo}</div>
        <div style="font-size: 12.5px; color: #4a5568; margin-top: 4px; line-height: 1.4;">${idea.desc}</div>
        <div style="margin-top: 6px; font-size: 11.5px; font-weight: 600; color: #FD8C45; background: #FFF5F5; display: inline-block; padding: 2px 8px; border-radius: 4px;">
          💰 Aporta ~RD$ ${idea.retorno.toLocaleString('es-DO')}/mes (Cubre tu brecha en unas ${mesesParaBrecha} línea(s) de esfuerzo)
        </div>
      `;
      ideasContainer.appendChild(itemIdea);
    });
  }

  // --- E. SECCIÓN 4: INTERACTIVIDAD DE LA ACADEMIA (AFP Y TARJETA) ---
  
  // 1. Simulador AFP (SIPEN 2.87%)
  const afpSalario = document.getElementById("afpSalario");
  const afpSimResult = document.getElementById("afpSimResult");

  if (afpSalario && afpSimResult) {
    afpSalario.addEventListener("input", () => {
      const sueldo = parseFloat(afpSalario.value) || 0;
      if (sueldo <= 0) {
        afpSimResult.textContent = "";
        return;
      }
      const aporteTrabajador = sueldo * 0.0287;
      const aporteEmpleador = sueldo * 0.0710;
      const totalMes = aporteTrabajador + aporteEmpleador;

      afpSimResult.innerHTML = `
        📌 <b>Tu descuento (2.87%):</b> RD$ ${aporteTrabajador.toLocaleString('es-DO', {maximumFractionDigits:2})}<br>
        🏢 <b>Tu empresa aporta (7.10%):</b> RD$ ${aporteEmpleador.toLocaleString('es-DO', {maximumFractionDigits:2})}<br>
        📉 <b>Total invertido en tu CCI al mes:</b> RD$ ${totalMes.toLocaleString('es-DO', {maximumFractionDigits:2})}
      `;
    });
  }

  // 2. Simulador Tarjeta de Crédito (Totalero vs Mínimo)
  const creditSlider = document.getElementById("creditSlider");
  const creditPctLabel = document.getElementById("creditPctLabel");
  const creditTag = document.getElementById("creditTag");
  const creditPaid = document.getElementById("creditPaid");
  const creditRemaining = document.getElementById("creditRemaining");
  const creditInterest = document.getElementById("creditInterest");

  if (creditSlider) {
    creditSlider.addEventListener("input", () => {
      const balanceTotal = 25000;
      const tasaAnual = 0.52; // 52% de interés anual tradicional
      const tasaMensual = tasaAnual / 12;

      const pctPago = parseInt(creditSlider.value);
      if (creditPctLabel) creditPctLabel.textContent = `${pctPago}%`;

      const montoPagado = balanceTotal * (pctPago / 100);
      const montoPendiente = balanceTotal - montoPagado;
      const interesGenerado = montoPendiente * tasaMensual;

      if (creditPaid) creditPaid.textContent = `RD$ ${Math.round(montoPagado).toLocaleString('es-DO')}`;
      if (creditRemaining) creditRemaining.textContent = `RD$ ${Math.round(montoPendiente).toLocaleString('es-DO')}`;
      if (creditInterest) creditInterest.textContent = `RD$ ${Math.round(interesGenerado).toLocaleString('es-DO')}`;

      // Actualizar tags de alerta visuales
      if (creditTag) {
        if (pctPago === 100) {
          creditTag.textContent = "🔥 ¡Cliente Totalero! Cero interés";
          creditTag.style.color = "#319795";
        } else if (pctPago >= 50) {
          creditTag.textContent = "Riesgo moderado";
          creditTag.style.color = "#D69E2E";
        } else {
          creditTag.textContent = "🚨 Trampa de deuda (Pago mínimo)";
          creditTag.style.color = "#E53E3E";
        }
      }
    });
  }

  // 3. Activación del Upsell de Niños
  const kidsUnlockBtn = document.getElementById("kidsUnlockBtn");
  const kidsPreview = document.getElementById("kidsPreview");
  const kidsFull = document.getElementById("kidsFull");

  if (kidsUnlockBtn && kidsPreview && kidsFull) {
    kidsUnlockBtn.addEventListener("click", () => {
      kidsPreview.style.display = "none";
      kidsFull.style.display = "block";
    });
  }
});
