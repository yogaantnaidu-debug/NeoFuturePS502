from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_page),
    path('signup/', views.signup),
    path('dashboard/', views.dashboard),
    path('logout/', views.logout_user),
    path('delete/<int:id>/', views.delete_task),
    path('toggle/<int:id>/', views.toggle_task),
    path('chat/', views.chat),
]