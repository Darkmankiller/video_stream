const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express(); 

// Middleware to serve static files (like video files) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON
app.use(express.json());

// Serve static HTML files from the current directory (or public folder if you prefer)
app.use(express.static(path.join(__dirname)));

// Setup storage for uploaded videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create unique filenames
    }
});

const upload = multer({ storage: storage });

// Route to upload a video
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    const { title, description } = req.body;
    const videoPath = req.file.path;
    const videoFilename = req.file.filename;

    const videoData = {
        title: title,
        description: description,
        path: videoPath,
        filename: videoFilename,
        uploadDate: new Date().toISOString()
    };

    // Read current videos.json data
    fs.readFile('videos.json', (err, data) => {
        let videos = [];
        if (!err) {
            try {
                videos = JSON.parse(data);
            } catch (parseError) {
                console.log("Error parsing videos.json, initializing new file...");
            }
        }

        // Add the new video to the list
        videos.push(videoData);

        // Write updated video data to videos.json
        fs.writeFile('videos.json', JSON.stringify(videos, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving video data' });
            }
            res.status(200).json({ message: 'Video uploaded successfully' });
        });
    });
});

// Route to get all uploaded videos
app.get('/api/videos', (req, res) => {
    fs.readFile('videos.json', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading video data' });
        }

        const videos = JSON.parse(data);
        res.status(200).json(videos); // Send the video list as JSON
    });
});

// Route to delete a video
app.delete('/api/videos/delete/:filename', (req, res) => {
    const { filename } = req.params;

    // Read the videos.json file
    fs.readFile('videos.json', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading video data' });
        }

        let videos = JSON.parse(data);

        // Find the index of the video to delete
        const videoIndex = videos.findIndex(video => video.filename === filename);

        if (videoIndex !== -1) {
            // Remove video from the list
            videos.splice(videoIndex, 1);

            // Write the updated videos list back to videos.json
            fs.writeFile('videos.json', JSON.stringify(videos, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error saving updated video list' });
                }

                // Delete the video file from the uploads folder
                fs.unlink(path.join(__dirname, 'uploads', filename), (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error deleting video file' });
                    }

                    res.status(200).json({ success: true, message: 'Video deleted successfully' });
                });
            });
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
