import chalk from 'chalk';
import ora from 'ora';
import { execSync, spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { createInterface } from 'readline';

const TEMPLATE_REPO = 'ye11oc4t/canvaroom';

// -----------------------------
// Utils
// -----------------------------

function run(cmd: string, cwd?: string) {
  execSync(cmd, { stdio: 'inherit', cwd });
}

function silent(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

function ensureGHCli() {
  if (silent('gh --version')) return;

  console.log(chalk.yellow('  gh CLI가 없습니다. 설치 중...'));

  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  try {
    if (isWindows) {
      run('winget install --id GitHub.cli -e --silent');
    } else if (isMac) {
      run('brew install gh');
    } else {
      run('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg');
      run('echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null');
      run('sudo apt update && sudo apt install gh -y');
    }
    console.log(chalk.green('  ✓ gh CLI 설치 완료'));
    console.log(chalk.yellow('  ⚠ 터미널을 재시작한 후 다시 실행해주세요'));
    process.exit(0);
  } catch {
    console.log(chalk.red('  ✕ gh CLI 자동 설치 실패'));
    console.log(chalk.gray('  수동 설치: https://cli.github.com'));
    process.exit(1);
  }
}

function ensureVercelCli() {
  if (silent('vercel --version')) return;

  const s = ora('Vercel CLI 설치 중...').start();
  try {
    execSync('npm install -g vercel', { stdio: 'pipe' });
    s.succeed('Vercel CLI 설치 완료');
  } catch {
    s.fail('Vercel CLI 설치 실패');
    console.log(chalk.gray('  수동 설치: npm i -g vercel'));
    process.exit(1);
  }
}

function ensureGitHubAuth() {
  if (silent('gh auth status')) return;

  console.log(chalk.yellow('\n  GitHub 로그인이 필요합니다.'));
  console.log(chalk.gray('  브라우저에서 로그인 진행합니다...\n'));

  try {
    spawnSync('gh', ['auth', 'login', '--web', '--hostname', 'github.com'], {
      stdio: 'inherit',
    });
  } catch {
    console.log(chalk.red('  ✕ GitHub 로그인 실패'));
    process.exit(1);
  }

  if (!silent('gh auth status')) {
    console.log(chalk.red('  ✕ GitHub 로그인이 확인되지 않습니다'));
    process.exit(1);
  }

  console.log(chalk.green('  ✓ GitHub 로그인 완료'));
}

function getGitHubUsername(): string {
  try {
    return execSync('gh api user --jq .login', { stdio: 'pipe' }).toString().trim();
  } catch {
    console.log(chalk.red('  ✕ GitHub 유저명을 가져올 수 없습니다'));
    process.exit(1);
  }
}

function forkAndClone(slug: string, username: string): string {
  const cloneDir = path.resolve(process.cwd(), slug);

  // fork 시도
  const s1 = ora(`${TEMPLATE_REPO} fork 중...`).start();
  let forked = false;
  try {
    execSync(
      `gh repo fork ${TEMPLATE_REPO} --clone=false --fork-name ${slug}`,
      { stdio: 'pipe' }
    );
    s1.succeed(`fork 완료 → ${username}/${slug}`);
    forked = true;
  } catch {
    s1.warn('fork 실패 (본인 repo이거나 이미 존재) → template 방식으로 전환');
  }

  // fork 실패시 template으로 fallback
  if (!forked) {
    const s2 = ora('template 기반으로 repo 생성 중...').start();
    try {
      execSync(
        `gh repo create ${username}/${slug} --template ${TEMPLATE_REPO} --public`,
        { stdio: 'pipe' }
      );
      s2.succeed(`repo 생성 완료 → ${username}/${slug}`);
    } catch {
      s2.fail('repo 생성 실패');
      process.exit(1);
    }
  }

  // clone
  if (fs.existsSync(cloneDir)) {
    console.log(chalk.gray(`  기존 디렉토리 재사용: ${slug}`));
  } else {
    const s3 = ora('로컬에 clone 중...').start();
    try {
      execSync(`gh repo clone ${username}/${slug} ${slug}`, { stdio: 'pipe' });
      s3.succeed('clone 완료');
    } catch {
      s3.fail('clone 실패');
      process.exit(1);
    }
  }

  return cloneDir;
}

function injectMeta(cloneDir: string, encoded: string, slug: string, platform: 'vercel' | 'github') {
  const meta = {
    encoded,
    slug,
    platform,
    viewPath: `/view?d=${encoded}`,
  };
  fs.writeJSONSync(path.join(cloneDir, 'canvaroom-meta.json'), meta, { spaces: 2 });
}

function commitAndPush(cloneDir: string, title: string) {
  const s = ora('commit & push 중...').start();
  try {
    // template 커밋 먼저 pull
    try {
      execSync('git pull origin main --rebase', { cwd: cloneDir, stdio: 'pipe' });
    } catch {
      // 실패해도 계속
    }

    run('git add .', cloneDir);
    try {
      execSync('git diff --cached --quiet', { cwd: cloneDir, stdio: 'pipe' });
      s.succeed('변경사항 없음, push 스킵');
      return;
    } catch {
      // 변경사항 있음 → 정상
    }
    run(`git commit -m "feat: ${title}"`, cloneDir);
    run('git push origin main', cloneDir);  // force 제거
    s.succeed('push 완료');
  } catch {
    s.fail('push 실패');
    process.exit(1);
  }
}

function deployVercel(cloneDir: string, slug: string, username: string, prod: boolean): string {
  ensureVercelCli();

  // 1. 로그인 확인
  if (!silent('npx vercel whoami')) {
    console.log(chalk.yellow('\n  Vercel 로그인이 필요합니다.'));
    spawnSync('npx', ['vercel', 'login'], { stdio: 'inherit', shell: true});
  }

  // 2. vercel.json 생성
  fs.writeJSONSync(
    path.join(cloneDir, 'vercel.json'),
    { framework: 'nextjs', buildCommand: 'npm run build', installCommand: 'npm install' },
    { spaces: 2 }
  );

  // 3. GitHub repo 연결
  const repoUrl = `https://github.com/${username}/${slug}`;
  console.log(chalk.gray(`\n  GitHub repo 연결 중... ${repoUrl}\n`));
  const connectResult = spawnSync('npx', ['vercel', 'git', 'connect', repoUrl, '--yes'], { stdio: 'pipe', cwd: cloneDir, shell: true });
  if (connectResult.stdout) process.stdout.write(connectResult.stdout);
  if (connectResult.stderr) process.stderr.write(connectResult.stderr);
  console.log(chalk.gray(`  연결 종료 코드: ${connectResult.status}, 시그널: ${connectResult.signal}`));

  // 4. 배포
  const args = ['vercel', '--yes'];
  if (prod) args.push('--prod');
  console.log(chalk.gray('\n  Vercel 배포 시작...\n'));
  const result = spawnSync('npx', args, { stdio: 'pipe', cwd: cloneDir, shell: true });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  console.log(chalk.gray(`  배포 종료 코드: ${result.status}, 시그널: ${result.signal}`));
  
  if (result.status !== 0) {
  console.log(chalk.red('  Vercel 배포 실패'));
  process.exit(1);
  }
  return `https://${slug}.vercel.app`;
}

function deployGH(cloneDir: string, username: string, slug: string): string {
  const s = ora('GitHub Pages 배포 중...').start();
  try {
    fs.writeFileSync(
      path.join(cloneDir, 'next.config.ts'),
      `import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/${slug}',
};
export default nextConfig;
`
    );

    run('npm install', cloneDir);
    run('npm run build', cloneDir);
    run('npm install gh-pages --save-dev', cloneDir);
    run('npx gh-pages -d out', cloneDir);

    try {
      execSync(
        `gh api repos/${username}/${slug}/pages --method POST -f source[branch]=gh-pages -f source[path]=/`,
        { stdio: 'pipe' }
      );
    } catch {
      // 이미 활성화된 경우 무시
    }

    s.succeed('GitHub Pages 배포 완료');
  } catch {
    s.fail('GitHub Pages 배포 실패');
    process.exit(1);
  }

  return `https://${username}.github.io/${slug}`;
}

// -----------------------------
// MAIN
// -----------------------------

export async function cmdDeploy(options: {
  vercel?: boolean;
  github?: boolean;
  prod?: boolean;
}) {
  console.log();
  console.log(chalk.bold(`  Canva${chalk.blue('Room')} — Deploy`));
  console.log();

  // 0. 필수 도구 확인
  ensureGHCli();
  ensureGitHubAuth();
  if (options.vercel) ensureVercelCli();

  // 1. canvaroom.json 확인
  const dataPath = path.resolve(process.cwd(), 'canvaroom.json');
  if (!fs.existsSync(dataPath)) {
    console.log(chalk.red('  ✕ canvaroom.json 없음'));
    console.log(chalk.gray('    canvaroom pitch 를 먼저 실행하세요'));
    process.exit(1);
  }
  const { data, encoded } = fs.readJSONSync(dataPath);

  // 2. slug 입력
  const defaultSlug = data.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'my-presentation';
  const slugInput = await ask(
    chalk.white(`  배포 이름 입력 (엔터시 "${defaultSlug}"): `)
  );
  const slug = slugInput || defaultSlug;

  // 3. GitHub 유저명
  const username = getGitHubUsername();

  // 4. fork + clone
  const cloneDir = forkAndClone(slug, username);

  // 5. npm install
  const s = ora('의존성 설치 중...').start();
  try {
    execSync('npm install', { cwd: cloneDir, stdio: 'pipe' });
    s.succeed('의존성 설치 완료');
  } catch {
    s.fail('npm install 실패');
    process.exit(1);
  }

  // 6. meta 주입 + push
  injectMeta(cloneDir, encoded, slug, options.vercel ? 'vercel' : 'github');
  commitAndPush(cloneDir, data.title ?? 'update');

  console.log();

  // 7. 배포
  let baseUrl = '';

  if (options.vercel) {
    baseUrl = deployVercel(cloneDir, slug, username, !!options.prod);
  } else if (options.github) {
    baseUrl = deployGH(cloneDir, username, slug);
  } else {
    console.log(chalk.yellow('  ⚠ 배포 옵션 없음'));
    console.log(chalk.gray('    --vercel 또는 --github 추가하세요'));
    console.log(chalk.gray('    예: canvaroom deploy --vercel'));
    return;
  }

  // 8. 최종 URL 출력
  const viewUrl = `${baseUrl}/view?d=${encoded}`;

  console.log();
  console.log(chalk.green('  ✓ 배포 완료!\n'));
  console.log(chalk.bold('  청취자 링크:'));
  console.log(chalk.cyan(`    ${viewUrl}`));
  console.log();
  console.log(chalk.gray(`  GitHub: https://github.com/${username}/${slug}`));
  console.log(chalk.gray(`  (forked from ${TEMPLATE_REPO})`));
  console.log();
}