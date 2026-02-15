from django.urls import path
from .views import GroupModelViewSet, GroupsMemberShipModelViewSet

app_name = 'groups'

urlpatterns = [
    
    #url for group
    path("", GroupModelViewSet.as_view({"get": "list", "post": "create"}), name="group-list"),
    path("<uuid:pk>/", GroupModelViewSet.as_view({"get":"retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="group-detail"),
    
    
    #url for group membership
    path("memberships/", GroupsMemberShipModelViewSet.as_view({"get": "list", "post": "create"}), name="membership-list"),
    path("memberships/<uuid:pk>/", GroupsMemberShipModelViewSet.as_view({"get":"retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="membership-detail"),
]