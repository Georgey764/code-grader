from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import Group, GroupsMembership
from .serializers import GroupSerializer, GroupCreateSerializer, GroupMembershipSerializer, GroupMembershipCreateSerializer


class GroupModelViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.select_related("course").prefetch_related(
        "memberships__roster__student_profile__user"
    )
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GroupCreateSerializer
        return GroupSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get("course_id")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
        
class GroupsMemberShipModelViewSet(viewsets.ModelViewSet):
    queryset = GroupsMembership.objects.select_related("roster__student_profile__user", "group").all()
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        group = serializer.validated_data.get('group')
        if group.memberships.count() >= group.max_members:
            raise ValidationError({"error": f"This group is already full (Max {group.max_members} members)."})
            
        serializer.save()
        
    
    
    
