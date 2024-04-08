start() {
  NODE_ENV=${1,,}
  if [ "$NODE_ENV" = "development" -o "$NODE_ENV" = "dev" ]; then
    COMPOSE_FILE="docker-compose-dev.yaml"
  elif [ "$NODE_ENV" = "production" -o "$NODE_ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose-prod.yaml"
  else
    COMPOSE_FILE="docker-compose-prod.yaml"
  fi 
  echo
  set -x
  docker-compose -f $COMPOSE_FILE up -d
  set +x
  echo
}

start $@