// Helpers
export const socials = [
  {
    id: "twitch",
    title: "Twitch",
    icon: "simple-icons:twitch",
    url: "https://www.twitch.tv/jimrsng"
  },
  {
    id: "kick",
    title: "Kick",
    icon: "simple-icons:kick",
    url: "https://kick.com/jimrisingtv"
  },
  {
    id: "x",
    title: "X",
    icon: "simple-icons:x",
    url: "https://x.com/JimRisingSC"
  },
  {
    id: "instagram",
    title: "Instagram",
    icon: "simple-icons:instagram",
    url: "https://www.instagram.com/Jimrising12"
  },
  {
    id: "tiktok",
    title: "TikTok",
    icon: "simple-icons:tiktok",
    url: "https://www.tiktok.com/@jimrising"
  },
  {
    id: "facebook",
    title: "Facebook",
    icon: "simple-icons:facebook",
    url: "https://www.facebook.com/JimRisingSC2"
  },
  {
    id: "youtube",
    title: "YouTube",
    icon: "simple-icons:youtube",
    url: "https://www.youtube.com/channel/UCyLusY-ST8KxpXe1A67r37A"
  }
];

export const getChampionIcon = (championId: number) => {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`;
};
