export default defineAppConfig({
  ui: {
    colors: {
      neutral: "neutral",
      primary: "green"
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "w-[fit-content] max-w-[100vw] ring-0"
          }
        }
      }
    }
  }
});
