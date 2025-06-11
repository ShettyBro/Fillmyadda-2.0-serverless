document.addEventListener("DOMContentLoaded", async () => {
    const seriesId = localStorage.getItem("selectedSeriesId") || 1;
    const seasonNumber = 1;
    loadEpisodes(seriesId, seasonNumber);
});

async function loadEpisodes(seriesId, seasonNumber) {
    const response = await fetch("/.netlify/functions/getSeriesData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId, seasonNumber })
    });

    const episodes = await response.json();
    renderEpisodes(episodes);
}

function renderEpisodes(episodes) {
    const episodeList = document.getElementById("episodeList");
    episodeList.innerHTML = "";

    episodes.forEach(episode => {
        const card = document.createElement("div");
        card.className = "episode-card";
        card.onclick = () => {
            localStorage.setItem("selectedMovieId", episode.episodeId);
            localStorage.setItem("isEpisode", "true");
            window.location.href = "player.html";
        };

        card.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${episode.thumbnail}" alt="Episode ${episode.episode_number}">
                <div class="play-overlay">
                    <div class="play-circle">▶</div>
                </div>
            </div>
            <div class="episode-info">
                <h3>
                    <span>${episode.title}</span>
                    <span class="episode-number">${episode.episode_number}</span>
                </h3>
                <div class="episode-details">
                    <span>${episode.duration}</span>
                </div>
                <div class="episode-description">${episode.description}</div>
            </div>
        `;
        episodeList.appendChild(card);
    });
}
