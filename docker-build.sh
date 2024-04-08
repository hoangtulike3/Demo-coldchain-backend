#!/bin/bash
. ./.env/.env

RESET="\e[0m"
GREEN="\e[92m"
BLUE="\e[34m"
RED="\e[91m"

IMAGE_NAME="${PROJECT_ID}-${APP_ID}:latest"

# 이미지 빌드
build() {
  echo -e $BLUE
  echo "Image: ${IMAGE_NAME}"
  echo -e $RESET

  # 이미지 빌드
  set -x
  docker build -t $IMAGE_NAME -f Dockerfile.dev .
  set +x
  echo

 # 디스크 정리
  docker image prune -f
  echo

  # 이미지 조회
  docker images --filter reference=$IMAGE_NAME
  echo
}

build
