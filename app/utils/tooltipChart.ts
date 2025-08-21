const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode?.querySelector("#chartjs-tooltip");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chartjs-tooltip";
    tooltipEl.innerHTML = "<table></table>";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-50%, 0)";
    tooltipEl.style.transition = "all .3s ease";
    tooltipEl.style.pointerEvents = "none";
    chart.canvas.parentNode?.appendChild(tooltipEl);
  }

  return tooltipEl;
};

export const tooltipChart = (context: any, data: any) => {
  const { chart, tooltip } = context;

  const tooltipEl = getOrCreateTooltip(chart);

  // Ocultar tooltip si no hay datos
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  let tooltipTransform = "translate(-50%, -50%)";

  // Obtener los datos del punto
  if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
    const dataIndex = tooltip.dataPoints[0].dataIndex;
    const dayData = data[dataIndex];
    // Calcular la posición del tooltip (izquierda/derecha)
    if (data.length > 1) {
      if (dataIndex <= Math.floor((data.length - 1) / 2)) {
        // Primeros o antes de la mitad: derecha
        tooltipTransform = "translate(0, -50%)";
      }
      else {
        // Después de la mitad o último: izquierda
        tooltipTransform = "translate(-100%, -50%)";
      }
    }

    if (dayData && dayData.matches) {
      const currentRank = valueToRank(dayData.value);
      let rankDisplay = currentRank.tier;
      if (currentRank.division) {
        rankDisplay += ` ${currentRank.division}`;
      }
      rankDisplay += ` (${currentRank.lp} LP)`;

      // Calcular LP total ganado/perdido
      let totalChange = 0;
      if (dataIndex > 0 && dayData.matches.length > 0) {
        const previousDayFinalValue = data[dataIndex - 1]!.value;
        const currentDayFinalValue = dayData.value;
        totalChange = currentDayFinalValue - previousDayFinalValue;
      }

      const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : totalChange === 0 ? "0" : `${Math.round(totalChange)}`;
      const changeEmoji = totalChange > 0 ? "🟢" : totalChange < 0 ? "🔴" : "⚪";

      let innerHtml = `
      <div style="
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid #3B82F6;
        border-radius: 8px;
        padding: 6px 0px;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        overflow: hidden;
        width: max-content;
      ">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 6px; padding: 0 12px;">
          Fecha: ${tooltip.dataPoints[0].label}
        </div>
        <div style="margin-bottom: 4px; padding: 0 12px;">Rango final: ${rankDisplay}</div>
        <div style="margin-bottom: 6px; padding: 0 12px;">Cambio: ${changeText} LP ${changeEmoji}</div>
        <div style="margin-bottom: 6px; padding: 0 12px;">Partidas: ${dayData.matches.length}</div>
            `;

      // Agregar partidas con iconos de campeones
      dayData.matches.toReversed().forEach((match: any) => {
        const championIconUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${match.championId}.png`;
        innerHtml += `
          <div class="${match.isRemake ? "bg-neutral-900" : match.win ? "bg-green-900" : "bg-red-900"}">
          <span style="display: flex; align-items: center; padding: 6px 12px; gap: 4px;">
            <img 
              src="${championIconUrl}" 
              alt="${match.champion}" 
              style="
                width: 24px; 
                height: 24px; 
                border-radius: 4px; 
                border: 1px solid #374151;
              "
              onerror="this.style.display='none'"
            />
            <span>${match.champion}: ${match.score.kills}/${match.score.deaths}/${match.score.assists} · ${match.time}</span>
            </span>
          </div>
        `;
      });

      innerHtml += "</div>";
      tooltipEl.querySelector("table")!.innerHTML = innerHtml;
    }
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
  tooltipEl.style.transform = tooltipTransform;
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + "px " + tooltip.options.padding + "px";
};
