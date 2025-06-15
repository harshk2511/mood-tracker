import { initializeApp } from "firebase/app";
import { getDatabase,
         ref,
         get,
         push,
         set
 } from "firebase/database";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

import '../styles/createUser.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const userRef = ref(database, "users")

const auth = getAuth(app)

const usernameInput = document.getElementById("username-login")
const emailInput = document.getElementById("email-login")
const passwordInput = document.getElementById("password-login")
const signUpBtn = document.getElementById("signup-btn")

// Write code for creating new user

async function createFirebaseUser() {

    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value).then(await function(userCredential) {
        console.log(userCredential)
        const user = userCredential.user

        // storing the username in the firebase realtime database (can also store in localStorage)
        set(ref(database, `users/${user.uid}`), {
            uid: user.uid,
            username: usernameInput.value,
            email: emailInput.value
        })

        localStorage.setItem("username", usernameInput.value)

        window.location.replace("userOptions.html")

    })
    .catch((error) => {
        if(error.code === "auth/email-already-in-use") {
            alert("You are already a registered user. Please login using your credentials")
            window.location.href = "index.html"
        }
        else {
            alert(error.message)
        }
    })

}

signUpBtn.addEventListener("click", async function() {

    await createFirebaseUser()

})
