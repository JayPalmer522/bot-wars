import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import net from "net";

function findAvailablePort(start: number): Promise<{ port: number; wasInUse: boolean }> {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => {
      findAvailablePort(start + 1).then((r) =>
        resolve({ port: r.port, wasInUse: true })
      );
    });
    probe.once("listening", () => {
      probe.close(() => resolve({ port: start, wasInUse: false }));
    });
    probe.listen(start, "127.0.0.1");
  });
}

export default defineConfig(async () => {
  const { port, wasInUse } = await findAvailablePort(5173);
  if (wasInUse) {
    console.log(`\n  Port 5173 in use, using ${port}\n`);
  }
  return {
    base: "/botwars/",
    plugins: [react()],
    server: {
      port,
      strictPort: true,
    },
  };
});
