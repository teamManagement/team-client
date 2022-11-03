// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ["@electron-toolkit/utils"]
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          inside: resolve("/home/slx/works/06-teamManagement/team-client", "src/preload/inside/index.ts"),
          newWindowOpen: resolve("/home/slx/works/06-teamManagement/team-client", "src/preload/newWindowOpen/index.ts"),
          notification: resolve("/home/slx/works/06-teamManagement/team-client", "src/preload/notification/index.ts"),
          applicationSdk: resolve("/home/slx/works/06-teamManagement/team-client", "src/preload/applicationSdkPreload/index.ts")
        },
        external: ["@electron-toolkit/preload"]
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
