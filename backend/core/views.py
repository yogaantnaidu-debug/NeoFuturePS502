from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Task
from .models import Chat
from .ai import health_ai
from .models import Profile

def signup(request):
    print("SIGNUP VIEW CALLED")  # DEBUG
    if request.method == 'POST':
        print("Post received")  # DEBUG
        username = request.POST['username']
        password = request.POST['password']

        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {'error': 'User already exists'})

        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return redirect('/dashboard/')

    return render(request, 'signup.html')


def login_page(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('/dashboard/')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')


@login_required(login_url='/')
def dashboard(request):
    tasks = Task.objects.filter(user=request.user)
    chats = Chat.objects.filter(user=request.user)

    return render(request, 'dashboard.html', {
        'tasks': tasks,
        'chats': chats
    })


@login_required(login_url='/')
def delete_task(request, id):
    task = Task.objects.get(id=id, user=request.user)
    task.delete()
    return redirect('/dashboard/')


@login_required(login_url='/')
def toggle_task(request, id):
    task = Task.objects.get(id=id, user=request.user)
    task.is_completed = not task.is_completed
    task.save()
    return redirect('/dashboard/')

@login_required(login_url='/')
def chat(request):

    if request.method == 'POST':
        message = request.POST['message']

        # get last 5 chats (memory)
        history = Chat.objects.filter(user=request.user).order_by('-created_at')[:5]
        history = reversed(history)
        profile, _ = Profile.objects.get_or_create(user=request.user)

        response = health_ai(message, history, profile)

        Chat.objects.create(
            user=request.user,
            message=message,
            response=response
        )

    chats = Chat.objects.filter(user=request.user)
    return render(request, 'chat.html', {'chats': chats})

def logout_user(request):
    logout(request)
    return redirect('/')