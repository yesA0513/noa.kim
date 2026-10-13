### https://noa.kim

`python3 -m http.server 8000`으로 로컬에서 실행할 수 있습니다.

`Overview`·`Projects`·`Photography` 메뉴는 순서에 따라 화면을 좌우로 슬라이드하며 전환합니다. URL 해시로 바로 접근하거나 브라우저의 뒤로·앞으로 버튼을 사용할 수 있습니다. 움직임 줄이기 설정에서는 즉시 전환합니다. 본문만 스크롤되고 음악·앰비언트 바는 하단 레이아웃에 포함되어 콘텐츠를 가리지 않습니다. 테마와 조명 설정은 별도로 저장됩니다.

상단 상태줄에는 이름·서울 시각·소셜 링크를, 하단에는 음악·아이콘 메뉴·앰비언트 설정을 배치합니다. 사진 화면은 로컬 사진을 별도 패널에 표시하여 모든 메뉴에서 선택한 앰비언트 배경이 이어집니다. `Ambient Styles`에서는 가로 미리보기 카드로 분위기를 고르고 테마·색상·밝기를 조절합니다.

앰비언트 팔레트는 배경·패널·버튼·아이콘·시계·진행 막대와 설정 화면의 강조색에 함께 적용됩니다. `Multicolor`는 여러 색을, `Monocolor`는 한 색을 사용하며, 밝기를 낮추거나 끄면 중립색으로 줄어듭니다. 라이트·다크 테마에 따라 강조색의 대비를 보정하고 움직임 줄이기 설정에서는 색상을 즉시 전환합니다.

`Moonlit Voyage`, `Cosmic Drift`, `Afterglow`, `Desert Dusk`, `Aurora`, `Forest Whisper`, `Deep Current`, `Midnight Drive`는 각각 다른 로컬 SVG 풍경과 팔레트를 사용합니다. 미리보기와 배경은 같은 그림을 사용하며 장면 전환은 부드럽게 겹쳐집니다. 선택한 장면은 색상과 함께 저장되고 기존 색상 설정에서도 해당 장면을 복원합니다. `Custom`으로 색상을 바꿔도 선택한 풍경은 유지합니다.

소개 화면의 정보 영역에는 육군 복무 카드가 있습니다. 입대일(2026-03-09)과 전역일(2027-09-08)을 기준으로 남은 날짜와 복무 진행률을 계산하며, 서울 기준 자정과 탭 복귀 시 갱신합니다. 날짜를 변경하려면 `index.html`의 `data-enlistment-date`, `data-discharge-date`와 표시되는 입대일의 `<time>`도 수정하세요. `node scripts/test_service.cjs`로 날짜 계산과 갱신 동작을 검증할 수 있습니다.

사진·기술 아이콘·폰트는 로컬 파일로 제공합니다. Pretendard v1.3.9와 Inter v4.1은 SIL Open Font License로 배포되며, 라이선스는 `img/fonts/Pretendard-LICENSE.txt`와 `img/fonts/LICENSE.txt`에 있습니다. 음악과 날씨는 기존 API를 사용하며, 로딩과 오류 상태도 한국어로 표시합니다.

CSS나 JavaScript를 수정한 후 다음 명령으로 자산 버전을 갱신하세요.

```sh
python3 scripts/update_asset_versions.py
```

갱신된 `index.html`을 변경한 자산과 함께 커밋하세요. CSS·JS URL의 콘텐츠 해시로 배포 후 맞는 파일을 불러옵니다. `python3 scripts/update_asset_versions.py --check`로 버전이 최신인지 확인할 수 있습니다.
