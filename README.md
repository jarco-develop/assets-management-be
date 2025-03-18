# Assets Management Backend

This is a NestJS-based API that managements crypto payment orders and stores them in a PostgreSQL database.

## Environment setup

 - Install [Node.js](https://nodejs.org/)
   - Recommended method is by using [NVM](https://github.com/creationix/nvm)
   - Recommended Node.js version is v22.x
 - Install [Docker](https://docs.docker.com/get-docker/)

## Get Started

Install all the dependencies:

```
npm ci
```

Copy the `.env.sample` file to `.env`

```
cp .env.sample .env
```

Add `PROVIDER_RPC` required environment variables in the `.env` file.
The rpc endpoints can be a comma-separated list

### `run start:dockers`

Start all the docker containers.

### `run down:dockers`

Stop all the docker containers.

### `npm run backend:logs`

Show the logs of the running docker container.

In the project directory, you can run:

### `npm run start:dev`

Runs the NodeJs services in the development mode.\
Open [localhost:8080/api/v1/ping](http://localhost:8080/api/v1/ping) to view it in the browser or Postman.

The service will reload if you make edits.

## Test

### `npm test`

Running the unit tests.
