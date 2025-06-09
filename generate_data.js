const fs = require('fs');
const path = require('path');

const NUM_BLOCKS = 1000; // 생성할 데이터 블록 수 (1000개면 약 6만 라인)
const FILE_PATH = path.join(__dirname, 'data', 'large_inputFile.txt');

console.log(`Generating large data file with ${NUM_BLOCKS} blocks...`);

const writer = fs.createWriteStream(FILE_PATH);

const tasks = ['task1', 'task2', 'task3', 'task4', 'task5'];
const cores = ['core1', 'core2', 'core3', 'core4', 'core5'];

function generateRandomValue() {
    // 700 ~ 1200 사이의 임의의 정수 생성
    return Math.floor(Math.random() * (1200 - 700 + 1)) + 700;
}

for (let i = 0; i < NUM_BLOCKS; i++) {
    // Write header
    writer.write(tasks.join('\t') + '\n');

    // Write core data
    for (const core of cores) {
        const values = [core];
        for (let j = 0; j < tasks.length; j++) {
            values.push(generateRandomValue());
        }
        writer.write(values.join('\t') + '\n');
    }

    // Add a blank line between blocks
    if (i < NUM_BLOCKS - 1) {
        writer.write('\n');
    }
}

writer.end();

writer.on('finish', () => {
    console.log(`✅ Successfully created ${FILE_PATH}`);
});

writer.on('error', (err) => {
    console.error('❌ Error writing file:', err);
});