# lane4-lbs-web

Lane4 위치정보(LBS) 실태점검 관리시스템 프론트엔드.

- **스택**: Next.js 15.5 (Pages Router, `*.page.tsx`) · React 19 · TypeScript · antd 5 · Tailwind 3 · @tanstack/react-query 5 · react-hook-form · zod · NextAuth 4(Credentials) · axios · dayjs · jwt-decode
- **패키지 매니저**: yarn (`.nvmrc` = node 22)
- **백엔드**: admin-api `lbs/v2/*` (모든 응답 `{ result, code, data }` 래핑, 목록은 `data.list` + `data.meta`)

## 시작하기

```bash
nvm use
yarn install
cp .env.example .env.development.local   # 값 채우기
yarn dev                                  # http://localhost:3200
```

## 주요 기능

| 경로 | 화면 | 권한 |
|------|------|------|
| `/login` | ID/PW → SMS 2차인증(5분 카운트다운) | 공개 |
| `/password-change` | 비밀번호 변경(정책 검증) | 로그인 |
| `/provision` | 위치정보 제공기록(수집 원장 / 백업 이력 탭) + 엑셀 | 전체 |
| `/access` | 시스템 접근기록 | MANAGER+ |
| `/account` | 계정 관리 | OFFICER |
| `/permission` | 권한 마스터 + 권한 변경 이력 | 전체 / 이력 MANAGER+ |
| `/ip` | IP 화이트/블랙리스트 | OFFICER |
| `/destruction` | 휴폐업 일괄 파기 | OFFICER |

## 보안/실태점검 특성

- 로그인 SMS 2차인증(알리고), 세션 쿠키 `lbs.next-auth.session-token`
- 10분 무활동 자동 로그아웃(60초 전 경고 모달, 멀티탭 동기화) — `contexts/IdleContext.tsx`
- 헤더에 접속시간 / 자동 로그아웃 남은시간 / 현재시각(실시간) 표시
- 권한 3단계: OFFICER(위치정보관리책임자) / MANAGER(위치정보관리자) / HANDLER(위치정보취급자)

## 디렉터리 구조

```
apis/{domain}/          # 서비스 클래스 + 타입 (백엔드 계약)
entities/{domain}/      # react-query queryOptions / mutations
components/layout/       # Layout · Header · Sidebar
components/common/       # 공통 UI (PageHeader, DataTable 등)
contexts/                # IdleContext
pages/                   # *.page.tsx 라우트
utils/                   # UserService(axios) · AxiosV2 · 포맷터 · 비밀번호 검증
constants/               # 권한/메뉴 상수
types/                   # next-auth 타입 확장
```
