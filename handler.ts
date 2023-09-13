import * as path from 'path';
import { getSlashCount } from './util';

const handlerFileNames = new Set([
  'get.ts',
  'post.ts',
  'patch.ts',
  'options.ts',
  'delete.ts',
  'put.ts',
] as const);
type HandlerFileName = typeof handlerFileNames extends Set<infer R> ? R : never;

export function isHandlerFile(fileName: string): fileName is HandlerFileName {
  return handlerFileNames.has(fileName as HandlerFileName);
}

const handlerMethods = new Set(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'] as const);
export type HandlerMethod = typeof handlerMethods extends Set<infer R> ? R : never;

export function isHandlerMethod(method: string): method is HandlerMethod {
  return handlerMethods.has(method as HandlerMethod);
}

export class Handler {
  public readonly filePath: string;
  public readonly handlerPath: string;
  public readonly params: string[] = [];
  public readonly method: HandlerMethod;

  private readonly rootPath: string;

  constructor(filePath: string, rootPath: string) {
    this.filePath = filePath;
    this.rootPath = rootPath;

    /**
     * Set the handler path.
     */
    this.handlerPath = this.filePath
      .slice(0, this.filePath.length - 3)
      .replace(path.sep, '/')
      .concat('.handler');

    /**
     * Set the handler method.
     */
    const method = this.filePath
      .slice(this.filePath.lastIndexOf(path.sep) + 1, this.filePath.length - 3)
      .toUpperCase();
    if (!isHandlerMethod(method)) {
      throw new Error(`Invalid handler file method: ${method}`);
    }
    this.method = method;

    /**
     * Parse out handler path parameters.
     */
    const matches = this.handlerPath.matchAll(/{(.*?)}/g);
    const used = new Set<string>();

    for (const match of matches) {
      if (used.has(match[1])) {
        throw new Error(
          `A path parameter appeared twice in a handler path. Parameter: ${match[1]} Path: ${this.handlerPath}`
        );
      }
      this.params.push(match[1]);
      used.add(match[1]);
    }
  }

  public pathString(): string {
    const urlPath = this.handlerPath.replace(this.rootPath, '');
    const lastSlashPosition = urlPath.lastIndexOf('/');
    const slashCount = getSlashCount(urlPath);
    const sliceOffset = slashCount === 1 ? 1 : 0;
    return `${this.method} ${urlPath.slice(urlPath.indexOf('/'), lastSlashPosition + sliceOffset)}`;
  }
}
