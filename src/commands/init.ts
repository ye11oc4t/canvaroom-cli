import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { TYPES_TS, UTILS_TS, GLOBALS_CSS, LAYOUT_TSX, HOME_TSX, VIEW_LAYOUT_TSX } from '../templates/base.js';
import { ADMIN_TSX } from '../templates/admin.js';
import { VIEW_TSX } from '../templates/view.js';

export async function cmdInit(projectName?: string) {
  const name = projectName || 'canvaroom';
  const targetDir = path.resolve(process.cwd(), name);

  console.log();
  console.log(chalk.bold(`  Canva${chalk.blue('Room')} — 발표 허브 스캐폴딩`));
  console.log(chalk.gray(`  프로젝트: ${name}\n`));

  if (fs.existsSync(targetDir)) {
    console.log(chalk.red(`  ✕ 이미 존재하는 디렉토리: ${name}`));
    process.exit(1);
  }

  const s1 = ora('Next.js 프로젝트 생성 중...').start();
  try {
    execSync(
      `npx create-next-app@latest ${name} --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes`,
      { stdio: 'pipe' }
    );
    s1.succeed('Next.js 프로젝트 생성');
  } catch {
    s1.fail('프로젝트 생성 실패');
    process.exit(1);
  }

  const s2 = ora('CanvaRoom 소스 파일 작성 중...').start();
  const appDir = path.join(targetDir, 'app');
  const libDir = path.join(targetDir, 'lib');
  fs.ensureDirSync(libDir);
  fs.ensureDirSync(path.join(appDir, 'admin'));
  fs.ensureDirSync(path.join(appDir, 'view'));

  fs.writeFileSync(path.join(libDir, 'types.ts'), TYPES_TS);
  fs.writeFileSync(path.join(libDir, 'utils.ts'), UTILS_TS);
  fs.writeFileSync(path.join(appDir, 'globals.css'), GLOBALS_CSS);
  fs.writeFileSync(path.join(appDir, 'layout.tsx'), LAYOUT_TSX);
  fs.writeFileSync(path.join(appDir, 'page.tsx'), HOME_TSX);
  fs.writeFileSync(path.join(appDir, 'admin', 'page.tsx'), ADMIN_TSX);
  fs.writeFileSync(path.join(appDir, 'view', 'page.tsx'), VIEW_TSX);
  fs.writeFileSync(path.join(appDir, 'view', 'layout.tsx'), VIEW_LAYOUT_TSX);
  s2.succeed('소스 파일 작성 완료');

  const s3 = ora('빌드 확인 중...').start();
  try {
    execSync('npm run build', { cwd: targetDir, stdio: 'pipe' });
    s3.succeed('빌드 성공');
  } catch {
    s3.warn('빌드 확인 실패 — npm run build로 직접 확인해보세요');
  }

  console.log();
  console.log(chalk.green('  ✓ CanvaRoom 프로젝트 생성 완료!'));
  console.log();
  console.log('  로컬 실행:');
  console.log(chalk.cyan(`    cd ${name} && npm run dev`));
  console.log();
  console.log('  Vercel 배포:');
  console.log(chalk.cyan(`    cd ${name} && npx canvaroom deploy`));
  console.log();
}
