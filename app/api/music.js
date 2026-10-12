document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "https://yuntae.in/api/music/recent";
    const userToken = "0.AktYAPbNiGO2P8Hw2ITiDaBpBk/RfLVmvHuR06sa7WCBGWaqU7lBI8inTp2k8uX0yBzLCFj06BOV8tRMRivbTB+UmqhRczVHIXS2mOPyKHWUN6Ej5qDbxwTMn0dNZitD25b1ujoNHmhdH4csVD7r4XOmyg51OYzAkTeoIXP2r2In2Ux7Xxx4vPKX4aOxN+p3ifY+Xn9OggHOh1y2Hjf94e/xspY5rGol3Q9rDoCC9wo/ZMXzcg=="; //media-user-token
    const musicBox = document.querySelector(".box6");
    const albumArt = document.getElementById("album-art");
    const song = document.getElementById("song");
    const artist = document.getElementById("artist");
    if (!musicBox || !albumArt || !song || !artist) return;

    const clearArtwork = () => {
        musicBox.classList.add("no-album-art");
        albumArt.hidden = true;
        albumArt.removeAttribute("src");
        albumArt.alt = "";
    };
    const showStatus = (title, description) => {
        clearArtwork();
        song.textContent = title;
        artist.textContent = description;
    };

    showStatus("음악을 불러오는 중", "최근 들은 음악을 확인하고 있어요");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "user-token": userToken,
            },
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("Music request failed");
        const data = await response.json();
        const track = data?.data?.[0]?.attributes;
        if (!track || typeof track.name !== "string" || !track.name.trim()) {
            showStatus("아직 들은 음악이 없어요", "최근 들은 음악이 여기에 표시돼요");
            return;
        }

        song.textContent = track.name;
        artist.textContent = typeof track.artistName === "string" && track.artistName.trim()
            ? track.artistName : "아티스트 정보가 없어요";
        if (typeof track.artwork?.url !== "string" || !track.artwork.url.trim()) return;
        const artworkUrl = track.artwork.url.replaceAll("{w}", "512").replaceAll("{h}", "512");
        let artwork;
        try {
            artwork = new URL(artworkUrl);
        } catch {
            return;
        }
        if (!["https:", "http:"].includes(artwork.protocol)) return;

        albumArt.onload = () => {
            albumArt.hidden = false;
            musicBox.classList.remove("no-album-art");
        };
        albumArt.onerror = clearArtwork;
        albumArt.alt = `${track.name} 앨범 표지`;
        albumArt.src = artwork.href;
    } catch {
        showStatus("음악을 불러오지 못했어요", "잠시 후 다시 확인해 주세요");
    } finally {
        window.clearTimeout(timeout);
    }
});
