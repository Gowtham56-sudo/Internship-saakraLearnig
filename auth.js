const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Login
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email === "student@gmail.com" && password === "123456") {
            localStorage.setItem("studentEmail", email);
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid login details");
        }
    });
}

// Register
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Registration successful. Please login.");
        window.location.href = "index.html";
    });
}

