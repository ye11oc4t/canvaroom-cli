# canvaroom CLI

발표 허브 CanvaRoom의 CLI 도구.

## 설치

```bash
npm install -g canvaroom
# 또는 npx로 바로 사용
npx canvaroom <command>
```

## 명령어

### `canvaroom init [name]`
CanvaRoom Next.js 프로젝트를 스캐폴딩합니다.

```bash
npx canvaroom init my-presentation
cd my-presentation
npm run dev
```

### `canvaroom pitch`
대화형 CLI로 발표 정보를 입력하고 청취자 링크를 생성합니다.

```
캔바 링크를 입력하세요: https://www.canva.com/design/...
sli.do 링크를 입력하세요: https://app.sli.do/event/...
발표자 정보를 입력하시겠습니까? (y/n): y
발표자 LinkedIn 링크: https://linkedin.com/in/...
발표자 GitHub 링크: https://github.com/...
발표자 SNS (X/Twitter) 링크:
발표자 웹사이트:
```

### `canvaroom deploy [--prod]`
현재 디렉토리의 CanvaRoom 프로젝트를 Vercel에 배포합니다.

```bash
npx canvaroom deploy        # 프리뷰 배포
npx canvaroom deploy --prod # 프로덕션 배포
```

### `canvaroom encode <json>`
PresentationData JSON을 URL-safe 문자열로 인코딩합니다.

### `canvaroom decode <encoded>`
인코딩된 문자열을 PresentationData JSON으로 디코딩합니다.

## 전체 플로우

```bash
# 1. 프로젝트 생성
npx canvaroom init

# 2. Vercel 배포 (한 번만)
cd canvaroom
npx canvaroom deploy --prod

# 3. 발표마다 pitch로 청취자 링크 생성
npx canvaroom pitch
```

## Roadmap
- v2: Google Slides 지원
- v2: QR코드 자동 생성
- v2: 발표 타이머
