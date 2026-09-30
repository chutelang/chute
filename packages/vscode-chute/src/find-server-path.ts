interface FindServerPathOptions {
  configuredPath: string;
  isExecutable: (path: string) => boolean;
}

export function findServerPath(options: FindServerPathOptions): string | null {
  const candidate = options.configuredPath || "chute";
  if (options.isExecutable(candidate)) {
    return candidate;
  }
  return null;
}
