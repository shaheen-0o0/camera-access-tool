const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");

// Configuration
const PORT = 3000;
const CLOUDFLARE_DOMAIN = "camera-tool.yourdomain.com"; // Replace with your Cloudflare domain

// Ensure cloudflared is installed
const CLOUDFLARED_PATH = "/usr/local/bin/cloudflared"; // Update path if different
if (!fs.existsSync(CLOUDFLARED_PATH)) {
    console.error("cloudflared not found! Install it before running this tool.");
    process.exit(1);
}

// Start Cloudflare Tunnel
console.log("Starting Cloudflare Tunnel...");
exec(
    `${CLOUDFLARED_PATH} tunnel --url http://localhost:${PORT}`,
    (err, stdout, stderr) => {
        if (err) {
            console.error("Error starting Cloudflare Tunnel:", err.message);
            return;
        }
        console.log(`Cloudflare Tunnel started. Access your app at: https://${CLOUDFLARE_DOMAIN}`);
    }
);

// Create the Express app
const app = express();
app.use(express.static("public"));

// Endpoint: Discover cameras
app.get("/discover", async (req, res) => {
    const ipRange = req.query.range || "192.168.1";
    const foundCameras = [];

    for (let i = 1; i <= 255; i++) {
        const ip = `${ipRange}.${i}`;
        try {
            const response = await axios.get(`http://${ip}`, { timeout: 2000 });
            if (response.status === 200) {
                foundCameras.push({ ip, status: "Online" });
            }
        } catch {
            // Ignore unreachable IPs
        }
    }

    res.json(foundCameras);
});

// Endpoint: Proxy camera stream
app.get("/stream", async (req, res) => {
    const { ip, user, pass } = req.query;
    const auth = Buffer.from(`${user}:${pass}`).toString("base64");
    const url = `http://${ip}/stream`;

    try {
        const response = await axios.get(url, {
            responseType: "stream",
            headers: { Authorization: `Basic ${auth}` },
        });
        response.data.pipe(res);
    } catch (err) {
        res.status(500).send("Failed to access stream");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Camera Tool running on http://localhost:${PORT}`);
    console.log(`Cloudflare Tunnel will route traffic to your app.`);
});

// Create the HTML interface dynamically
if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
}

fs.writeFileSync(
    "public/index.html",
    `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Camera Access Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #cameraList { margin-top: 20px; }
        .camera { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .loading { display: none; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Camera Access Tool</h1>
    <label for="range">IP Range:</label>
    <input type="text" id="range" placeholder="192.168.1" value="192.168.1">
    <button onclick="discoverCameras()">Discover Cameras</button>
    <div id="loading" class="loading">Loading...</div>
    <div id="error" class="error"></div>
    <div id="cameraList"></div>

    <script>
        async function discoverCameras() {
            const range = document.getElementById("range").value;
            const cameraList = document.getElementById("cameraList");
            const loading = document.getElementById("loading");
            const error = document.getElementById("error");

            cameraList.innerHTML = '';
            error.textContent = '';
            loading.style.display = 'block';

            try {
                const response = await fetch("/discover?range=" + range);
                const cameras = await response.json();
                loading.style.display = 'none';
                
                if (cameras.length) {
                    cameraList.innerHTML = cameras.map(c => `
                        <div class="camera">
                            <strong>${c.ip}</strong> - <span>${c.status}</span>
                            <button onclick="viewCamera('${c.ip}')">View</button>
                        </div>
                    `).join("");
                } else {
                    cameraList.innerHTML = "<p>No cameras found</p>";
                }
            } catch (err) {
                loading.style.display = 'none';
                error.textContent = 'Failed to discover cameras. Please try again.';
            }
        }

        function viewCamera(ip) {
            const user = prompt("Enter username:");
            const pass = prompt("Enter password:");
            if (user && pass) {
                window.open("/stream?ip=" + ip + "&user=" + user + "&pass=" + pass, "_blank");
            }
        }
    </script>
</body>
</html>
`
);
