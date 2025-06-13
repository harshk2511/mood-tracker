import { initializeApp } from "firebase/app";
import { getDatabase,
         ref,
         get,
         push,
         set
 } from "firebase/database";

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth"

import '../styles/styles.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)
const userRef = ref(database, "users")

const emailInput = document.getElementById("email-login")
const passwordInput = document.getElementById("password-login")
const loginBtn = document.getElementById("login-btn")
const signUpBtn = document.getElementById("signup-btn")
let username = ""

// need to include firebase authentication to check user's login status

onAuthStateChanged(auth, (user) => {
    if (user) { // user is logged in
        console.log(user.uid)

        get(userRef).then(function(snapshot) {
            if(snapshot.exists()) {
                const users = snapshot.val()
                for (let firebaseid in users) {
                    if (users[firebaseid].uid === user.uid) username = users[firebaseid].username
                    localStorage.setItem("username", username)
                    window.location.replace("userOptions.html")
                    break
                }
            }
        })
    }
    else {
        console.log("User is not logged in. Log in user")
    }
})

// logging in user

async function logInFirebaseUser() {

    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).then((userCredential) => {
        console.log(userCredential)
        const user = userCredential.user

        window.location.href = "userOptions.html"
    })
    .catch((error) => {
        if (error.code === "auth/invalid-credential") alert("Invalid credentials. Please enter valid credentials")
        emailInput.value = ""
        passwordInput.value = ""
    })

}

loginBtn.addEventListener("click", function() {
    logInFirebaseUser()
})

signUpBtn.addEventListener("click", function() {
    window.location.href = "createUser.html"
})