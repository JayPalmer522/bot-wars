import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import net from "net";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Dev-only plugin: receives army data from the browser and writes it to
// scripts/army-data.json, then immediately runs initiate-armies.js.
function armyDataPlugin(): Plugin {
  return {
    name: "army-data-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/save-army-data", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", () => {
          try {
            const data = JSON.parse(body);
            const dataPath = path.join(process.cwd(), "scripts", "army-data.json");
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
            execSync("node scripts/initiate-armies.js", { stdio: "inherit" });
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: String(e) }));
          }
        });
      });
    },
  };
}

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
    plugins: [react(), armyDataPlugin()],
    server: {
      port,
      strictPort: true,
    },
  };
});
