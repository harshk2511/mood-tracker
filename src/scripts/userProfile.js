import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js"

import { getDatabase,
         ref,
         get
 } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js"

import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js"

import '../styles/userProfile.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const userRef = ref(database, "users")
const auth = getAuth(app)

const usernameDisplay = document.getElementById("username")
const emailDisplay = document.getElementById("email")
const homeBtn = document.getElementById("home-btn")
const signOutBtn = document.getElementById("sign-out-btn")

const username = localStorage.getItem("username")

// fetch username and email from realtime database

get(userRef).then(function(snapshot) {
    if (snapshot.exists()) {
        const users = snapshot.val()

        for (let firebaseid in users) {
            if (users[firebaseid].username === username) {
                usernameDisplay.innerHTML = 
                `Username: ${users[firebaseid].username}`
                emailDisplay.innerHTML = 
                `Email: ${users[firebaseid].email}`
            }
        }
    }
    else {
        console.log("No such user exists")
    }
})

homeBtn.addEventListener("click", function() {
    console.log("home btn clicked")
    window.location.href = "userOptions.html"
})

signOutBtn.addEventListener("click", function() {
    auth.signOut().then(() => {console.log("User is logged out")})
    window.location.replace("index.html")
})