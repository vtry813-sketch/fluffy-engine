const { cmd } = require("../command");
const axios = require("axios");
const ytSearch = require("yt-search");

cmd({
  pattern: "video",
  alias: ["ytmp4", "v"],
  desc: "Download YouTube videos by name or keyword",
  category: "download",
  react: "🎬",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {
  if (!q) {
    return conn.sendMessage(from, { text: "❌ Please enter a YouTube video keyword or name!" }, { quoted: mek });
  }

  try {
    // 🔍 Searching reaction
    await conn.sendMessage(from, { react: { text: "🔎", key: mek.key } });

    // 🔎 Search YouTube
    const searchResult = await ytSearch(q);
    const video = searchResult.videos?.[0];
    if (!video) throw new Error("No video found");

    // 🎯 Fetch download info
    const downloadInfo = await fetchVideoDownload(video);

    // 🌟 Send modern preview
    await sendStyledPreview(conn, from, mek, video, downloadInfo);

    // 🎬 Send actual video
    await sendStyledVideo(conn, from, mek, video, downloadInfo);

    // ✅ Success reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { text: "❌ Something went wrong! Please try again later." }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});

// -------------------
// Helper: Fetch Video
// -------------------
async function fetchVideoDownload(video) {
  const apis = [
    `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(video.url)}`,
    `https://iamtkm.vercel.app/downloaders/ytmp4?url=${encodeURIComponent(video.url)}`
  ];

  for (let i = 0; i < apis.length; i++) {
    try {
      const res = await axios.get(apis[i]);
      const data = i === 0 ? res.data.result : res.data?.data;
      const url = data?.download_url || data?.url;
      if (!url) throw new Error("No download URL found");

      return {
        title: data.title || video.title,
        thumbnail: data.thumbnail || video.thumbnail,
        download_url: url,
        quality: data.quality || (i === 0 ? "HD" : "Standard"),
      };
    } catch (e) {
      if (i === apis.length - 1) throw new Error("All APIs failed");
    }
  }
}

// -------------------
// Helper: Styled Preview
// -------------------
async function sendStyledPreview(conn, from, mek, video, info) {
  const caption = `🎬 *Video Preview* 🎬\n\n` +
                  `📌 *Title:* ${info.title}\n` +
                  `⏱️ *Duration:* ${video.timestamp}\n` +
                  `👁️ *Views:* ${video.views.toLocaleString()}\n` +
                  `📺 *Quality:* ${info.quality}\n` +
                  `📅 *Published:* ${video.ago}\n\n` +
                  `💡 Click the video below to stream or download!`;

  await conn.sendMessage(from, {
    image: { url: info.thumbnail },
    caption,
    contextInfo: {
      externalAdReply: {
        title: "inconnu xd Bot | Video Stream",
        body: "Seamless YouTube Video Streaming",
        thumbnailUrl: info.thumbnail,
        sourceUrl: video.url,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: mek });
}

// -------------------
// Helper: Styled Video
// -------------------
async function sendStyledVideo(conn, from, mek, video, info) {
  const caption = `🎥 *Streaming Now* 🎥\n\n` +
                  `💻 Powered by inconnu xd Bot\n` +
                  `↻ Click play to watch or save locally!`;

  await conn.sendMessage(from, {
    video: { url: info.download_url },
    mimetype: "video/mp4",
    caption,
    contextInfo: {
      externalAdReply: {
        title: "inconnu xd Bot | Stream & Download",
        body: "Watch instantly or save for later",
        thumbnailUrl: info.thumbnail,
        sourceUrl: video.url,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: mek });
      }

