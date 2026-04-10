document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert('Login functionality would be implemented here!');
    }
});

document.getElementById('forgotPassword').addEventListener('click', function (e) {
    
    alert('Forgot Password functionality would be implemented here!');
});

document.getElementById('signUp').addEventListener('click', function (e) {
    
    alert('Sign Up functionality would be implemented here!');
});
document.addEventListener("DOMContentLoaded", function () {

    const chatBtn = document.getElementById("chat-button");
    const chatBox = document.getElementById("chat-box");
    const closeBtn = document.getElementById("close-chat");

    chatBtn.onclick = () => {
        chatBox.classList.add("active");
    };

    closeBtn.onclick = () => {
        chatBox.classList.remove("active");
    };

    // Auto scroll to latest
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

});