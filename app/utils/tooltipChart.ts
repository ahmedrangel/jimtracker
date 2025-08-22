export const tooltipChart = (context: any, data: any, type: "daily" | "match") => {
  const { chart, tooltip } = context;

  if (tooltip.opacity === 0) {
    return {
      visible: false,
      x: 0,
      y: 0,
      transform: "translate(-50%, -50%)"
    };
  }

  let tooltipTransform = "translate(-50%, -50%)";
  let tooltipContent;

  if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
    const dataIndex = tooltip.dataPoints[0].dataIndex;
    const dayData = data[dataIndex];
    if (data.length > 1) {
      if (dataIndex <= Math.floor((data.length - 1) / 2)) {
        tooltipTransform = "translate(0, -50%)";
      }
      else {
        tooltipTransform = "translate(-100%, -50%)";
      }
    }

    if (type === "match" && dayData && dayData.match) {
      const matchRank = valueToRank(dayData.match.value);
      let rankDisplay = "";
      if (matchRank.division) {
        rankDisplay += ` ${matchRank.division}`;
      }
      rankDisplay += ` · ${matchRank.lp} LP`;

      let totalChange = 0;

      if (dataIndex > 0 && dayData.match) {
        const previousMatch = data[dataIndex - 1]?.match;
        if (previousMatch) {
          totalChange = dayData.match.value - previousMatch.value;
        }
      }

      const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : totalChange === 0 ? "0" : `${Math.round(totalChange)}`;
      const changeIcon = totalChange > 0 ? "tabler:caret-up-filled" : totalChange < 0 ? "tabler:caret-down-filled" : "tabler:caret-up-down-filled";
      const changeColor = totalChange > 0 ? "text-green-500" : totalChange < 0 ? "text-red-500" : "text-yellow-500";
      tooltipContent = {
        label: tooltip.dataPoints[0].label,
        rankDisplay,
        changeText,
        changeIcon,
        changeColor,
        matchTier: matchRank.id,
        match: {
          ...dayData.match,
          championIconUrl: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${dayData.match.championId}.png`
        }
      };
    }
    else if (dayData && dayData.matches) {
      const currentRank = valueToRank(dayData.value);
      let rankDisplay = "";
      if (currentRank.division) {
        rankDisplay += ` ${currentRank.division}`;
      }
      rankDisplay += ` · ${currentRank.lp} LP`;

      let totalChange = 0;
      if (dataIndex > 0 && dayData.matches.length > 0) {
        const previousDayFinalValue = data[dataIndex - 1]!.value;
        const currentDayFinalValue = dayData.value;
        totalChange = currentDayFinalValue - previousDayFinalValue;
      }

      const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : totalChange === 0 ? "0" : `${Math.round(totalChange)}`;
      const changeIcon = totalChange > 0 ? "tabler:caret-up-filled" : totalChange < 0 ? "tabler:caret-down-filled" : "tabler:caret-up-down-filled";
      const changeColor = totalChange > 0 ? "text-green-500" : totalChange < 0 ? "text-red-500" : "text-yellow-500";
      tooltipContent = {
        label: tooltip.dataPoints[0].label,
        rankDisplay,
        changeText,
        changeIcon,
        changeColor,
        dayTier: currentRank.id,
        matches: dayData.matches.toReversed().map((match: any) => ({
          ...match,
          championIconUrl: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${match.championId}.png`
        }))
      };
    }
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  return {
    visible: true,
    x: positionX + tooltip.caretX,
    y: positionY + tooltip.caretY,
    transform: tooltipTransform,
    content: tooltipContent
  };
};
