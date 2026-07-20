// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enum/enum';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the allowed roles from the decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined on the route, allow access by default
    if (!requiredRoles) {
      return true;
    }

    // 2. Extract the user from the request context
    const {agent} = context.switchToHttp().getRequest();
    
    // Check if user exists and has a role attached
    if (!agent || !agent.category) {
      throw new ForbiddenException('Access denied: User identity missing.');
    }

    // 3. Match user role against required roles
    const hasRole = requiredRoles.includes(agent.category);
    if (!hasRole) {
      throw new ForbiddenException('Access denied: Insufficient permissions.');
    }

    return true;
  }
}