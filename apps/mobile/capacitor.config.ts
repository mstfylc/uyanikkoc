import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.uyanikkoc.app",
  appName: "Uyanık Koç",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
