document.addEventListener("DOMContentLoaded", () => {
    // 다크 모드 감지 및 처리
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
        if (prefersDarkScheme.matches) {
            document.body.setAttribute("data-theme", "dark");
        } else {
            document.body.removeAttribute("data-theme");
        }
    };

    updateTheme();
    prefersDarkScheme.addEventListener("change", updateTheme);

    fetch("https://simple-proxy.taein.workers.dev/?destination=https://yuntae.in/api/music/recent/noa")
        .then(res => res.json())
        .then(data => {
            var artistName = data.data[0].attributes.artistName;
            var songName = data.data[0].attributes.name;
            var albumCover = data.data[0].attributes.artwork.url;

            // {w}x{h} 부분을 1000x1000으로 대체
            var resizeCover = albumCover.replace("{w}x{h}", "1000x1000");

            document.getElementById("artist").innerHTML = artistName;
            document.getElementById("song").innerHTML = songName;

            // 이미지 요소 생성
            var imgElement = document.createElement("img");
            imgElement.src = resizeCover; // 수정된 이미지 URL 설정
            imgElement.crossOrigin = "Anonymous"; // CORS 문제 방지

            // 이미지 요소를 cover ID를 가진 div에 추가
            var coverDiv = document.getElementById("cover");
            coverDiv.appendChild(imgElement);     

        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});