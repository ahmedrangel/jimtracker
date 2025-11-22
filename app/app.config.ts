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
            content: "w-[calc(100vw-1rem)] max-w-lg rounded-lg shadow-lg"
          }
        }
      }
    }
  }
});
