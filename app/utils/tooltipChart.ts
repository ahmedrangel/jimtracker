import type { Chart, TooltipModel } from "chart.js";

export const tooltipChart = (context: { chart: Chart, tooltip: TooltipModel<"line"> }, data: ChartXData[], type: "daily" | "match") => {
  const { chart, tooltip } = context;
  let tooltipTransform = "translate(-50%, -50%)";
  let tooltipContent;

  if (tooltip.opacity === 0) {
    return {
      style: {
        opacity: 0,
        left: "50%",
        top: "50%",
        transform: tooltipTransform
      }
    };
  }

  if (tooltip?.dataPoints?.length) {
    const label = tooltip.dataPoints[0]!.label;
    const dataIndex = tooltip?.dataPoints[0]!.dataIndex;
    const dayData = data[dataIndex];
    if (data.length > 1) {
      if (dataIndex <= Math.floor((data.length - 1) / 2)) {
        tooltipTransform = "translate(0, -50%)";
      }
      else {
        tooltipTransform = "translate(-100%, -50%)";
      }
    }

    if (type === "match" && dayData && dayData.data) {
      const matchData = dayData.data as ChartMatchData;
      const matchRank = valueToTier(matchData.value);
      let rankDisplay = "";
      if (matchRank.division) {
        rankDisplay += ` ${matchRank.division}`;
      }
      rankDisplay += ` · ${matchRank.lp} LP`;

      let totalChange = 0;

      if (dataIndex && dayData.data) {
        const previousMatch = data[dataIndex - 1]?.data as ChartMatchData;
        if (previousMatch) {
          totalChange = matchData.value - previousMatch.value;
        }
      }

      const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : totalChange === 0 ? "0" : `${Math.round(totalChange)}`;
      const changeIcon = totalChange > 0 ? "tabler:caret-up-filled" : totalChange < 0 ? "tabler:caret-down-filled" : "tabler:caret-up-down-filled";
      const changeColor = totalChange > 0 ? "text-blue-500" : totalChange < 0 ? "text-red-500" : "text-neutral-500";
      tooltipContent = {
        label,
        rankDisplay,
        changeText,
        changeIcon,
        changeColor,
        dataTier: matchRank.id,
        data: { ...dayData.data }
      };
    }
    else if (type === "daily" && dayData && dayData.data) {
      const matchesData = dayData.data as ChartMatchData[];
      const currentRank = valueToTier(dayData.value);
      let rankDisplay = "";
      if (currentRank.division) {
        rankDisplay += ` ${currentRank.division}`;
      }
      rankDisplay += ` · ${currentRank.lp} LP`;

      let totalChange = 0;
      if (dataIndex && matchesData?.length) {
        const previousDayFinalValue = data[dataIndex - 1]!.value;
        const currentDayFinalValue = dayData.value;
        totalChange = currentDayFinalValue - previousDayFinalValue;
      }

      const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : totalChange === 0 ? "0" : `${Math.round(totalChange)}`;
      const changeIcon = totalChange > 0 ? "tabler:caret-up-filled" : totalChange < 0 ? "tabler:caret-down-filled" : "tabler:caret-up-down-filled";
      const changeColor = totalChange > 0 ? "text-blue-500" : totalChange < 0 ? "text-red-500" : "text-neutral-500";
      tooltipContent = {
        label,
        rankDisplay,
        changeText,
        changeIcon,
        changeColor,
        dataTier: currentRank.id,
        data: matchesData.toReversed().map(match => ({ ...match }))
      };
    }
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  const x = positionX + tooltip.caretX;
  const y = positionY + tooltip.caretY;
  return {
    style: {
      opacity: 1,
      left: `${x}px`,
      top: `${y}px`,
      transform: tooltipTransform
    },
    content: tooltipContent
  };
};
