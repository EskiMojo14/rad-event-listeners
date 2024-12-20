import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./src/**/*.test.ts"],
    setupFiles: ["./test-setup.ts"],
    typecheck: {
      enabled: true,
      include: ["./src/**/*.test-d.ts"],
    },
  },
});
