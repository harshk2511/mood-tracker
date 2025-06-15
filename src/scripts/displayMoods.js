import { initializeApp } from "firebase/app";
import { getDatabase,
         ref,
         get,
         push,
         set
 } from "firebase/database";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

import '../styles/displayMoods.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const userRef = ref(database, "users")


window.addEventListener("DOMContentLoaded", async function() {
    const pastMoodsDiv = document.getElementById("past-moods-div")
    const homeBtn = document.getElementById("home-btn")

    if (!pastMoodsDiv) {
        console.error("Element with id 'past-moods-div' not found.");
        return;
    }

    let uid = ""
    // Find uid of user from usersRef utilizing the username from localStorage
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
        const users = snapshot.val()
        for (let firebaseid in users) {
            if (users[firebaseid].username === localStorage.getItem("username")) {
                uid = users[firebaseid].uid
                break
            }
        }   
    }

    // fetch moods logged under the uid
    const moodRef = ref(database, `moods/${uid}`)
    const moodSnapshot = await get(moodRef)
    if (moodSnapshot.exists()) {
        const moods = moodSnapshot.val()
        for (let firebaseid in moods) {
            const timestamp = new Date(moods[firebaseid].timestamp)
            pastMoodsDiv.innerHTML += `<div>
                <span id="timestamp">${timestamp.toLocaleString()}: </span>
                <span id="mood-desc">${moods[firebaseid].mood} ${moods[firebaseid].moodDesc}</span>
            </div>`
            // console.log(`timestamp: ${timestamp.toLocaleString()}, mood: ${moods[firebaseid].mood}, mood desc: ${moods[firebaseid].moodDesc}`)
        }
    }

    homeBtn.addEventListener("click", () => {window.location.href = "userOptions.html"})
})


