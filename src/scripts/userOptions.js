import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js"

import { getDatabase,
         ref,
         get
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js"

import { getAuth,
         onAuthStateChanged
        
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const userRef = ref(database, "users")

const auth = getAuth(app)
const userProfileBtn = document.getElementById("userprofile-btn")
const logMoodBtn = document.getElementById("log-mood-btn")
const pastMoodsBtn = document.getElementById("past-moods-btn")
const moodGraphBtn = document.getElementById("mood-graph-btn")

let username = ""

// Retrieving username of logged in user from realtime database

onAuthStateChanged(auth, function(user) {
    if (user) {
        get(userRef).then(function(snapshot) {
            if (snapshot.exists()) {
                const users = snapshot.val()
                for (let firebaseID in users) {
                    if (users[firebaseID].uid === user.uid) username = users[firebaseID].username
                }
            }
            else {
                console.log("No user found")
            }
        })
    } else {
        window.location.replace("index.html")
    }
})

window.addEventListener("DOMContentLoaded", () => {
    const greetingText = document.getElementById("greeting-text")
    const usernameFromLocalStorage = localStorage.getItem("username")

    if (usernameFromLocalStorage)
        greetingText.innerHTML = `Greetings, ${usernameFromLocalStorage}!`
    else
        greetingText.innerHTML = `Greetings !`
})

userProfileBtn.addEventListener("click", function() {
    window.location.href = "userProfile.html"
})

logMoodBtn.addEventListener("click", function() {
    window.location.href = "logMood.html"
})

pastMoodsBtn.addEventListener("click", function() {
    window.location.href = "displayMoods.html"
})

moodGraphBtn.addEventListener("click", function() {
    window.location.href = "moodGraph.html"
})