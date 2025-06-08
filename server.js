const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// 로컬 MongoDB에 연결합니다. (DB이름: profilerDB)
mongoose.connect('mongodb+srv://hllojune21:rRTAzTYt67rnBV1z@cluster0.pieixpf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 다른 주소(localhost:3000)에서의 요청을 허용합니다 (CORS).
app.use(cors());
// JSON 형태의 요청을 서버가 이해할 수 있게 합니다.
app.use(express.json());
// 'public' 폴더에 있는 파일들(html, css, js)을 외부에서 접근 가능하게 합니다.
app.use(express.static('public'));
// '/api'로 시작하는 모든 요청은 'routes/api.js' 파일에서 처리하도록 넘겨줍니다.
app.use('/api', apiRoutes);

// 서버를 3000번 포트에서 실행합니다.
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});