#!/bin/bash

# Supposing to deploy on x86_64 architecture
docker build -t fabrizio2210/difficult_words-frontend-dev -f docker/x86_64/Dockerfile-frontend-dev .
docker compose -f docker/lib/stack-dev.yml up --force-recreate --remove-orphans --renew-anon-volumes
