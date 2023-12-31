#!/bin/bash

set -e
set -u
set -x
#############
# Environment

workspace=$(dirname $0)
if ! echo $workspace |  grep "^/" ;  then
  workspace="$(pwd)/$workspace"
fi
repository='/tmp'
changedFiles="$(git diff --name-only HEAD^1 HEAD)"

if [ $(uname -m) = "x86_64" ] ; then
  arch="x86_64"
else
  arch="armv7hf"
fi

################
# Login creation

if [ ! -f ~/.docker/config.json ] ; then 
  mkdir -p ~/.docker/

  if [ -z "$DOCKER_LOGIN" ] ; then
	  echo "Docker login not found in the environment, set DOCKER_LOGIN"
  else
    cat << EOF > ~/.docker/config.json
{
  "experimental": "enabled",
        "auths": {
                "https://index.docker.io/v1/": {
                        "auth": "$DOCKER_LOGIN"
                }
        },
        "HttpHeaders": {
                "User-Agent": "Docker-Client/17.12.1-ce (linux)"
        }
}
EOF
  fi
fi

#######
# Build

docker build -t fabrizio2210/difficult_words-frontend:${arch} -f docker/x86_64/Dockerfile-frontend .

######
# Test

# docker/lib/test-app.sh

######
# Push

docker push fabrizio2210/difficult_words-frontend:${arch}

#######
# Clean
docker container prune --force
docker image prune --force

#####
# Run

docker service update --force --image fabrizio2210/difficult_words-frontend:armv7hf  difficult-words_frontend
