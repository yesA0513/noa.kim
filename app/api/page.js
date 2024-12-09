document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('introduceLink').addEventListener('click', function(e) {
        e.preventDefault(); // 기본 링크 동작 방지

        // AJAX를 사용하여 introduce 페이지 내용을 가져옴
        fetch('/pages/introduce.html')
            .then(response => response.text())
            .then(data => {
                // 현재 페이지의 내용을 새로운 내용으로 교체
                document.querySelector('.contents').innerHTML = data;
            })
            .catch(error => console.error('Error:', error));
    });
});

function updateTimeGradient() {
    const now = new Date();
    const hour = now.getHours();
    const box9 = document.querySelector('.box9');
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkMode) {
        // 다크모드일 때의 시간별 그라데이션
        if (hour >= 5 && hour < 11) {
            // 아침: 어두운 노란색 계열
            box9.style.background = 'linear-gradient(180deg, #3d3a2d, #222222)';
        } else if (hour >= 11 && hour < 16) {
            // 낮: 어두운 하늘색 계열
            box9.style.background = 'linear-gradient(180deg, #212a42, #222222)';
        } else if (hour >= 16 && hour < 20) {
            // 저녁: 어두운 주황색 계열
            box9.style.background = 'linear-gradient(180deg, #3d2d2d, #222222)';
        } else {
            // 밤: 매우 어두운 남색 계열
            box9.style.background = 'linear-gradient(180deg, #1a2833, #222222)';
        }
    } else {
        // 라이트모드일 때는 기존 그대로 유지
        if (hour >= 5 && hour < 11) {
            box9.style.background = 'linear-gradient(180deg, #fff3c8, #f1f1f1)';
        } else if (hour >= 11 && hour < 16) {
            box9.style.background = 'linear-gradient(180deg, #c8eaff, #f1f1f1)';
        } else if (hour >= 16 && hour < 20) {
            box9.style.background = 'linear-gradient(180deg, #ffd4c8, #f1f1f1)';
        } else {
            box9.style.background = 'linear-gradient(180deg, #1f3c46, #333333)';
        }
    }
}

// 페이지 로드시 실행
document.addEventListener('DOMContentLoaded', () => {
    updateTimeGradient();
    // 1분마다 그라데이션 업데이트
    setInterval(updateTimeGradient, 60000);
});

// 다크모드 변경 감지
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTimeGradient);