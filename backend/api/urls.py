from django.urls import path
from . import views

urlpatterns = [
    path('endoai/chat/', views.endoai_chat, name='endoai-chat'),
    path('puffyai/chat/', views.puffyai_chat, name='puffyai-chat'),
]
