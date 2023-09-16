import { Handler } from "./handler";

const imports = `import type { ApiRouteProps } from 'sst/constructs';\n\n`;

const routeType = `export type Route = keyof typeof routes;\n\n`;

const paramRouteType = `type ParamRoute = keyof {
  [R in Route as (typeof routes)[R]['params'] extends readonly [] ? never : R]: (typeof routes[R]);
};\n\n`;

const routeParamsType = `type RouteParams<R extends ParamRoute> = {
  [RouteName in ParamRoute]: {
    [K in (typeof routes)[R]['params'][number]]: string;
  };
}[R];\n\n`;

const eventWithPathParametersType = `type EventWithPathParameters = {
  pathParameters?: {
    [name: string]: string | undefined;
  };
};\n\n`;

const getPathParametersFunction = `export function getPathParameters<R extends ParamRoute>(
  route: R,
  event: EventWithPathParameters
): RouteParams<R> {
  if (!event.pathParameters) {
    throw new Error('No path parameters present!');
  }

  const params: Record<string, string> = {};
  for (const param of routes[route].params) {
    if (event.pathParameters[param]) {
      params[param] = event.pathParameters[param]!;
    }
  }
  
  if (routes[route].params.length !== Object.keys(params).length) {
    throw new Error('Could not find all required path parameters.');
  }
  
  return params as RouteParams<R>;
}\n\n`;

const routeConfigType = `type RouteConfig = Record<Route, ApiRouteProps<string>> & {
  route(
    route: Route,
    configFn: (current: ApiRouteProps<string>) => ApiRouteProps<string>,
  ): RouteConfig;
  toConfig(): Record<Route, ApiRouteProps<string>>;
};\n\n`;

const routeConfigBuild = `export const routeConfig: RouteConfig = {} as RouteConfig;
for (const [name, { path }] of Object.entries(routes)) {
  routeConfig[name as Route] = path;
}

routeConfig.route = function (route, configFn) {
  this[route] = configFn(this[route]);
  return this;
};

routeConfig.toConfig = function() {
  delete this.config;
  return this;
};\n`;

export function createRoutesFile(baseDirectory: string, handlerFilePaths: string[]): string {
	const handlers: Handler[] = [];
	for (const filePath of handlerFilePaths) {
		handlers.push(new Handler(filePath, baseDirectory));
	}

	const hasRoutesWithParams = handlers.some((h) => !!h.params.length);

	const routes = `const routes = {\n${handlers.reduce<string>(
		(acc, handler) =>
			acc.concat(
				`\t'${handler.pathString()}': { params: [${handler.params
					.map((param) => `'${param}'`)
					.join(", ")}], path: '${handler.handlerPath}', },\n`,
			),
		"",
	)}} as const;\n\n`;

	let fileContents = "".concat(imports, routes, routeType);

	if (hasRoutesWithParams) {
		fileContents = fileContents.concat(
			paramRouteType,
			routeParamsType,
			eventWithPathParametersType,
			getPathParametersFunction,
		);
	}

	fileContents = fileContents.concat(routeConfigType, routeConfigBuild);

	return fileContents;
}
