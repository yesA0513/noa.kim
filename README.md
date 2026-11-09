### https://noa.kim

About Page

두 가지 디자인을 같은 콘텐츠와 기능으로 제공합니다.

- **Studio**: 큰 타이포와 여백 중심의 미니멀 포트폴리오. 첫 방문의 기본 디자인입니다.
- **Classic**: 풍경 배경과 위젯으로 구성한 기존 디자인입니다.

상단 **Settings** 또는 하단 **Ambient**에서 디자인을 전환할 수 있습니다.
선택은 각 브라우저의 `localStorage`에 저장되며, 밝은·어두운 테마 설정과 별도로 유지됩니다.
전환해도 보고 있던 소개·프로젝트·사진 탭은 유지됩니다.
Studio는 차분한 단색 배경을 사용하며, 풍경과 조명 설정은 Classic에서 제공합니다.

특정 디자인으로 바로 여는 링크도 사용할 수 있습니다.

- `https://www.noa.kim/?design=studio`
- `https://www.noa.kim/?design=classic#photography`

주소의 `design` 값은 저장된 선택보다 우선합니다. 저장 공간을 사용할 수 없어도 현재 페이지에서는 전환이 동작합니다.
사이트의 첫 방문 기본값은 `app/api/design.js`의 `defaultDesign`에서 변경할 수 있습니다.

기존 디자인의 독립된 원본은 [`archive/classic-2026-11-09`](https://github.com/yesA0513/noa.kim/tree/archive/classic-2026-11-09) 브랜치에 보관했습니다.
Classic의 기본 스타일은 `style.css`·`responsive.css`, Studio의 스타일은 `app/ui/studio.css`에서 관리합니다.
콘텐츠를 수정하면 두 디자인에 함께 반영됩니다.

CSS 또는 JavaScript 변경 후 `python scripts/update_asset_versions.py`로 에셋 버전을 갱신합니다.
