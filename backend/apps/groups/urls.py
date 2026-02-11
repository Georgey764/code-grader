from django.urls import path
from .views import GroupListCreateView, GroupDetailView, MembershipListCreateView, MembershipDetailView

urlpatterns = [
    #groups
    path("", GroupListCreateView.as_view(), name="group-list-create"),
    path("<int:id>/", GroupDetailView.as_view(), name="group-detail"),
    
    #memberships
    path("memberships/", MembershipListCreateView.as_view(), name="membership-list-create"),
    path("memberships/<int:id>/", MembershipDetailView.as_view(), name="membership-detail"),
]   