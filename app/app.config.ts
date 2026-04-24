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
        content: "bg-neutral-950/95 py-2 px-3 max-w-[91dvw] sm:max-w-dvw"
      }
    }
  }
});
