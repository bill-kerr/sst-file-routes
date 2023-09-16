# SST File Routes

`sst-file-routes` is a package that generates an SST API route configuration based on the file structure of your project. It gives SST application development a NextJS-like file-based routing experience.

## Getting Started

The easiest way to get started is via NPX.

```bash
npx sst-file-routes routes
```

This command assumes you have a `routes` directory with your SST API handlers. If your handlers are in a different file, replace `routes` with the relative path to the correct directory.

A file called `routes.ts` will be created inside of the specified directory.

## Conventions

The following conventions assume your API routes are in a `routes` directory.

To generate a handler for the route `GET /healthcheck`, create a file named `get.ts` inside of `/routes/healthcheck`.

For routes with path parameters, use curly braces in the folder names. For instance, to create the `POST /users/{userId}` route, you would create a `/routes/users/{userId}/post.ts`.

Your handler must be exported as `handler`. `export const handler = () => {}`;

```text
└── routes
    ├── get.ts
    └── users
        ├── post.ts
        └── {userId}
            ├── get.ts
```

The above folder structure would produce the following route configuation:

```text
GET  /
POST /users
GET  /users/{userId}
```

## Using the Route Config

Once your route config has been generated by `npx sst-file-routes`, simply import it into the file where you are configuring your SST API routes and drop it into the `routes` property of the API construct, calling the `routes()` method on the config object.

```ts
// sst.config.ts

import { SSTConfig } from "sst";
import { Api } from "sst/constructs";
import { routeConfig } from "./routes/routes";

export default {
	config(_input) {
		return {
			name: "sst-demo",
			region: "us-east-1",
		};
	},
	stacks(app) {
		new Api(app, "api", {
			routes: routeConfig.routes(),
		});
	},
} satisfies SSTConfig;
```

To configure a specific route, call `.configureRoute()` on the `routeConfig` before calling `routes`.

```ts
routeConfig
	.configureRoute("GET /users/{userId}", (_currentConfig) => {
		// Return any custom configuration you want.
		return {
			type: "function",
			url: "http://example.com",
		};
	})
	.routes();
```

## Getting Path Parameters

If a route in your application has a path parameter, a `getPathParameters` function will be exported from `routes.ts`. This function will give you nice autocomplete based on the files in your routes directory.

```ts
const { userId } = getPathParameters("POST /users/{userId}");
```

## Creating a catch-all route

[SST has support for a catch-all route](https://docs.sst.dev/apis#catch-all-routes). To create a catch-all route, create a `$default.ts` handler file in the root routes directory.

```text
└── routes
    ├── $default.ts // This handler file will create a catch-all route.
    ├── get.ts
    └── users
        ├── post.ts
        └── {userId}
            ├── get.ts
```

## Roadmap

Features to come:

- queue and cron function conventions
- watch mode
- better CLI
