document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const statusDiv = document.getElementById("status");

    uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(uploadForm);
        const file = document.getElementById("videoFile").files[0];

        // Check file size limit (e.g., max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            statusDiv.innerHTML = "<p style='color:red;'>File is too large! Max 100MB allowed.</p>";
            return;
        }

        statusDiv.innerHTML = "<p>Uploading...</p>";

        try {
            const response = await fetch("/api/videos/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                statusDiv.innerHTML = "<p style='color:green;'>Video uploaded successfully!</p>";
            } else {
                statusDiv.innerHTML = `<p style='color:red;'>Error: ${result.message}</p>`;
            }
        } catch (error) {
            statusDiv.innerHTML = "<p style='color:red;'>Failed to upload video.</p>";
            console.error("Upload error:", error);
        }
    });
});
