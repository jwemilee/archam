const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

// server.js (Express 서버 파일)
const cors = require('cors');
const express = require('express');

app.use(cors({
    origin: 'https://archam.netlify.app'
}));

const app = express();
const PORT = 3300;
const DATA_FILE = path.join(__dirname, 'public', 'data', 'records.json'); // 경로 수정

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session 설정
app.use(session({
    secret: "millie0416",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));


// JSON 파일에서 데이터를 불러옵니다.
let records = [];
if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE);
    records = JSON.parse(rawData);
} else {
    console.log('No records.json file found. Starting with an empty array.');
}

// 모든 레코드 가져오기
app.get('/api/records', (req, res) => {
    res.json([...records].reverse());
});

// 새로운 레코드 추가
app.post('/api/records', (req, res) => {
    const newRecord = req.body;
    newRecord.id = records.length ? records[records.length - 1].id + 1 : 1;
    records.push(newRecord);

    // JSON 파일에 저장
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
    console.log('New Record Added: ', newRecord);

    res.status(201).json(newRecord);
});

// 상세 페이지 HTML 렌더링
app.get('/record/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// API 요청으로 데이터 전달
app.get('/api/record/:id', (req, res) => {
    const { id } = req.params;

    // 데이터 파일을 읽어와서 검색
    const records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const record = records.find(item => item.id === parseInt(id));

    if (record) {
        res.json(record);
    } else {
        console.error("해당 레코드가 없습니다:", id);
        res.status(404).json({ message: "Record not found" });
    }
});

   
// 레코드 삭제
app.delete('/api/records/:id', (req, res) => {
    const recordId = parseInt(req.params.id);
    console.log(`Trying to delete ID: ${recordId}`);
    const index = records.findIndex(record => record.id === recordId);

    if (index !== -1) {
        records.splice(index, 1);

        // JSON 파일에 저장
        fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
        console.log(`Record with ID ${recordId} deleted`);
        res.status(200).json({ message: 'Record deleted successfully' });
    } else {
        console.log(`Record with ID ${recordId} not found`);
        res.status(404).json({ message: 'Record not found' });
    }
});

// 레코드 수정
app.put('/api/records/:id', (req, res) => {
    const recordId = parseInt(req.params.id);
    const updatedRecord = req.body;

    const index = records.findIndex(record => record.id === recordId);

    if (index !== -1) {
        records[index] = { ...records[index], ...updatedRecord };

        // JSON 파일에 저장
        fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
        console.log(`Record with ID ${recordId} updated`);
        res.status(200).json(records[index]);
    } else {
        console.log(`Record with ID ${recordId} not found`);
        res.status(404).json({ message: 'Record not found' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Naver API 사용 설정
const NAVER_CLIENT_ID = '47j5zNwFMwTzdRe6R9YC';
const NAVER_CLIENT_SECRET = '6wJ2VdP7qg';

// 네이버 책 API
app.get('/api/search/book', (req, res) => {
    const query = req.query.query;

    const api_url = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}`;

    const options = {
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        }
    };

    fetch(api_url, options)
        .then(response => response.json())
        .then(data => res.json(data))
        .catch(error => {
            console.error('네이버 API 요청 중 오류 발생:', error);
            res.status(500).json({ message: '네이버 API 요청 실패' });
        });
});

// Admin 페이지 렌더링
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});