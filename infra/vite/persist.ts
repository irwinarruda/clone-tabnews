import { cpSync, existsSync, readdirSync } from "fs";
import path from "path";

export type PersistAsset = {
  src: string;
  dest: string;
};

export function copyPersistAssets(assets: PersistAsset[]) {
  const serverDirs: string[] = [];
  const nodeServerDir = path.resolve(".output", "server");
  if (existsSync(nodeServerDir)) {
    serverDirs.push(nodeServerDir);
  }
  const vercelFunctionsDir = path.resolve(".vercel", "output", "functions");
  if (existsSync(vercelFunctionsDir)) {
    for (const entry of readdirSync(vercelFunctionsDir)) {
      if (entry.endsWith(".func")) {
        serverDirs.push(path.join(vercelFunctionsDir, entry));
      }
    }
  }
  for (const serverDir of serverDirs) {
    for (const asset of assets) {
      const srcPath = path.resolve(asset.src);
      if (!existsSync(srcPath)) continue;

      const destPath = path.join(serverDir, asset.dest);
      cpSync(srcPath, destPath, { recursive: true });
      console.log(`[persist] Copied ${asset.dest} to ${destPath}`);
    }
  }
}
