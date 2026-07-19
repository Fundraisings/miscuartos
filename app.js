/**
 * miscuartos — Core Application Logic
 * Dashboard interactivo, reportes integrados a WhatsApp y Coach de Salud Presupuestaria.
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // --- A. INICIALIZACIÓN Y NAVEGACIÓN ---
  const enterAppBtn = document.getElementById("enterAppBtn");
  const splashScreen = document.getElementById("app-splash");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (enterAppBtn && splashScreen && mainAppContainer) {
    enterAppBtn.addEventListener("click", () => {
      splashScreen.style.transition = "opacity 0.4s ease";
      splashScreen.style.opacity = "0";
      setTimeout(() => {
        splashScreen.style.display = "none";
        mainAppContainer.style.display = "flex";
        
        // Ejecución de cálculos iniciales limpios
        calcularYAnalizarGastos();
        actualizarFondoEmergencia();
      }, 400);
    });
  }

  // Lógica del sistema de pestañas inferiores (Tab Navigation)
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

  // --- B. SECCIÓN 1: CONTROL DE PRESUPUESTO (7 ÍTEMS + COACH FINANCIERO) ---
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
    
    // Sumar de forma reactiva los montos de las 7 casillas
    gastoInputs.forEach(input => {
      totalGastos += parseFloat(input.value) || 0;
    });

    const txtTotal = document.getElementById("totalGastosMonto");
    if (txtTotal) {
      txtTotal.textContent = `RD$ ${totalGastos.toLocaleString('es-DO')}`;
    }

    const ingresosMensuales = incomeInput ? (parseFloat(incomeInput.value) || 0) : 0;
    const boxFeedback = document.getElementById("coachGastosFeedback");
    
    if (!boxFeedback) return;

    if (ingresosMensuales <= 0) {
      boxFeedback.innerHTML = `💡 <strong>Estado del Presupuesto:</strong> Ingresa tus ingresos mensuales arriba para evaluar cómo va la distribución de tus cuartos este mes.`;
      boxFeedback.style.background = "#f7fafc";
      boxFeedback.style.borderColor = "#e2e8f0";
      boxFeedback.style.color = "#4a5568";
      return;
    }

    // Diagnósticos proporcionales del Coach Financiero
    const porcentajeConsumido = (totalGastos / ingresosMensuales) * 100;
    
    if (porcentajeConsumido === 0) {
      boxFeedback.innerHTML = `💡 <strong>Coach:</strong> Registra tus montos de gasto diario. Evaluaremos su impacto frente a tus ingresos de forma inmediata.`;
      boxFeedback.style.background = "#f7fafc";
      boxFeedback.style.borderColor = "#e2e8f0";
      boxFeedback.style.color = "#4a5568";
    } else if (porcentajeConsumido <= 50) {
      boxFeedback.innerHTML = `✅ <strong>¡Vas excelente!</strong> Tus gastos representan el ${porcentajeConsumido.toFixed(1)}% de tus ingresos. Mantienes tus costos fijos y consumos controlados en la zona segura. Tienes excelente margen para tus metas.`;
      boxFeedback.style.background = "#E6FFFA";
      boxFeedback.style.borderColor = "#BEE3F8";
      boxFeedback.style.color = "#234E52";
    } else if (porcentajeConsumido <= 80) {
      boxFeedback.innerHTML = `⚠️ <strong>Zona de Cuidado:</strong> Tus gastos absorben el ${porcentajeConsumido.toFixed(1)}% de lo que ganas. Monitorea de cerca las salidas de fin de semana para no quedar en cero antes de que termine el mes.`;
      boxFeedback.style.background = "#FFF9E6";
      boxFeedback.style.borderColor = "#FFEAA7";
      boxFeedback.style.color = "#B7791F";
    } else {
      boxFeedback.innerHTML = `🚨 <strong>Alerta Financiera:</strong> Has comprometido el ${porcentajeConsumido.toFixed(1)}% de tus cuartos. Estás al límite o gastando más de tu capacidad real. Reduce suscripciones y frena gastos hormiga hoy.`;
      boxFeedback.style.background = "#FFF5F5";
      boxFeedback.style.borderColor = "#FED7D7";
      boxFeedback.style.color = "#C53030";
    }
  }

  // --- C. CONTROL DEL MODAL DETALLADO Y EXPORTACIÓN A WHATSAPP ---
  const btnVerResumen = document.getElementById("btnVerResumen");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const summaryTotal = document.getElementById("summaryTotal");
  const summaryRows = document.getElementById("summaryRows");
  const whatsappBtn = document.getElementById("whatsappBtn");

  if (btnVerResumen && modalOverlay) {
    btnVerResumen.addEventListener("click", () => {
      let total = 0;
      let filasHTML = "";
      let textoMensajeWS = "📈 *Resumen de Gastos Mensuales — MisCuartos App* \n\n";

      filasHTML += `<div style="display:flex; flex-direction:column; gap:9px; margin-top:8px;">`;
      
      // Recorrer los 7 ítems para armar la interfaz del modal y el texto de WhatsApp
      gastoInputs.forEach(input => {
        const nombreItem = input.getAttribute("data-name");
        const valorItem = parseFloat(input.value) || 0;
        total += valorItem;

        filasHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; border-bottom:1px dashed #e2e8f0; padding-bottom:4px;">
            <span style="color:#4a5568; font-weight:600;">${nombreItem}:</span>
            <span style="font-family:'IBM Plex Mono', monospace; font-weight:700; color:#1a202c;">RD$ ${valorItem.toLocaleString('es-DO')}</span>
          </div>`;
        
        if (valorItem > 0) {
          textoMensajeWS += `▫️ *${nombreItem}:* RD$ ${valorItem.toLocaleString('es-DO')}\n`;
        }
      });
      
      filasHTML += `</div>`;
      textoMensajeWS += `\n💰 *Monto Total:* RD$ ${total.toLocaleString('es-DO')}\n\n_Reporte calculado con mi app móvil miscuartos._`;

      if (summaryTotal) summaryTotal.textContent = `RD$ ${total.toLocaleString('es-DO')}`;
      if (summaryRows) summaryRows.innerHTML = filasHTML;

      // Generar link oficial para WhatsApp API
      if (whatsappBtn) {
        whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensajeWS)}`;
      }

      modalOverlay.style.display = "flex";
    });
  }

  if (closeModal && modalOverlay) {
    closeModal.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });
  }

  // --- D. SECCIÓN 2: RETO NAVIDEÑO DE AHORRO (22 SEMANAS) ---
  const xmasLevels = document.querySelectorAll(".xmas-levels .xmas-level");
  const xmasWeeksContainer = document.getElementById("xmasWeeks");
  const xmasProgressNum = document.getElementById("xmasProgressNum");
  const xmasCustomInputRow = document.getElementById("xmasCustomInputRow");
  const xmasCustomAmount = document.getElementById("xmasCustomAmount");
  
  let nivelSeleccionado = 50; 
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
      weekCard.style = `display: flex; justify-content: space-between; align-items: center; background: ${depositoSemanas[i] ? '#E6FFFA' : '#f8f9fa'}; border: 1px solid ${depositoSemanas[i] ? '#319795' : '#edf2f7'}; padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; user-select: none;`;
      
      weekCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" ${depositoSemanas[i] ? 'checked' : ''} style="accent-color: #319795; transform: scale(1.15);">
          <span style="font-size: 13px; font-weight: 600; color: #2d3748;">Semana ${numSemana}</span>
        </div>
        <span style="font-family: 'IBM Plex Mono', monospace; font-size: 13.5px; font-weight: 700; color: ${depositoSemanas[i] ? '#234E52' : '#4a5568'};">RD$ ${montoSemana.toLocaleString('es-DO')}</span>
      `;

      weekCard.addEventListener("click", (e) => {
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
      if (depositoSemanas[i]) acumuladoAhorrado += montoSemana;
    }

    if (xmasProgressNum) {
      xmasProgressNum.textContent = `RD$ ${acumuladoAhorrado.toLocaleString('es-DO')} de RD$ ${metaTotalReto.toLocaleString('es-DO')}`;
    }
  }

  // Inicialización de arranque para el contenedor del Reto Navideño
  generarSemanasReto();

  // --- E. SECCIÓN 3: RUTA DE METAS & FONDO DE EMERGENCIA ---
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

    let totalGastosFijos = 0;
    gastoInputs.forEach(input => {
      totalGastosFijos += parseFloat(input.value) || 0;
    });

    const fondoCalculado = totalGastosFijos * meses;
    emergencyTotalVal.textContent = `RD$ ${fondoCalculado.toLocaleString('es-DO')}`;
  }

  // Planificador de Metas con Cálculo de Brecha y Módulo Dinero Oculto
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

    // Capacidad de Ahorro Real = Ingresos - Gastos declarados
    const ingresos = incomeInput ? (parseFloat(incomeInput.value) || 0) : 0;
    let gastos = 0;
    gastoInputs.forEach(input => gastos += parseFloat(input.value) || 0);
    const capacidadAhorroActual = Math.max(0, ingresos - gastos);

    coachAlertBox.style.display = "block";

    if (capacidadAhorroActual >= ahorroMensualRequerido) {
      coachAlertBox.style.background = "#E6FFFA";
      coachAlertBox.style.border = "1px solid #319795";
      coachAlertBox.style.color = "#234E52";
      coachAlertBox.innerHTML = `🌟 <b>¡Capacidad Confirmada!</b> Tu balance actual te permite guardar RD$ ${capacidadAhorroActual.toLocaleString('es-DO')}/mes, cubriendo perfectamente los RD$ ${ahorroMensualRequerido.toLocaleString('es-DO')}/mes requeridos para alcanzar <b>${nombreMeta}</b> en ${mesesMeta} meses.`;
      if (entrepreneurshipModule) entrepreneurshipModule.style.display = "none";
    } else {
      const brecha = ahorroMensualRequerido - capacidadAhorroActual;
      
      coachAlertBox.style.background = "#FFF5F5";
      coachAlertBox.style.border = "1px solid #FED7D7";
      coachAlertBox.style.color = "#742A2A";
      
      coachAlertBox.innerHTML = `
        💥 <b>Falta presupuesto:</b> Para lograr <b>${nombreMeta}</b> necesitas guardar <b>RD$ ${ahorroMensualRequerido.toLocaleString('es-DO')}/mes</b>. Tu capacidad de ahorro actual es de RD$ ${capacidadAhorroActual.toLocaleString('es-DO')}/mes.
        <br><br>
        ⚠️ Tienes una brecha de <b>RD$ ${brecha.toLocaleString('es-DO')} mensuales</b>.
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #FED7D7;">
        🔍 <b>Módulo de Dinero Oculto:</b> Intenta optimizar un 15% de "Gustos y Salidas" o recortar suscripciones inactivas para liberar parte de esos cuartos. Mira abajo opciones recomendadas para generar la diferencia.
      `;

      if (entrepreneurshipModule) {
        entrepreneurshipModule.style.display = "block";
        desplegarIdeasEmprendimiento(brecha);
      }
    }
  }

  function desplegarIdeasEmprendimiento(brechaMensual) {
    if (!ideasContainer) return;
    ideasContainer.innerHTML = "";

    const catalogo = [
      { titulo: "📸 Freelance Social Media", retorno: 6000, desc: "Gestiona las publicaciones o Reels de un negocio local los fines de semana." },
      { titulo: "🍪 Repostería/Snacks por encargo", retorno: 4500, desc: "Hornea brownies o postres caseros y distribúyelos con compañeros de trabajo o vecinos." },
      { titulo: "🧼 Detallado vehicular / Car Wash premium", retorno: 7000, desc: "Ofrece lavado y aspirado a domicilio los sábados en los parqueos de tu mismo residencial." }
    ];

    catalogo.forEach(idea => {
      const lineasNecesarias = Math.ceil(brechaMensual / idea.retorno);
      
      const itemIdea = document.createElement("div");
      itemIdea.style = "background: #fff; border: 1px solid #cbd5e1; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);";
      itemIdea.innerHTML = `
        <div style="font-weight: 700; color: #1a202c; font-size: 13px;">${idea.titulo}</div>
        <div style="font-size: 12px; color: #4a5568; margin-top: 3px; line-height: 1.4;">${idea.desc}</div>
        <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #c53030; background: #FFF5F5; display: inline-block; padding: 2px 8px; border-radius: 4px;">
          💰 Aporta ~RD$ ${idea.retorno.toLocaleString('es-DO')}/mes (Cubre tu brecha en ${lineasNecesarias} línea(s) de esfuerzo)
        </div>
      `;
      ideasContainer.appendChild(itemIdea);
    });
  }

  // --- F. SECCIÓN 4: INTERACTIVIDAD DE LA ACADEMIA ED. FINANCIERA ---
  
  // 1. Simulador de Retenciones AFP (SIPEN 2.87% Trabajador / 7.10% Empleador)
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
        📌 <b>Tu descuento ley (2.87%):</b> RD$ ${aporteTrabajador.toLocaleString('es-DO', {maximumFractionDigits:2})}<br>
        🏢 <b>Aporte de tu empleador (7.10%):</b> RD$ ${aporteEmpleador.toLocaleString('es-DO', {maximumFractionDigits:2})}<br>
        📉 <b>Directo a tu fondo CCI mensual:</b> RD$ ${totalMes.toLocaleString('es-DO', {maximumFractionDigits:2})}
      `;
    });
  }

  // 2. Simulador Tarjeta de Crédito (Cálculo Financiamiento 52% anual)
  const creditSlider = document.getElementById("creditSlider");
  const creditPctLabel = document.getElementById("creditPctLabel");
  const creditTag = document.getElementById("creditTag");
  const creditPaid = document.getElementById("creditPaid");
  const creditRemaining = document.getElementById("creditRemaining");
  const creditInterest = document.getElementById("creditInterest");

  if (creditSlider) {
    creditSlider.addEventListener("input", () => {
      const balanceTotal = 25000;
      const tasaAnual = 0.52; 
      const tasaMensual = tasaAnual / 12;

      const pctPago = parseInt(creditSlider.value);
      if (creditPctLabel) creditPctLabel.textContent = `${pctPago}%`;

      const montoPagado = balanceTotal * (pctPago / 100);
      const montoPendiente = balanceTotal - montoPagado;
      const interesGenerado = montoPendiente * tasaMensual;

      if (creditPaid) creditPaid.textContent = `RD$ ${Math.round(montoPagado).toLocaleString('es-DO')}`;
      if (creditRemaining) creditRemaining.textContent = `RD$ ${Math.round(montoPendiente).toLocaleString('es-DO')}`;
      if (creditInterest) creditInterest.textContent = `RD$ ${Math.round(interesGenerado).toLocaleString('es-DO')}`;

      if (creditTag) {
        if (pctPago === 100) {
          creditTag.textContent = "🔥 ¡Cliente Totalero! Cero interés";
          creditTag.style.color = "#319795";
        } else if (pctPago >= 50) {
          creditTag.textContent = "Riesgo moderado";
          creditTag.style.color = "#dd6b20";
        } else {
          creditTag.textContent = "🚨 Trampa de Deuda (Pago Mínimo)";
          creditTag.style.color = "#e53e3e";
        }
      }
    });
  }

  // 3. Control del trigger para el Upsell de Niños
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
