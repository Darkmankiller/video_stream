const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

const videoFile = "videos.json"; // JSON file to store video data

// Upload video to GoFile.io
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    // Upload to GoFile.io
    const gofileRes = await axios.post("https://store1.gofile.io/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const fileId = gofileRes.data.data.fileId;

    // Fetch direct video URL from GoFile.io API
    const fileInfoRes = await axios.get(`https://api.gofile.io/getContent?fileId=${fileId}`);
    const directUrl = fileInfoRes.data.data.contents[fileId].link;

    // Prepare video metadata
    const newVideo = {
      title: req.body.title,
      description: req.body.description,
      videoUrl: directUrl,
      uploadedAt: new Date(),
    };

    // Save video metadata in JSON file
    let videos = [];
    if (fs.existsSync(videoFile)) {
      const data = fs.readFileSync(videoFile);
      videos = JSON.parse(data);
    }
    videos.push(newVideo);
    fs.writeFileSync(videoFile, JSON.stringify(videos, null, 2));

    res.json({ message: "Video uploaded successfully", videoUrl: directUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all videos
router.get("/", (req, res) => {
  if (!fs.existsSync(videoFile)) {
    return res.json([]);
  }
  const data = fs.readFileSync(videoFile);
  res.json(JSON.parse(data));
});

module.exports = router;
