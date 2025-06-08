const express = require('express');
const multer = require('multer');
const PerfData = require('../models/perfData');
const router = express.Router();

// Multer 설정: 파일을 서버 디스크가 아닌 메모리에 잠시 저장합니다.
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 텍스트 파일 내용을 분석(파싱)해서 DB에 저장할 형태로 가공하는 함수
 */
const parseData = (buffer) => {
    const text = buffer.toString('utf8');
    // 파일을 줄 단위로 나누고, 빈 줄은 제거합니다.
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const dataPoints = [];
    let currentTasks = [];
    let runCounter = 0;

    lines.forEach(line => {
        // 공백, 탭 등 여러 개의 공백을 기준으로 텍스트를 자릅니다.
        const parts = line.split(/\s+/).filter(p => p);
        if (parts[0] === 'task1') { // 'task1'으로 시작하는 줄은 헤더(제목)로 간주합니다.
            currentTasks = parts;
            runCounter++; // 새로운 데이터 그룹(블록)으로 카운트합니다.
        } else if (parts[0] && parts[0].startsWith('core')) { // 'core'로 시작하는 줄은 실제 데이터로 간주합니다.
            const coreName = parts[0];
            for (let i = 1; i < parts.length; i++) {
                if (currentTasks[i-1] && parts[i]) {
                    dataPoints.push({
                        run_id: `run_${runCounter}`,
                        core: coreName,
                        task: currentTasks[i-1],
                        value: parseInt(parts[i], 10)
                    });
                }
            }
        }
    });
    return dataPoints;
};

/**
 * [API 1] 파일 업로드 및 DB 저장
 * POST /api/upload
 */
router.post('/upload', upload.single('dataFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        // 새 데이터를 넣기 전, 기존 데이터를 모두 삭제합니다.
        await PerfData.deleteMany({});
        // 파싱 함수를 호출해 파일 내용을 가공합니다.
        const dataToSave = parseData(req.file.buffer);
        // 가공된 데이터를 DB에 한 번에 저장합니다.
        await PerfData.insertMany(dataToSave);
        res.status(200).json({ message: 'File processed successfully.' });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).send('Error processing file.');
    }
});

/**
 * [API 2] 통계 데이터 계산 및 제공
 * GET /api/stats/tasks 또는 /api/stats/cores
 */
const getStats = async (groupField, res) => {
    try {
        // MongoDB의 Aggregation 기능을 사용해 통계를 계산합니다.
        const stats = await PerfData.aggregate([
            {
                $group: {
                    _id: `$${groupField}`, // groupField(task 또는 core) 기준으로 데이터를 묶습니다.
                    min: { $min: '$value' },
                    max: { $max: '$value' },
                    avg: { $avg: '$value' },
                    stdDev: { $stdDevPop: '$value' } // 표준편차 계산
                }
            },
            { $sort: { _id: 1 } } // 이름순(core1, core2...)으로 정렬합니다.
        ]);
        res.json(stats);
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).send('Error fetching stats.');
    }
};

router.get('/stats/tasks', (req, res) => getStats('task', res));
router.get('/stats/cores', (req, res) => getStats('core', res));

module.exports = router;