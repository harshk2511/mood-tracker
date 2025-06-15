import { initializeApp } from "firebase/app";
import { getDatabase,
         ref,
         get,
         push,
         set
 } from "firebase/database";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

import '../styles/logMood.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const userRef = ref(database, "users")

document.addEventListener('DOMContentLoaded', function() {
  const allEmojis = document.querySelectorAll("#emojis p")
  const emojiDesc = document.getElementById("emoji-description")
  const moodDesc = document.getElementById("mood-description")
  const speakMindBtn = document.getElementById("speak-your-mind-btn")
  const reflectBtn = document.getElementById("help-me-reflect-btn")
  const reflectPrompt = document.getElementById("reflect-prompt")
  const submitBtn = document.getElementById("submit-btn")
  const homeBtn = document.getElementById("home-btn")
  let selectedEmoji = ""

  let reflectPromptFlag = false

  const emojidescriptions = {
      "😍": "You’re energized and ready to take on what’s next.",
      "😄": "You’re feeling light, cheerful, and in a good place.",
      "🙂": "You’re feeling fine — steady and at ease.",
      "😌": "You’re relaxed and mentally at rest.",
      "😐": "You’re not feeling much — just going with the flow.",
      "🙁": "You’re a bit let down or not quite okay.",
      "😔": "You’re low on energy — emotionally or mentally.",
      "😭": "You’re feeling heavy — it’s a lot right now."
  }

  const reflectionPrompts = {
    "😍": [
      "What’s something that made your heart feel full today?",
      "Describe a moment that made you feel truly alive.",
      "What excites you most about what’s ahead?",
      "What makes you feel deeply connected to yourself?",
      "What brought you joy that you didn’t expect?"
    ],
    "😄": [
      "What made you laugh or smile recently?",
      "How does your body feel when you’re in a good mood?",
      "Who or what brightened your day today?",
      "What’s a simple pleasure you’re grateful for?",
      "Describe a small win that made you feel good."
    ],
    "🙂": [
      "What’s going well for you right now?",
      "What’s something you’re quietly content with?",
      "Is there anything you’ve come to accept lately?",
      "How do you know when you’re doing okay?",
      "What helps you stay grounded in normal moments?"
    ],
    "😌": [
      "What helped you feel calm today?",
      "What’s been making you feel at ease recently?",
      "Describe a moment today that felt peaceful.",
      "When do you feel most like yourself?",
      "What helps you unwind when things get busy?"
    ],
    "😐": [
      "Is there anything you’re feeling indifferent about?",
      "What’s been draining your energy lately?",
      "Do you feel like you’re stuck in a loop?",
      "What do you need right now to feel more engaged?",
      "Describe a moment that felt like just going through the motions."
    ],
    "🙁": [
      "What’s been weighing on you recently?",
      "Is there a thought or situation you keep coming back to?",
      "How do you usually respond when you're feeling low?",
      "What would feel comforting right now?",
      "What's one small step you could take to shift this feeling?"
    ],
    "😔": [
      "What’s something that’s been hard to put into words?",
      "Have you been holding something in lately?",
      "What do you wish someone would ask you right now?",
      "When do you usually notice this kind of heaviness?",
      "What helps you process feelings when they linger?"
    ],
    "😭": [
      "What’s been overwhelming you lately?",
      "What’s something you need to let out or express?",
      "What are you tired of carrying alone?",
      "Is there a space where you feel safe letting go?",
      "What would feel like relief right now?"
    ]
  };


  allEmojis.forEach((emoji) => {
      emoji.addEventListener("click", () => {

          // for clicking animation, we are adding a "selected" class upon click
          allEmojis.forEach(e => e.classList.remove("selected")) // To avoid multiple selections
          emoji.classList.add("selected")

          // replace emojiDesc with a description instead of default "how are you doing ?"
          emojiDesc.innerHTML = `${emojidescriptions[emoji.textContent]}`
          selectedEmoji = emoji.textContent
      })
      emoji.addEventListener("dblclick", () => {
          emoji.classList.remove("selected")
          emojiDesc.innerHTML = `How are you feeling ?`
          reflectPrompt.style.display = "none"
          selectedEmoji = ""
      })
  })

  speakMindBtn.addEventListener("click", function() {
      moodDesc.style.display = "block"
      submitBtn.style.display = "block"

      if (reflectPromptFlag === true) {
        reflectPrompt.style.display = "none"
        reflectPromptFlag = false
      }
  })

  let lastDisplayedQuoteIndex = 0
  reflectBtn.addEventListener("click", function() {
      reflectPromptFlag = true
      moodDesc.style.display = "block"
      submitBtn.style.display = "block"
      reflectPrompt.style.display = "block"
      if(!selectedEmoji) {
          reflectPrompt.innerHTML = `Almost there! Pick your mood above, then tap this button again to get your thoughtful prompt.`
          return
      }

      const moodBasedPrompts = reflectionPrompts[selectedEmoji];
      let randomQuoteIndex = 0
      if (moodBasedPrompts.length > 1)
      do {
              randomQuoteIndex = Math.floor(Math.random() * moodBasedPrompts.length);
          } while (randomQuoteIndex === lastDisplayedQuoteIndex);
      
      lastDisplayedQuoteIndex = randomQuoteIndex
      reflectPrompt.innerHTML = `${moodBasedPrompts[randomQuoteIndex]}`

      // const randomQuote = Math.floor(Math.random(5)) + 1

  })

  // Sending to firebase

  submitBtn.addEventListener("click", async function() {

      if (selectedEmoji === "") {
        reflectPrompt.innerHTML = "Please select a mood before submitting!";
        reflectPrompt.style.display = "block"; // Optional: ensure it's visible
        return;
      }

      if (moodDesc.value === "") {
        reflectPrompt.innerHTML = "Want to share a bit more? Write something about your mood.";
        reflectPrompt.style.display = "block"; // Optional: ensure it's visible
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
      
      const newMoodEntry = {
          uid: uid,
          mood: selectedEmoji,
          moodDesc: moodDesc.value,
          timestamp: new Date().toISOString()
      }

      const userMoodRef = ref(database, `moods/${uid}`) // Reference to the user's moods
      const newMoodRef = push(userMoodRef) // push() creates a new reference with a unique key 
      await set(newMoodRef, newMoodEntry) // set() writes data to the reference
      console.log("Data saved!")

      moodDesc.value = ""
      allEmojis.forEach((emoji) => {
          emoji.classList.remove("selected")
          selectedEmoji = ""
      })
      emojiDesc.innerHTML = `How are you feeling ?`
      reflectPrompt.style.display = "none"


  })

  homeBtn.addEventListener("click", function() {
      window.location.href = "userOptions.html"
  })
})