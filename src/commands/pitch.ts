import chalk from 'chalk';
import { createInterface } from 'readline';
import fs from 'fs-extra';
import { PresentationData, Chapter } from '../types.js';
import { encode, toCanvaEmbed, uid } from '../utils.js';

function ask(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, ans => resolve(ans.trim())));
}

function askOptional(rl: ReturnType<typeof createInterface>, label: string): Promise<string> {
  return ask(rl, chalk.gray(`  ${label} ${chalk.dim('(엔터시 스킵)')}: `));
}

export async function cmdPitch() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log();
  console.log(chalk.bold(`  Canva${chalk.blue('Room')} — 발표 설정`));
  console.log(chalk.gray('  정보를 입력하면 청취자 링크가 생성됩니다.\n'));

  const data: PresentationData = {
    title: '',
    canvaUrl: '',
    slidoUrl: '',
    presenter: { name: '', title: '', bio: '', linkedin: '', github: '', twitter: '', website: '', avatarInitials: '' },
    chapters: [],
    links: [],
  };

  // 기본 정보
  data.title = await ask(rl, chalk.white('  발표 제목: '));

  const rawCanva = await ask(rl, chalk.white('  Canva 링크를 입력하세요: '));
  data.canvaUrl = toCanvaEmbed(rawCanva);
  if (data.canvaUrl !== rawCanva) {
    console.log(chalk.gray(`    → ?embed 자동 변환: ${data.canvaUrl}`));
  }

  data.slidoUrl = await askOptional(rl, 'sli.do 링크를 입력하세요');

  // 목차
  console.log();
  const chapterCount = await ask(rl, chalk.white('  슬라이드 수 (목차 자동생성, 엔터시 스킵): '));
  const n = parseInt(chapterCount);
  if (n > 0 && n <= 100) {
    data.chapters = Array.from({ length: n }, (_, i): Chapter => ({
      id: uid(),
      title: `슬라이드 ${i + 1}`,
      subtitle: '',
    }));
    console.log(chalk.gray(`    → 목차 ${n}개 자동생성 (Admin 화면에서 제목 수정 가능)`));
  }

  // 발표자 정보
  console.log();
  const wantPresenter = await ask(rl, chalk.white('  발표자 정보를 입력하시겠습니까? (y/n): '));
  if (wantPresenter.toLowerCase() === 'y') {
    data.presenter.name = await askOptional(rl, '발표자 이름');
    data.presenter.title = await askOptional(rl, '발표자 직함/소속');
    data.presenter.bio = await askOptional(rl, '발표자 소개');
    data.presenter.linkedin = await askOptional(rl, '발표자 LinkedIn 링크');
    data.presenter.github = await askOptional(rl, '발표자 GitHub 링크');
    data.presenter.twitter = await askOptional(rl, '발표자 SNS (X/Twitter) 링크');
    data.presenter.website = await askOptional(rl, '발표자 웹사이트');
    if (data.presenter.name) {
      data.presenter.avatarInitials = data.presenter.name.slice(0, 2);
    }
  }

  // 관련 링크
  console.log();
  const wantLinks = await ask(rl, chalk.white('  관련 링크를 추가하시겠습니까? (y/n): '));
  if (wantLinks.toLowerCase() === 'y') {
    let addMore = true;
    while (addMore) {
      const label = await askOptional(rl, '링크 이름');
      const url = await askOptional(rl, '링크 URL');
      if (url) {
        data.links.push({ id: uid(), label: label || url, url });
      }
      const cont = await ask(rl, chalk.gray('  더 추가하시겠습니까? (y/n): '));
      addMore = cont.toLowerCase() === 'y';
    }
  }

  rl.close();

  // 인코딩 + 저장
  const encoded = encode(data);

  await fs.writeJSON('./canvaroom.json', { data, encoded }, { spaces: 2 });

  console.log(chalk.green('\n  ✓ 발표 설정 완료!\n'));
  console.log(chalk.gray('  청취자 링크는 배포 후 생성됩니다.'));
  console.log(chalk.gray('  배포하려면:'));
  console.log(chalk.cyan('    canvaroom deploy --vercel'));
  console.log(chalk.cyan('    canvaroom deploy --github'));
  console.log();
}