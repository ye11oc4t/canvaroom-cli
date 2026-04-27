#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { cmdInit } from './commands/init.js';
import { cmdPitch } from './commands/pitch.js';
import { cmdDeploy } from './commands/deploy.js';
import { encode, decode } from './utils.js';

const program = new Command();

program
  .name('canvaroom')
  .description('발표 허브 — Canva + 목차 + 링크 + Slido')
  .version('0.1.0');

program
  .command('init [name]')
  .description('CanvaRoom Next.js 프로젝트 스캐폴딩')
  .action(async (name?: string) => {
    await cmdInit(name);
  });

program
  .command('pitch')
  .description('대화형 CLI로 발표 설정 및 청취자 링크 생성')
  .action(async () => {
    await cmdPitch();
  });
program
  .command('deploy')
  .description('GitHub fork + 배포')
  .option('--vercel', 'Vercel에 배포')
  .option('--github', 'GitHub Pages에 배포')
  .option('--prod', '프로덕션 배포')
  .action(async (opts) => {
    await cmdDeploy(opts);
  });

program
  .command('encode <json>')
  .description('PresentationData JSON을 URL-safe 문자열로 인코딩')
  .action((json: string) => {
    try {
      const data = JSON.parse(json);
      console.log(encode(data));
    } catch {
      console.error(chalk.red('유효한 JSON을 입력하세요.'));
      process.exit(1);
    }
  });

program
  .command('decode <encoded>')
  .description('인코딩된 문자열을 PresentationData JSON으로 디코딩')
  .action((encoded: string) => {
    const data = decode(encoded);
    if (!data) {
      console.error(chalk.red('디코딩 실패: 유효하지 않은 문자열입니다.'));
      process.exit(1);
    }
    console.log(JSON.stringify(data, null, 2));
  });

program.parse();
