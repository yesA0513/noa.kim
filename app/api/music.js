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
    const userToken = "0.AktYAPbNiGO2P8Hw2ITiDaBpBk/RfLVmvHuR06sa7WCBGWaqU7lBI8inTp2k8uX0yBzLCFj06BOV8tRMRivbTB+UmqhRczVHIXS2mOPyKHWUN6Ej5qDbxwTMn0dNZitD25b1ujoNHmhdH4csVD7r4XOmyg51OYzAkTeoIXP2r2In2Ux7Xxx4vPKX4aOxN+p3ifY+Xn9OggHOh1y2Hjf94e/xspY5rGol3Q9rDoCC9wo/ZMXzcg=="; //media-user-token

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
                document.getElementById("album-art").src = resizeCover;

            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
});