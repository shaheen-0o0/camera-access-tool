# Camera Access Tool

This tool allows you to discover and access IP cameras on your local network. It uses Cloudflare Tunnel to expose the local server to the internet.

## Features
- Discover IP cameras within a specified IP range.
- View live streams from discovered cameras.

## Requirements
- Node.js
- npm
- Cloudflared

## Installation and Usage

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/camera-access-tool.git
    cd camera-access-tool
    ```
2. Make the install.sh script executable:
    ```
    chmod +x install.sh

3. Run the installation script:
    ```sh
    bash install.sh
    ```

4. Access the application:
    Open a browser and go to `http://localhost:3000` or `https://camera-tool.yourdomain.com` if using Cloudflare Tunnel.

## License
MIT License
