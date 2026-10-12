### https://noa.kim

`python3 -m http.server 8000`으로 로컬에서 실행할 수 있습니다.

소개·프로젝트·사진 메뉴는 각 화면을 전환합니다. URL 해시로 바로 접근하거나 브라우저의 뒤로·앞으로 버튼을 사용할 수 있습니다. 본문만 스크롤되고 음악·앰비언트 바는 하단 레이아웃에 포함되어 콘텐츠를 가리지 않습니다. 테마와 조명 설정은 별도로 저장됩니다.

사진·기술 아이콘·폰트는 로컬 파일로 제공합니다. Pretendard v1.3.9와 Inter v4.1은 SIL Open Font License로 배포되며, 라이선스는 `img/fonts/Pretendard-LICENSE.txt`와 `img/fonts/LICENSE.txt`에 있습니다. 음악과 날씨는 기존 API를 사용하며, 로딩과 오류 상태도 한국어로 표시합니다.

CSS나 JavaScript를 수정한 후 다음 명령으로 자산 버전을 갱신하세요.

```sh
python3 scripts/update_asset_versions.py
```

갱신된 `index.html`을 변경한 자산과 함께 커밋하세요. CSS·JS URL의 콘텐츠 해시로 배포 후 맞는 파일을 불러옵니다. `python3 scripts/update_asset_versions.py --check`로 버전이 최신인지 확인할 수 있습니다.
