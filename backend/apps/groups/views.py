from rest_framework import viewsets
from .models import Group, GroupsMembership
from .serializers import GroupSerializer, GroupsMembershipSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class GroupsMembershipViewSet(viewsets.ModelViewSet):
    queryset = GroupsMembership.objects.all()
    serializer_class = GroupsMembershipSerializer
