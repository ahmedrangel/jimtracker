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
    },
    popover: {
      slots: {
        arrow: "fill-current",
        content: "py-2 px-3"
      }
    }
  }
});
