# MoneyMove — 개인자산관리 웹앱

개인 자산을 관리하는 React 웹앱입니다. GitHub Pages에서 실행됩니다.

## 배포 URL

`https://{your-github-username}.github.io/moneymove/`

## 기능

- **대시보드**: 총자산 요약, 자산배분 도넛 차트, 자산증식 추이
- **직접 투자**: 해외주식 / 국내주식 / 대체자산 종목 관리
- **투자 종합**: 대분류별 목표 vs 실제 비중 비교
- **자산**: 현금, 보증금, 적금, 청약 등 비투자 자산 입력
- **배당**: 배당금 수령 기록 및 집계
- **자산증식**: 월별 자산 추이 자동 기록
- **데이터 관리**: CSV 내보내기/가져오기
- **설정**: 목표 비중, 목표 자산, 환율 설정

## 기술 스택

- React 19 + TypeScript
- Vite 8 + Tailwind CSS v4
- Recharts (차트)
- Zustand (상태 관리, localStorage 저장)
- PapaParse (CSV)
- Frankfurt API (USD/KRW 환율)

## GitHub Pages 배포 방법

### 1. 저장소 생성

GitHub에서 `moneymove` 이름으로 새 저장소 생성 (반드시 이 이름 사용).

### 2. 코드 푸시

```bash
cd moneymove/webapp
git init
git remote add origin https://github.com/{your-username}/moneymove.git
git add .
git commit -m "initial commit"
git push -u origin main
```

### 3. GitHub Pages 활성화

1. 저장소 → Settings → Pages
2. Source: **GitHub Actions** 선택
3. 저장

### 4. 배포 확인

`Actions` 탭에서 워크플로 실행 확인 후  
`https://{your-username}.github.io/moneymove/` 접속

## 로컬 개발

```bash
cd webapp
npm install
npm run dev
```

## 데이터 저장 방식

모든 데이터는 브라우저 localStorage에 저장됩니다 (`moneymove-store` 키).  
정기적으로 **데이터 관리 > CSV 내보내기**로 백업하세요.
