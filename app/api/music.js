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
    const userToken = "0.AleOoXV+HXS+ORjKfDxJRDvOg3ly8QE/EM06jfmaang2ByTeDjAAGm/Nzq9hisarxEsfLpULnyJq3DOcsEnwgvETXpBEiU8c4WvdpM+ridnA7EE/UM+fWE5bq8M13WOGMoHHLFkBmHVuKKvQJABDOfs2TFh0Q544HLyVk/W0Raojgq+CHgQhBtSUVt0cKmaa5imvE4XrDDFCaM6CvsOoQZ6HwMG9pg6ONGp3GegCwBKBkYrIaw=="; //media-user-token

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

                var resizeCover = albumCover.replace("{w}x{h}", "3000x3000");

                document.getElementById("artist").textContent = artistName;
                document.getElementById("song").textContent = songName;
                const albumArt = document.getElementById("album-art");
                albumArt.src = resizeCover;
                albumArt.onload = () => document.querySelector('.box6')?.classList.remove('no-album-art');
                albumArt.onerror = () => {
                    document.querySelector('.box6')?.classList.add('no-album-art');
                    albumArt.removeAttribute('src');
                };

            })
            .catch(error => {
                document.querySelector('.box6')?.classList.add('no-album-art');
                document.getElementById("song").textContent = "Music unavailable";
                document.getElementById("artist").textContent = "Try again shortly";
                console.error('Error fetching data:', error);
            });
});
