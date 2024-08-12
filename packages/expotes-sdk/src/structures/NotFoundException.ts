/**
 * Defines an HTTP exception for *Not Found* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 * @publicApi
 */
export type NotFoundException =
  /**
   * Defines an HTTP exception for *Not Found* type errors.
   *
   * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
   * @publicApi
   */
  {
    cause: any;
    name: string;
    message: string;
    stack?: undefined | string;
  };
