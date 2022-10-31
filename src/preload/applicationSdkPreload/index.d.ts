interface Window {
  teamworkSDK: {
    store: {
      set(key: string, val: any): Promise<void>
      get<T>(key: string, defaultValue?: any): Promise<T>
      has(key: string): Promise<void>
      delete(key: string): Promise<void>
      clear(): Promise<void>
    }
    exec: {
      lookPath(name: string): Promise<string>
      run(
        cmd: string,
        options?: { env?: [key: string]; cwd?: string }
      ): Promise<{ exitCode: number; stderr?: string; stdout?: string }>
    }
    proxy: {
      isEnabled443(): Promise<boolean>
      enable443(): Promise<void>
      disable443(): Promise<void>
    }
  }
}
