
export interface TypeDecoratorParams<T> {
    options: Partial<T>;
    returnTypeFunc?: Function;
}

export function getTypeDecoratorParams<T extends object>(
    returnTypeFuncOrOptions: Function | T | undefined,
    maybeOptions: T | undefined,
  ): TypeDecoratorParams<T> {
    if (typeof returnTypeFuncOrOptions === "function") {
      return {
        returnTypeFunc: returnTypeFuncOrOptions as Function,
        options: maybeOptions || {},
      };
    } else {
      return {
        options: returnTypeFuncOrOptions || {},
      };
    }
  }
  