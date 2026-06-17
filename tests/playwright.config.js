const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: ".",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5500",
    headless: true,
  },
  webServer: {
    command: "npx serve .. --listen 5500 --no-clipboard",
    url: "http://localhost:5500",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
