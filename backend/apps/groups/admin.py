from django.contrib import admin
from apps.groups.models import Group, GroupsMembership

# Register your models here.
admin.site.register(Group)
admin.site.register(GroupsMembership)
