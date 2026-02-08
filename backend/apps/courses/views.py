# apps/courses/views.py
from rest_framework import viewsets
from .models import Course, Roster, Group, GroupsMembership
from .serializers import CourseSerializer, RosterSerializer, GroupSerializer, GroupsMembershipSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class RosterViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.all()
    serializer_class = RosterSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class GroupsMembershipViewSet(viewsets.ModelViewSet):
    queryset = GroupsMembership.objects.all()
    serializer_class = GroupsMembershipSerializer
