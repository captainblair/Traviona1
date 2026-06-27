from rest_framework import permissions


def has_role(user, roles):
    return bool(user and user.is_authenticated and (user.is_staff or user.role in roles))


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, ['admin'])


class IsRecruiterRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, ['recruiter', 'admin'])


class IsContentEditorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, ['content_editor', 'admin'])
