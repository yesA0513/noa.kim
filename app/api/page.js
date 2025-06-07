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