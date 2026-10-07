# SQL 콘텐츠 출처

B01~B03의 문제 ID·제목·요구 결과·기본 및 원본 추가 데이터는 사용자가 제공한 v3를 유지했다. source SHA-256: aeab26bee08dd3bc9097376157e83c960738bb05d7d8b742c63c2dd76b89197c. B01/B02 문제 앞 이론은 이번 구현의 보완 설명이다. B03 이론과 시각 별칭·추가 합성 데이터는 지정된 개선 교안과 fixtures pack에 따른 제안이다. 다른 9차시를 통합했다고 주장하지 않는다.

SQL.js JS 및 WASM은 같은 제공 원본에 내장된 것을 분리했다. API·CDN 호출 없이 사이트의 자체 정적 파일에서 로드한다. sql.js는 MIT 라이선스, SQLite는 public domain이다.

검토 콘텐츠 ZIP의 source_sha256는 HTML SHA와 다르다. 그대로 적용했다고 표시하지 않고 ID별 내용을 검토했다. 패치의 source-table-snapshots와 원본 3차시 테이블·데이터가 전부 같고 29개 ID·유형이 일치함을 이 Mac에서 검사한 뒤 명시된 콘텐츠 키만 병합했다. SQL.js 공식 LICENSE는 public/sql/SQL-JS-LICENSE.txt에 보존했다. SQLite 버전은 실제 실행으로 확인하며 sql.js 패키지 버전은 미식별이다.

원본 SQL.js 로더의 암묵적 module 전역 대입을 함수 안 var 선언으로 바꿔 ESM Worker의 엄격 모드에서 실행되도록 했다. 엄격 모드 Worker 테스트와 실제 브라우저 실행에서 확인했다. WASM 바이트는 원본 그대로다.

최종 검토 패키지 SHA-256: 57c17f856188e19af44c0454f6bb0e2909044b9aae348c4d39992cd4f39e1ac6. tests/sql/review-vectors.json은 그 패키지의 B01~B03 동치 26개·오답 32개·동결 기대값 99개·독립 기대값 25개만 발췌했다. 동결값은 기준 SQL에서 파생한 값이며 독립 기대값과 구분한다.
