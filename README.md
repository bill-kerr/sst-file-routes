# SST File Routes

`sst-file-routes` is a package that generates an SST API route configuration based on the file structure of your project. It gives SST application development a NextJS-like file-based routing experience.

## Getting Started

The easiest way to get started is via NPX: `npx sst-file-routes routes`

This command assumes you have a `routes` directory with your SST API handlers. If your handlers are in a different file, replace `routes` with the relative path to the correct directory.

A file called `routes.ts` will be created inside of the specified directory.

## Conventions

The following conventions assume your API routes are in a `routes` directory.

To generate a handler for the route `GET /healthcheck`, create a file named `get.ts` inside of `/routes/healthcheck`.

For routes with path parameters, use curly braces in the folder names. For instance, to create the `POST /users/{userId}` route, you would create a `/routes/users/{userId}/post.ts`.

Your handler must be exported as `handler`. `export const handler = () => {}`;

## Getting Path Parameters

If a route in your application has a path parameter, a `getPathParameters` function will be exported from `routes.ts`. This function will give you nice autocomplete based on the files in your routes directory.

```ts
const { userId } = getPathParameters("POST /users/{userId}");
```

## Roadmap

Features to come:

- fallback route (`$default.ts`)
- queue and cron function conventions
- watch mode
