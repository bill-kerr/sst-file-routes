# SST File Routes

`sst-file-routes` is a package that generates an SST API route configuration based on the file structure of your project. It gives SST application development a NextJS-like file-based routing experience.

## Getting Started

`sst-file-routes` is a work in progress. To work with it currently, you should be able to run it with `node ./node_modules/sst-file-routes/index.js {routesFolder}`.

`npx ts-node ./node_modules/sst-file-routes/index.ts {routesFolder}` where `{routesFolder}` is the folder with all of your API routes and handlers.

The script will generate a `routes.ts` file inside of your routes folder. You can then import the `routeConfig` object from that file and pass it directly to the `routes` config property of your API construct config.

## Conventions

To generate a handler for the route `GET /test/one`, create a file named `get.ts` inside of `/{routeFolder}/test/one`.

For routes with path parameters, use curly braces in the folder names. For instance, `POST /users/{id}` would be `/{routeFolder}/users/{id}/post.ts`.

Your handler must be exported as `handler`. `export const handler = () => {}`;

## Configuration
