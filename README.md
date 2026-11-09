### https://noa.kim

About Page

서로 다른 두 디자인을 전환할 수 있습니다.

- **Studio**: 큰 이름, 작업 목록, 사진 지면과 소개로 이어지는 한 장의 포트폴리오. 첫 방문의 기본 디자인입니다.
- **Classic**: 은은한 추상 배경과 위젯으로 구성한 디자인입니다.

Studio 상단의 **Classic**으로 기존 디자인으로 돌아갑니다.
Classic에서는 **Ambient → 디자인 → Studio**로 새 디자인을 선택합니다.
선택은 각 브라우저의 `localStorage`에 저장되며, 밝은·어두운 테마 설정과 별도로 유지됩니다.
작업·사진 영역은 전환 후에도 대응하는 위치로 연결됩니다. Studio의 About은 Classic의 소개 화면으로 연결됩니다.
Studio에서는 상단 달 모양 버튼이나 하단 System·Light·Dark로 테마를 바꿉니다.
배경·조명 설정과 시계·날씨·복무 위젯은 Classic에서 제공합니다.

Classic의 **Ambient → 배경 모드 → Dynamic**을 선택하면 서울 시간을 따라 색상·배경·빛의 밝고 어두운 정도가 서서히 변합니다.
새벽부터 아침·낮·오후·노을·저녁·밤으로 이어지는 고정 시간대 구성이며, 실제 일출·일몰 예보를 사용하는 기능은 아닙니다.
배경 선택은 **기본 / Dynamic** 두 가지만 제공합니다. 기본에서는 **블루·세이지·샌드·로즈** 네 가지 포인트 색상 중 하나를 고르고, Dynamic에서 기본으로 돌아오면 저장된 색상을 복원합니다. 첫 방문은 기본 모드입니다.
이전 버전에서 저장한 사용자 색상은 새 프리셋을 선택하기 전까지 유지하며, 여러 수동 장면은 기본 배경 하나로 통일합니다. 일치하는 프리셋이 없으면 이전 색상 사용 중임을 표시합니다.
조명 전원·밝기·밝은/어두운 테마는 직접 선택한 값을 유지합니다.
백그라운드 탭과 Studio에서는 갱신을 쉬고, 돌아오면 현재 시간으로 바로 맞춥니다.

특정 디자인으로 바로 여는 링크도 사용할 수 있습니다.

- `https://www.noa.kim/?design=studio`
- `https://www.noa.kim/?design=studio#studio-work`
- `https://www.noa.kim/?design=classic#photography`

주소의 `design` 값은 저장된 선택보다 우선합니다. 저장 공간을 사용할 수 없어도 현재 페이지에서는 전환이 동작합니다.
사이트의 첫 방문 기본값은 `app/api/design.js`의 `defaultDesign`에서 변경할 수 있습니다.

기존 디자인의 독립된 원본은 [`archive/classic-2026-11-09`](https://github.com/yesA0513/noa.kim/tree/archive/classic-2026-11-09) 브랜치에 보관했습니다.
Classic의 기본 스타일은 `style.css`·`responsive.css`, Studio의 독립된 화면과 동작은 `app/ui/studio.css`·`app/api/studio.js`에서 관리합니다.
프로젝트·소개·관심사·기술·학력은 Classic의 콘텐츠를 읽어 Studio에도 반영하므로 두 번 입력할 필요가 없습니다.

CSS 또는 JavaScript 변경 후 `python scripts/update_asset_versions.py`로 에셋 버전을 갱신합니다.
시간대 계산 검증은 `node --test scripts/test_ambient_time.cjs`로 실행합니다.
