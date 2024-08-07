import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';
// import { ApiCookieAuth } from '@nestjs/swagger';

import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublicAuth', true);

/**
 * 配置认证装饰器
 * @param options 配置对象，可选参数为 optional，表示是否为可选认证
 * @returns 返回一个装饰器函数，该函数会应用一系列装饰器，包括使用守卫和 API 鉴权
 */
export function Auth(options: { optional?: boolean } = {}) {
  // 定义一个装饰器数组，初始包含 AuthGuard 守卫装饰器
  const decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[] = [
    UseGuards(AuthGuard),
  ];
  // 如果配置了可选认证，则添加 OptionalAuth 装饰器
  if (options.optional) {
    decorators.push(Public());
  }
  // 返回一个高阶函数，该函数接受目标类、属性键和描述符作为参数
  return applyDecorators(...decorators);
  // return applyDecorators(...decorators, ApiCookieAuth('session'));
}
