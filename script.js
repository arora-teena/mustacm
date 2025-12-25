/*********************************
 FIREBASE CONFIG (REAL ONE)
**********************************/
const firebaseConfig = {
  apiKey: "AIzaSyBYhdKTsMsrtklQzPVUYLQ44nmiX8ndeMc",
  authDomain: "acm-portal-d31c4.firebaseapp.com",
  projectId: "acm-portal-d31c4",
  storageBucket: "acm-portal-d31c4.firebasestorage.app",
  messagingSenderId: "159966455506",
  appId: "1:159966455506:web:85564c9d9784405cc32f0b"
};

// Initialize Firebase (prevent double init)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

/*********************************
 LOGIN FUNCTION
**********************************/
function login() {
  const userId = document.getElementById("userid").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  if (!userId || !password) {
    errorEl.innerText = "Please enter User ID and Password";
    return;
  }

  // Internal email pattern
  const email = `${userId}@acmw.must`;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch((err) => {
      console.error("Login error:", err.code, err.message);

      // User-friendly messages
      if (err.code === "auth/user-not-found") {
        errorEl.innerText = "User not found. Contact admin.";
      } else if (err.code === "auth/wrong-password") {
        errorEl.innerText = "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        errorEl.innerText = "Invalid User ID format.";
      } else {
        errorEl.innerText = "Login failed. Try again.";
      }
    });
}

/*********************************
 AUTH GUARD (PAGE PROTECTION)
**********************************/
function checkLogin() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "index.html";
    }
  });
}

/*********************************
 LOGOUT
**********************************/
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

/*********************************
 MEMBER COUNT (LANDING PAGE)
**********************************/
if (document.getElementById("memberCount")) {
  db.collection("members").onSnapshot((snapshot) => {
    document.getElementById("memberCount").innerText = snapshot.size;
  });
}

/*********************************
 DASHBOARD DATA
**********************************/
function loadMemberInfo() {
  auth.onAuthStateChanged((user) => {
    if (!user) return;

    document.getElementById("showUserId").innerText =
      user.email.split("@")[0];

    db.collection("members")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("showMembershipId").innerText =
            data.membershipId || "Not Assigned";
          document.getElementById("showName").innerText =
            data.name || "Not Available";
        }
      });
  });
}


/*********************************
 MEMBERSHIP CARD PAGE
**********************************/
function loadMemberCard() {
  auth.onAuthStateChanged((user) => {
    if (!user) return;

    document.getElementById("cardUserId").innerText =
      user.email.split("@")[0];

    db.collection("members")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("cardMembershipId").innerText =
            data.membershipId || "Not Assigned";
          document.getElementById("cardName").innerText =
            data.name || "Not Available";
        }
      });
  });
}


/*********************************
 DOWNLOAD MEMBERSHIP CARD
**********************************/
function downloadCardImage() {
  const card = document.querySelector(".membership-card");

  html2canvas(card, { scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "ACMW_Membership_Card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function downloadCardPDF() {
  const { jsPDF } = window.jspdf;
  const card = document.querySelector(".membership-card");

  html2canvas(card, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0);
    pdf.save("ACMW_Membership_Card.pdf");
  });
}
