const mongoose = require('mongoose');

const perfDataSchema = new mongoose.Schema({
    run_id: String,   // 각 데이터 그룹(블록)을 구분할 ID
    core: String,     // e.g., 'core1'
    task: String,     // e.g., 'task1'
    value: Number     // 성능 측정값
});

module.exports = mongoose.model('PerfData', perfDataSchema);