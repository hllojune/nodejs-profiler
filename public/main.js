document.addEventListener('DOMContentLoaded', () => {
    // HTML에서 필요한 요소들을 가져옵니다.
    const uploadForm = document.getElementById('uploadForm');
    const dataFile = document.getElementById('dataFile');
    const statusP = document.getElementById('status');
    const viewByTaskBtn = document.getElementById('viewByTaskBtn');
    const viewByCoreBtn = document.getElementById('viewByCoreBtn');
    const ctx = document.getElementById('myChart').getContext('2d');
    let chart; // 차트 객체를 저장할 변수

    // '업로드 및 분석' 버튼을 눌렀을 때의 동작을 정의합니다.
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작을 막습니다.
        if (!dataFile.files[0]) {
            statusP.textContent = '⚠️ 파일을 선택해주세요.';
            return;
        }
        const formData = new FormData();
        formData.append('dataFile', dataFile.files[0]);
        statusP.textContent = '업로드 및 분석 중...';

        try {
            // '/api/upload' 주소로 파일을 POST 방식으로 보냅니다.
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Server error');
            statusP.textContent = '✅ 분석 완료! 아래 버튼으로 결과를 확인하세요.';
            // 분석이 끝나면 자동으로 'Task별 분석' 버튼을 클릭해줍니다.
            viewByTaskBtn.click();
        } catch (error) {
            statusP.textContent = '❌ 오류 발생. 서버가 켜져있는지 확인하세요.';
            console.error(error);
        }
    });

    // 서버에서 통계 데이터를 가져와 차트를 그리는 함수
    const fetchDataAndDrawChart = async (type) => {
        try {
            statusP.textContent = '그래프 로딩 중...';
            // '/api/stats/tasks' 또는 '/api/stats/cores' 주소로 데이터를 요청합니다.
            const response = await fetch(`/api/stats/${type}`);
            if (!response.ok) throw new Error('Data fetch error');
            const data = await response.json();

            const labels = data.map(d => d._id);
            const datasets = [
                { label: 'MIN', data: data.map(d => d.min), backgroundColor: 'rgba(54, 162, 235, 0.7)' },
                { label: 'MAX', data: data.map(d => d.max), backgroundColor: 'rgba(255, 99, 132, 0.7)' },
                { label: 'AVG', data: data.map(d => d.avg.toFixed(2)), backgroundColor: 'rgba(75, 192, 192, 0.7)' },
                { label: 'Std. Dev', data: data.map(d => d.stdDev.toFixed(2)), backgroundColor: 'rgba(255, 206, 86, 0.7)' }
            ];

            if (chart) chart.destroy(); // 기존 차트가 있으면 파괴하고 새로 그립니다.
            
            // Chart.js를 사용해 새 막대 차트를 생성합니다.
            chart = new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true } },
                    plugins: { 
                        title: { 
                            display: true, 
                            text: `${type === 'tasks' ? 'Task' : 'Core'} 별 성능 분석`, 
                            font: { size: 18 } 
                        } 
                    }
                }
            });
            statusP.textContent = ''; // 로딩 메시지 제거
        } catch (error) {
            statusP.textContent = '❌ 그래프 로딩 오류.';
            console.error(error);
        }
    };

    // 각 버튼을 클릭했을 때 fetchDataAndDrawChart 함수를 호출합니다.
    viewByTaskBtn.addEventListener('click', () => fetchDataAndDrawChart('tasks'));
    viewByCoreBtn.addEventListener('click', () => fetchDataAndDrawChart('cores'));
});