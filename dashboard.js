const email = localStorage.getItem("studentEmail");

if (!email) {
    window.location.href = "index.html";
}

document.getElementById("welcomeText").textContent = "Welcome, Student";

// Core subjects
const coreSubjects = [
    { name: "Tamil", teacher: "Mrs. Lakshmi" },
    { name: "English", teacher: "Mr. David" },
    { name: "Mathematics", teacher: "Mr. Kumar" },
    { name: "Science", teacher: "Mrs. Revathi" },
    { name: "Social Science", teacher: "Mr. Anand" }
];

// Skill subjects
const skillSubjects = [
    { name: "Web Development", duration: "3 Months" },
    { name: "Python Programming", duration: "2 Months" },
    { name: "Communication Skills", duration: "1 Month" }
];

const coreList = document.getElementById("coreSubjects");
const skillList = document.getElementById("skillSubjects");

coreSubjects.forEach(sub => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${sub.name}</strong><br>
                    <small>Teacher: ${sub.teacher}</small>`;
    coreList.appendChild(li);
});

skillSubjects.forEach(sub => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${sub.name}</strong><br>
                    <small>Duration: ${sub.duration}</small>`;
    skillList.appendChild(li);
});

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
