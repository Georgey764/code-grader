from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Group, GroupsMembership
from .serializers import GroupSerializer, GroupsMembershipSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing groups.
    """

    queryset = Group.objects.all().prefetch_related(
        "memberships", "memberships__roster"
    )
    serializer_class = GroupSerializer

    def get_queryset(self):
        # Optional: Filter groups by course if passed in query params
        course_id = self.request.query_params.get("course_id")
        if course_id:
            return self.queryset.filter(course_id=course_id)
        return self.queryset


class GroupsMembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student memberships in groups.
    """

    queryset = GroupsMembership.objects.all().select_related("group", "roster")
    serializer_class = GroupsMembershipSerializer

    def create(self, request, *args, **kwargs):
        """
        Custom create to enforce the max_members limit.
        """
        group_id = request.data.get("group")
        try:
            group = Group.objects.get(pk=group_id)
        except Group.DoesNotExist:
            return Response(
                {"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Business Logic: Check if group is full
        if group.memberships.count() >= group.max_members:
            return Response(
                {
                    "error": f"This group has reached its limit of {group.max_members} members."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)
