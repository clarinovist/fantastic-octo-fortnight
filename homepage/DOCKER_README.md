# Docker Setup Guide

This guide explains how to build and run the Lesprivate Homepage using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### 1. Download CDN Images (Optional - Done automatically during build)

If you want to download images manually before building:

```bash
chmod +x download-cdn-images.sh
./download-cdn-images.sh
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: http://localhost:3000

### 3. Build Docker Image Manually (Alternative)

```bash
# Build the image
docker build -t lesprivate-homepage .

# Run the container
docker run -d -p 3000:80 --name lesprivate-homepage lesprivate-homepage

# Stop the container
docker stop lesprivate-homepage

# Remove the container
docker rm lesprivate-homepage
```

## What Happens During Build

1. **Dependencies Installation**: All npm packages are installed
2. **Image Download**: CDN images are automatically downloaded to `public/images/cdn/`
3. **Build Process**: Vite builds the production-ready application
4. **Nginx Setup**: The built files are served using Nginx web server

## Image Locations

All CDN images are downloaded to: `public/images/cdn/`

The following images are downloaded:
- Banner and logo images
- Hero section decorative elements
- Feature icons
- Teacher profile images
- Slider images

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, modify the port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 3000 to any available port
```

### Images Not Loading

If images don't load:
1. Check if images were downloaded: `ls -la public/images/cdn/`
2. Rebuild the container: `docker-compose up --build`

### View Container Logs

```bash
docker-compose logs -f web
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Configure proper domain and SSL certificates
3. Use a reverse proxy (like Nginx or Traefik) for SSL termination
4. Set up proper monitoring and logging

## Clean Up

Remove all containers, images, and volumes:

```bash
# Stop and remove containers
docker-compose down

# Remove the image
docker rmi lesprivate-homepage

# Remove all unused Docker resources
docker system prune -a
```
