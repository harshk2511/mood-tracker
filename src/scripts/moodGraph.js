import { initializeApp } from "firebase/app";
import { getDatabase,
         ref,
         get,
         push,
         set
 } from "firebase/database";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

import '../styles/moodGraph.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

document.addEventListener("DOMContentLoaded", function() {
  const homeBtn = document.getElementById("home-btn")

  const moodToPoint = {
      "😍": 3,
      "😄": 2,
      "🙂": 1,
      "😌": 0,
      "😐": -1,
      "🙁": -2,
      "😔": -3,
      "😭": -4
  };

  // displaying mood legend before graph
  const legendDiv = document.getElementById("mood-legend");

  let legendHTML = "<h3>Mood Scale</h3><ul style='display: flex; list-style: none; padding: 0; gap: 20px; margin: 1rem 1rem 0 1rem'>";
  for (let mood in moodToPoint) {
    legendHTML += `<li>${mood}: ${moodToPoint[mood]}</li>`;
  }
  legendHTML += "</ul>";
  legendDiv.innerHTML = legendHTML;

  async function fetchUsers() {
    // fetch uid of user
    const usersRef = ref(database, "users")
    let uid = ""
    const usersSnapshot = await get(usersRef)
    if (usersSnapshot.exists()) {
        const users = usersSnapshot.val()
        for (let firebaseid in users) {
            if (users[firebaseid].username === localStorage.getItem("username")) {
                uid = users[firebaseid].uid
                break
            }
        }
    }

    // fetch only the mood emoji from user's moods
    const moodsRef = ref(database, `moods/${uid}`)
    const moodsSnapshot = await get(moodsRef)
    let moodAndTimestamp = []
    if (moodsSnapshot.exists()) {
        const moods = moodsSnapshot.val()
        for (let firebaseid in moods) {
            moodAndTimestamp.push({timestamp: moods[firebaseid].timestamp ,mood: moods[firebaseid].mood})
        }
    }

    // assigning points to moods
    const moodPointsByDate = {}
    moodAndTimestamp.forEach(entry => {
        const date = new Date(entry.timestamp)
        const dateKey = date.toISOString().split("T")[0]
        const point = moodToPoint[entry.mood] ?? 0

        if (!moodPointsByDate[dateKey]) {
            moodPointsByDate[dateKey] = []
        }

        moodPointsByDate[dateKey].push(point)
    })

    console.log(moodPointsByDate)

    // averaging points
    const dailyMoodPoints = []
    for (let date in moodPointsByDate) {
        const points = moodPointsByDate[date]
        const avgPoints = points.reduce((sum, p) => sum+p) / points.length

        dailyMoodPoints.push({date: date, point: avgPoints})
    }

    console.log(dailyMoodPoints)

    // filtering moods only for the current month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = January, 11 = December

    const thisMonthPoints = dailyMoodPoints.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === currentYear &&
        entryDate.getMonth() === currentMonth
      );
    });

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthDisplay = document.getElementById("month-display")
    monthDisplay.innerHTML = `A Look Inside ${months[currentMonth]} ${currentYear}`

    const ctx = document.getElementById('myChart');

    const labels = thisMonthPoints.map(entry => entry.date);
    const data = thisMonthPoints.map(entry => entry.point);

    const moodChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Average Mood",
          data: data,
          borderColor: "#F9A825",
          backgroundColor: "rgba(249, 168, 37, 0.2)",
          pointBackgroundColor: "#FFD54F",
          pointBorderColor: "#F9A825",
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#FFFFFF"
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Mood Score",
              color: "#FFFFFF"
            },
            ticks: {
              color: "#FFFFFF"
            }
          },
          x: {
            title: {
              display: true,
              text: "Date",
              color: "#FFFFFF"
            },
            ticks: {
              color: "#FFFFFF"
            }
          }
        }
      }
    });
  }

  fetchUsers()

  homeBtn.addEventListener("click", () => window.location.href = "userOptions.html")
})