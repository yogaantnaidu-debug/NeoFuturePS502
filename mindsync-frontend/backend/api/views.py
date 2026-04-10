from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Health

@api_view(['POST'])
def add_water(request):
    water = request.data.get('water')
    Health.objects.create(water=water)
    return Response({"message": "Saved"})

@api_view(['GET'])
def get_water(request):
    data = Health.objects.all().values()
    return Response(data)

@api_view(['POST'])
def chat(request):
    msg = request.data.get('message', '').lower()

    if "tired" in msg:
        reply = "Take rest and drink water."
    elif "study" in msg:
        reply = "Try 25 min focus + 5 min break."
    else:
        reply = "I am your assistant 😊"

    return Response({"reply": reply})