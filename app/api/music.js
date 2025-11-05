document.addEventListener("DOMContentLoaded", () => {
    // 다크 모드 감지 및 처리 (기존 코드 유지)
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

    const apiUrl = "https://yuntae.in/api/music/recent";
    const userToken = "As/7rThEu36hoBYtl0EA2nOswDjqdGWpltAq98DSGkJztQUWboLS/j1f5ZnndDaRs1iyb9tIuVMcDYdWIZ4wRzZCHGVES7VOGNwhsKPW8kkGRAX8RQrqG105CaL+rIM/MxSsSdeOX/9fmF8ZKtwSZLe6sTDFKIPXbQLbWgsiDQB2854OIT1rLWfEj2FtxcqCZvrCrhAbAZPVkHvnJHohThG6CTsnGed0bV3mUgWNlUmvA1eMKQ=="; //media-user-token


        fetch(apiUrl,{
            headers: {
                'Content-Type': 'application/json',
                'user-token': userToken
            }
        })
            .then(res => res.json())
            .then(data => {
                var artistName = data.data[0].attributes.artistName;
                var songName = data.data[0].attributes.name;
                var albumCover = data.data[0].attributes.artwork.url;

                var resizeCover = albumCover.replace("{w}x{h}", "1000x1000");

                document.getElementById("artist").innerHTML = artistName;
                document.getElementById("song").innerHTML = songName;

                // --- 여기만 수정됩니다 ---
                // ID가 'album-art'인 img 태그를 찾아 src 속성을 설정합니다.
                document.getElementById("album-art").src = resizeCover;
                // -------------------------

            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
});