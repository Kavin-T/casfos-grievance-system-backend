const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

const getFile = asyncHandler((req, res) => {
    let filePath = req.query.filePath;

    if (!filePath) {
        res.status(400);
        throw new Error("File path is required.");
    }

    // Normalize path: Replace backslashes with forward slashes
    filePath = filePath.replace(/\\/g, '/');

    console.log(filePath);

    // Ensure the path starts with 'uploads/'
    if (!filePath.startsWith("uploads/")) {
        res.status(400);
        throw new Error("File path must start with 'uploads/'.");
    }

    const uploadDir = path.join(__dirname, "../");
    const absolutePath = path.resolve(uploadDir, filePath);

    console.log(absolutePath);

    // Prevent directory traversal attacks
    if (!absolutePath.startsWith(uploadDir)) {
        res.status(403);
        throw new Error("Access denied. Invalid file path.");
    }

    // Check if the file exists
    if (!fs.existsSync(absolutePath)) {
        console.log("Err");
        res.status(404);
        throw new Error("File not found.");
    }

    // Get the file name and mime type
    const fileName = path.basename(absolutePath);
    const mimeType = mime.lookup(absolutePath) || "application/octet-stream";

    // Set the response headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);

    // Stream the file to the client
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);

    // Handle errors during file streaming
    fileStream.on("error", (error) => {
        console.error("Error streaming file:", error);
        res.status(500);
        throw new Error("Error downloading file.");
    });
});

module.exports = { getFile };
