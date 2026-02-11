from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.groups.models import Group, GroupMembership
from apps.groups.serializers import GroupSerializer, GroupsMembershipSerializer

from apps.core.permissions import Is_Faculty, Is_Student

#groups view
class GroupListCreateView(generics.ListCreateAPIView):
    
    queryset = Group.objects.select_related('course').all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, Is_Faculty]
    
class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Group.objects.select_related('course').all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
#membership view
class MembershipListCreateView(generics.ListCreateAPIView):
    
    queryset = GroupMembership.objects.select_related('group', 'student').all()
    serializer_class = GroupsMembershipSerializer
    permission_classes = [IsAuthenticated]
    
class MembershipDetailView(generics.RetrieveDestroyAPIView):
    queryset = GroupMembership.objects.select_related('group', 'student').all()
    serializer_class = GroupsMembershipSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"