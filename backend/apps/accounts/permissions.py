from rest_framework.permissions import BasePermission


class Is_Profile_Owner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user == obj.user)
