import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from 'node:process';

const DIST = "dist";
const SERVER = "dev@39.97.240.219:/home/dev/blog"; // 修改为你的服务器路径

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function copyFile(src: string, dest: string) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dest, path.basename(src)));
  }
}

async function main() {
  console.log("开始构建...");

  // 1 构建
  run("pnpm build");

  /*
  // 2 发布到云服务器
  console.log("上传到云服务器...");
  run(`rsync -avz ${DIST}/ ${SERVER}`);
*/
  // 3 复制 .git 和 .nojekyll
  
  console.log("复制 GitHub Pages 文件...");
  copyFile("dist-backup/.nojekyll", DIST);

  if (fs.existsSync(".git")) {
    run(`cp -r dist-backup/.git ${DIST}/`);
  }

  
  // 4 发布到 GitHub Pages
  console.log("发布到 GitHub Pages...");
  process.chdir(DIST); // 切换

  run("git add .");
  run('git commit -m "deploy" || true');

  run("git push origin master:main --force");

  console.log("\n部署完成");
}

main();