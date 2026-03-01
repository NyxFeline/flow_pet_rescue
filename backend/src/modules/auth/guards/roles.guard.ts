import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    // Viết constructor để inject Reflector
    constructor (private reflector: Reflector) {}

    // Implement phương thức canActivate để kiểm tra quyền truy cập
    canActivate(context: ExecutionContext): boolean {
        // Lấy các vai trò yêu cầu từ metadata
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu không có vai trò yêu cầu nào, cho phép truy cập
        if (!requiredRoles) {
            return true;
        }

        // Lấy thông tin người dùng từ request
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Nếu người dùng không có thông tin hoặc không có vai trò, từ chối truy cập
        if (!user || !user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException("You do not have permission to access this resource.");
        }

        return true;
    }
}