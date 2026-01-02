# Docker & Deployment

ModernJS includes a Docker setup for serving the production build using Nginx. This setup is designed to be lightweight and efficient, serving only static files.

## Docker Compose Workflow

The `docker/docker-compose.yml` is configured to serve the locally built `packages/app/dist/` folder using an Nginx container.

### Prerequisites

- Docker and Docker Compose installed.
- Node.js installed (to build the project).

### Running the Application

1.  **Build the project**:
    Generate the production files.
    ```bash
    npm run build
    ```

2.  **Start the container**:
    Navigate to the docker directory and start Nginx.
    ```bash
    cd docker
    docker-compose up -d
    ```

3.  **Access the application**:
    Open [http://localhost:8080](http://localhost:8080) in your browser.

### Configuration

- **`docker/docker-compose.yml`**:
    - Uses the official `nginx:alpine` image.
    - Maps port `8080` on the host to port `80` in the container.
    - Mounts `../packages/app/dist` to `/usr/share/nginx/html` (web root).
    - Mounts `./nginx.conf` to `/etc/nginx/conf.d/default.conf` (configuration).

- **`nginx.conf`**:
    - Configured for Single Page Application (SPA) routing.
    - Redirects all 404 requests to `index.html` so the client-side router can handle them.
    - Includes basic caching headers for static assets.

## Self-Contained Dockerfile

A `Dockerfile` is also provided for creating a self-contained image that includes the build process. This is ideal for CI/CD pipelines or deployments where you want a single artifact.

### Building the Image

Run this command from the **root** of the repository:

```bash
docker build -f docker/Dockerfile -t modernjs-app .
```

This performs a multi-stage build:
1.  **Build Stage**: Installs dependencies and runs `npm run build`.
2.  **Production Stage**: Copies the `packages/app/dist/` folder to an Nginx image.

### Running the Image

```bash
docker run -p 8080:80 modernjs-app
```
