# 웹응용기술 과제: Node.js Profiler 개발

- **학번:** 20210843
- **이름:** 박효준
- **수강반:** 웹응용기술[001]

---

## 1. 기존 코드 분석 및 개발 동기

기존에 제공된 Java/JSP 기반 프로파일러는 DB 연동이 없고 매번 파일을 읽어 처리하므로, 데이터 규모가 커질 경우 성능 저하가 우려되고 통계 분석 기능이 제한적이었습니다.

이를 개선하고자, 비동기 I/O에 강점이 있는 **Node.js**와 클라우드 기반 **MongoDB Atlas**를 활용하여 **확장성과 효율성을 높인 새로운 웹 프로파일러**를 개발하였습니다.

## 2. 신규 프로그램 개요 및 기술 스택

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Data Handling:** Multer (파일 업로드), Custom Parser (데이터 파싱)
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
- **Visualization:** Chart.js

## 3. 프로그램 수행 절차

1.  프로젝트 폴더 터미널에서 `npm install`을 실행하여 의존성을 설치합니다.
2.  `server.js` 파일 내 `mongoose.connect()`의 연결 문자열이 올바른지 확인합니다.
3.  `node server.js` 명령어로 웹 서버를 실행합니다.
4.  웹 브라우저에서 `http://localhost:3000` 주소로 접속합니다.
5.  `inputFile.txt`를 업로드하면 자동으로 데이터가 분석되어 DB에 저장됩니다.
6.  'Task별 분석' 또는 'Core별 분석' 버튼을 클릭하여 시각화된 통계 결과를 확인합니다.

## 4. 핵심 소스 코드 설명

- **`server.js`**: Express 서버를 초기화하고 MongoDB Atlas 연결 및 API 라우터를 설정하는 진입점입니다.
- **`routes/api.js`**: 과제의 핵심 로직이 담긴 파일입니다.
    - **파일 처리**: `multer`를 사용해 업로드된 파일을 메모리에서 직접 처리하여 I/O 부하를 줄였습니다.
    - **통계 분석 API**: MongoDB의 **Aggregation Pipeline**(`$group`, `$avg`, `$stdDevPop` 등)을 활용하여 DB 단에서 효율적으로 MIN, MAX, AVG, 표준편차를 계산하고, 그 결과를 JSON 형태로 클라이언트에 제공합니다.
- **`public/main.js`**: 프론트엔드 로직을 담당합니다. `fetch` API를 사용해 비동기적으로 파일을 업로드하고, 서버로부터 받은 통계 데이터를 `Chart.js` 라이브러리를 통해 동적인 막대 그래프로 시각화합니다.