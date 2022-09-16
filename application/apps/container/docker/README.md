# Docker based deployment

The docker container will have endpoints for `/payment` and `/notification`, as well as a `/health` endpoint to support container management in tools like Kubernetes.
To build and test this, run the following commands:

```shell
# Build the docker image (do NOT run it from apps/container/docker, but from the application root)
cd application
docker build -f apps/container/docker/Dockerfile .

# Run and test the container locally:
docker run -p 5000:5000 --env-file .env <docker_image_id>

```

For deployment of this container in your cloud provider's environment, please refer to the documentation from your provider.
