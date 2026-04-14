from django.urls import path
from . import views
from .auth import google_login

urlpatterns = [
    path('auth/google/', google_login, name='google-login'),
    path('endoai/chat/', views.endoai_chat, name='endoai-chat'),
    path('puffyai/chat/', views.puffyai_chat, name='puffyai-chat'),
    path('nerdai/chat/', views.nerdai_chat, name='nerdai-chat'),
]
