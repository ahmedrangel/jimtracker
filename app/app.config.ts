export default defineAppConfig({
  ui: {
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: "w-fit max-w-screen ring-0"
          }
        }
      }
    },
    popover: {
      slots: {
        arrow: "fill-current",
        content: "py-2 px-3 max-w-[91dvw] sm:max-w-dvw"
      }
    }
  }
});
