document.addEventListener('DOMContentLoaded', () => {

    // 1. 애니메이션을 적용할 모든 요소를 선택합니다.
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    // 2. Intersection Observer 생성
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // entry.isIntersecting: 요소가 뷰포트와 교차하는지 여부 (true/false)
            if (entry.isIntersecting) {
                // 요소가 화면에 보이면 'is-visible' 클래스를 추가합니다.
                entry.target.classList.add('is-visible');
                
                // 한 번 나타난 요소는 더 이상 관찰할 필요가 없으므로 관찰을 중지합니다.
                // 이렇게 하면 스크롤 성능이 향상됩니다.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // threshold: 요소가 얼마나 보여야 콜백 함수를 실행할지 결정 (0.1 = 10%)
        threshold: 0.1 
    });

    // 3. 각 요소를 관찰 시작
    revealElements.forEach(element => {
        observer.observe(element);
    });

});