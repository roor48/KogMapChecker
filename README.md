# Kog맵 확인

## 설정

**먼저 `config.json` 파일을 수정하세요:**

```json
{
  "mapDirectory": "/home/user/ddnet/maps"
}
```

- `mapDirectory`: 맵 파일이 저장된 디렉터리 경로 (절대 경로 권장)

**실행 방법:**
```bash
npm install
npm start
```

## 주요 기능

### 맵 파일 비교
다운로드 된 맵 파일과 Kog공식 페이지 맵 파일을 비교  
다운로드 되지 않은 맵이 있다면 `missing_maps.json`에 표시
