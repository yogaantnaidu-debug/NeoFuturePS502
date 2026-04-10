from django.urls import path
from .views import add_water, get_water, chat

urlpatterns = [
    path('add/', add_water),
    path('get/', get_water),
    path('chat/', chat),
]