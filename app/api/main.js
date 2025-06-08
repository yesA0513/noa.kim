document.addEventListener('DOMContentLoaded', () => {
    // MBTI 클릭 기능
    const mbtiItems = document.querySelectorAll('.mbti-item');
    const mbtiDescriptions = document.querySelectorAll('.mbti-desc');

    mbtiItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // 이벤트 전파를 막아 문서 전체의 클릭 이벤트가 실행되지 않게 함
            event.stopPropagation(); 

            const type = item.getAttribute('data-type');
            const targetDesc = document.querySelector(`.mbti-desc[data-type="${type}"]`);
            
            // 현재 클릭한 아이템이 이미 활성화 상태인지 확인
            const wasActive = item.classList.contains('is-active');

            // 먼저 모든 아이템과 설명의 활성 상태를 제거
            mbtiItems.forEach(i => i.classList.remove('is-active'));
            mbtiDescriptions.forEach(d => d.classList.remove('is-active'));

            // 만약 클릭한 아이템이 비활성 상태였다면, 활성 상태로 만듦
            if (!wasActive) {
                item.classList.add('is-active');
                if (targetDesc) {
                    targetDesc.classList.add('is-active');
                }
            }
            // 이미 활성 상태였다면, 위의 초기화 로직에 의해 비활성화된 상태로 남게 됨 (토글 오프)
        });
    });

    // MBTI 영역 바깥을 클릭하면 모든 활성 상태를 해제
    document.addEventListener('click', () => {
        mbtiItems.forEach(i => i.classList.remove('is-active'));
        mbtiDescriptions.forEach(d => d.classList.remove('is-active'));
    });
});