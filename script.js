// SOS Button
let emergencyLatitude;
let emergencyLongitude;
const sosButton = document.getElementById("sosButton");
const statusText = document.getElementById("status");

sosButton.addEventListener("click", function () {

    statusText.innerText =
        "🚨 Emergency mode activated!";

    const panel =
        document.getElementById("emergencyPanel");

    panel.style.display = "block";

    document.getElementById("emergencyMessage").innerText =
        "📍 Getting your location...";

    

    getEmergencyLocation();
});

function getEmergencyLocation() {

    const emergencyMessage =
        document.getElementById("emergencyMessage");

    if (!navigator.geolocation) {
        emergencyMessage.innerText =
            "❌ GPS is not supported by this browser.";
        return;
    }

    emergencyMessage.innerText =
        "📍 Getting your location...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            emergencyLatitude = latitude;
            emergencyLongitude = longitude;
            alert("Location मिली!\nLat: " + latitude + "\nLng: " + longitude);

            const mapsURL =
                "https://www.google.com/maps?q=" +
                latitude + "," + longitude;

            emergencyMessage.innerText =
                "✅ Location detected successfully!\n" +
                "Lat: " + latitude.toFixed(6) +
                "\nLng: " + longitude.toFixed(6);

            const mapLink =
                document.getElementById("emergencyMapLink");

            if (mapLink) {
                mapLink.href = mapsURL;
                mapLink.style.display = "inline-block";
            }

            console.log("SOS Location:", latitude, longitude);

            showEmergencyContacts(mapsURL);

            if (typeof showSelectedEmergencyOptions === "function") {
                showSelectedEmergencyOptions();
            }
        },

        function (error) {

            console.log("Location Error:", error);

            if (error.code === 1) {
                emergencyMessage.innerText =
                    "❌ Location permission denied. Please allow location in Chrome.";
            }
            else if (error.code === 2) {
                emergencyMessage.innerText =
                    "❌ Location unavailable. Check your device location.";
            }
            else if (error.code === 3) {
                emergencyMessage.innerText =
                    "⏳ Location request timed out. Please try SOS again.";
            }
            else {
                emergencyMessage.innerText =
                    "❌ Unable to get your location.";
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 30000 ,
            maximumAge: 10000
        }
    );
}


// Location
const locationButton =
    document.getElementById("locationButton");

const locationText =
    document.getElementById("location");

const mapLink =
    document.getElementById("mapLink");


locationButton.addEventListener("click", function () {

    if (!navigator.geolocation) {

        locationText.innerText =
            "Location is not supported.";

        return;
    }

    locationText.innerText =
        "Getting location...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            // Show coordinates
            locationText.innerText =
                "Lat: " + latitude.toFixed(6) +
                "\nLng: " + longitude.toFixed(6);


            // Create Google Maps link
            const googleMapsURL =
                "https://www.google.com/maps?q=" +
                latitude + "," + longitude;


            mapLink.href = googleMapsURL;

            mapLink.style.display = "inline-block";

        },

        function (error) {

            locationText.innerText =
                "Unable to get location.";

            console.log(error);

        },
        {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 10000
}


    );

});


// Emergency Contact
let contacts = JSON.parse(
    localStorage.getItem("emergencyContacts")
) || [];

function addContact() {

    const name = document
        .getElementById("contactName")
        .value
        .trim();

    const number = document
        .getElementById("contactNumber")
        .value
        .trim();

    if (!name || !number) {
        alert("Please enter name and phone number.");
        return;
    }

    contacts.push({
        name: name,
        number: number
    });

    localStorage.setItem(
        "emergencyContacts",
        JSON.stringify(contacts)
    );

    document.getElementById("contactName").value = "";
    document.getElementById("contactNumber").value = "";

    displayContacts();
}

function displayContacts() {

    const list = document.getElementById("contactList");

    list.innerHTML = "";

    contacts.forEach(function(contact, index) {

        const div = document.createElement("div");

        div.className = "contact";

       div.innerHTML = `
    <p>👤 <b>${contact.name}</b></p>
    <p>📞 ${contact.number}</p>

    <a href="tel:${contact.number}" class="call-button">
        📞 Call
    </a>

    <button onclick="deleteContact(${index})">
        Delete
    </button>
`;

        list.appendChild(div);
    });
}

function deleteContact(index) {

    contacts.splice(index, 1);

    localStorage.setItem(
        "emergencyContacts",
        JSON.stringify(contacts)
    );

    displayContacts();
}

displayContacts();


// Voice Feature
let mediaRecorder;
let audioChunks = [];
let recordedAudioBlob = null;
let isRecording = false;

const voiceButton =
    document.getElementById("voiceButton");

voiceButton.addEventListener("click", async function () {

    // STOP RECORDING
    if (isRecording) {

        mediaRecorder.stop();

        isRecording = false;

        voiceButton.innerText =
            "🎤 Start Listening";

        return;
    }

    // START RECORDING
    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        alert("❌ Audio recording is not supported.");
        return;
    }

    try {

       const stream =
    await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    });

        audioChunks = [];
        recordedAudioBlob = null;

        mediaRecorder =
            new MediaRecorder(stream);

        mediaRecorder.ondataavailable =
            function (event) {

                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

       mediaRecorder.onstop =
    function () {

        recordedAudioBlob =
            new Blob(audioChunks, {
                type: "audio/webm"
            });

        stream.getTracks().forEach(
            track => track.stop()
        );

        // Create audio player
        const audioURL =
            URL.createObjectURL(recordedAudioBlob);

        let audioPlayer =
            document.getElementById("recordedAudio");

        if (!audioPlayer) {

            audioPlayer =
                document.createElement("audio");

            audioPlayer.id =
                "recordedAudio";

            audioPlayer.controls = true;

            audioPlayer.style.display =
                "block";

            audioPlayer.style.marginTop =
                "10px";

            voiceButton.parentNode.appendChild(
                audioPlayer
            );
        }

        audioPlayer.src = audioURL;

        alert("✅ Voice recording saved. You can play it now.");
//         const audioDownload =
//     document.createElement("a");

// audioDownload.href =
//     URL.createObjectURL(recordedAudioBlob);

// audioDownload.download =
//     "emergency-voice.webm";

// audioDownload.innerText =
//     "⬇️ Save Voice Recording";

// audioDownload.style.display =
//     "inline-block";

// voiceButton.parentNode.appendChild(
//     audioDownload
// );
    };

        mediaRecorder.start();

        isRecording = true;

        voiceButton.innerText =
            "⏹️ Stop Recording";

   } catch (error) {

    console.log("Microphone Error:", error);

    alert(
        "Microphone Error:\n" +
        error.name + "\n" +
        error.message
    );
}
});
// share ==========================
async function shareEmergencyAudio() {

    if (!recordedAudioBlob) {
        alert("❌ No voice recording available.");
        return;
    }

    const audioFile =
        new File(
            [recordedAudioBlob],
            "emergency-voice.webm",
            {
                type: "audio/webm"
            }
        );

    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
            files: [audioFile]
        })
    ) {

        try {

            await navigator.share({
                title: "🚨 Emergency Voice Recording",
                text: "🚨 Emergency voice recording",
                files: [audioFile]
            });

        } catch (error) {

            console.log(
                "Audio share cancelled:",
                error
            );
        }

    } else {

        alert(
            "⚠️ This browser/device does not support direct audio sharing."
        );
    }
}

// share button ====================================
const shareButton =
    document.createElement("button");

shareButton.innerText =
    "📤 Share Voice Recording";

shareButton.onclick =
    shareEmergencyAudio;

voiceButton.parentNode.appendChild(
    shareButton
);


function showEmergencyContacts(mapsURL) {

    const container =
        document.getElementById("emergencyContacts");

    if (!container) return;

    container.innerHTML = "";

    const preferences =
        JSON.parse(
            localStorage.getItem("emergencyPreferences")
        ) || {};

    const heading = document.createElement("h4");
    heading.innerText = "📞 Emergency Contact Options";
    container.appendChild(heading);

    // Favorite contacts
    // if (preferences.favorite && contacts.length > 0) {

    //     contacts.forEach(function (contact) {

    //         const card = document.createElement("div");
    //         card.className = "emergency-option";

    //         card.innerHTML = `
    //             <strong>❤️ ${contact.name}</strong>
    //             <br>
    //             <a href="tel:${contact.number}">
    //                 📞 Call
    //             </a>
                
    //             <br>
    //             <a href="${mapsURL}" target="_blank">
    //                 📍 View My Location
    //             </a>
    //         `;

    //         container.appendChild(card);
    //     });
    // }
    if (preferences.favorite && contacts.length > 0) {

    contacts.forEach(function (contact) {

        const card = document.createElement("div");
        card.className = "emergency-option";

        card.innerHTML = `
            <strong>❤️ ${contact.name}</strong>
            <br>
            <a href="tel:${contact.number}">
                📞 Call
            </a>
            <br>
            <a href="${mapsURL}" target="_blank">
                📍 View My Location
            </a>
        `;

        container.appendChild(card);
    });
}

    // Police
    if (preferences.police) {

        const card = document.createElement("div");
        card.className = "emergency-option";

        card.innerHTML = `
            <strong>👮 Police</strong>
            <br>
            <a href="tel:112">
                📞 Call 112
            </a>
            <br>
            <a href="${mapsURL}" target="_blank">
                📍 View My Location
            </a>
        `;

        container.appendChild(card);
    }

    // Ambulance
    if (preferences.ambulance) {

        const card = document.createElement("div");
        card.className = "emergency-option";

        card.innerHTML = `
            <strong>🚑 Ambulance</strong>
            <br>
            <a href="tel:108">
                📞 Call 108
            </a>
            <br>
            <a href="${mapsURL}" target="_blank">
                📍 View My Location
            </a>
        `;

        container.appendChild(card);
    }

    // Fire Service
    if (preferences.fire) {

        const card = document.createElement("div");
        card.className = "emergency-option";

        card.innerHTML = `
            <strong>🚒 Fire Service</strong>
            <br>
            <a href="tel:101">
                📞 Call 101
            </a>
            <br>
            <a href="${mapsURL}" target="_blank">
                📍 View My Location
            </a>
        `;

        container.appendChild(card);
    }

    // Nothing selected
    if (container.children.length === 1) {

        const message = document.createElement("p");

        message.innerText =
            "⚠️ No emergency option selected.";

        container.appendChild(message);
    }
}

// ===============================
// LOGIN & REGISTER SYSTEM
// ===============================

function showRegister() {

    document.getElementById("loginForm").style.display =
        "none";

    document.getElementById("registerForm").style.display =
        "block";

    document.getElementById("authMessage").innerText = "";
}


function showLogin() {

    document.getElementById("registerForm").style.display =
        "none";

    document.getElementById("loginForm").style.display =
        "block";

    document.getElementById("authMessage").innerText = "";
}

// js se register api ko call karna -----------------------------------------------------
async function registerUser() {

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message =
        document.getElementById("authMessage");


    if (!name || !email || !password || !confirmPassword) {

        message.innerText =
            "Please fill all fields.";

        return;
    }


    if (password !== confirmPassword) {

        message.innerText =
            "Passwords do not match.";

        return;
    }


    try {

        const response = await fetch(
            "http://192.168.137.1:5000/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (data.success) {

            message.innerText =
                "✅ Registration sent to Python backend!";

            console.log(
                "Backend response:",
                data
            );

        } else {

            message.innerText =
                "❌ " + data.message;
        }


    } catch (error) {

        console.error(error);

        message.innerText =
            "❌ Python backend is not connected.";
    }
}

// api se login karna ---------------------------======================
async function loginUser() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("authMessage");

    if (!email || !password) {
        message.innerText = "Please enter email and password.";
        return;
    }

    try {

        const response = await fetch(
            "http://192.168.137.1:5000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userEmail", data.email);

            message.innerText = "✅ Login successful!";

            console.log("Login response:", data);

            setTimeout(() => {
                location.reload();
            }, 500);

        } else {

            message.innerText = "❌ " + data.message;
        }

   } catch (error) {

    console.error("Login error:", error);

    message.innerText =
        "❌ Login error: " + error.message;
}
}


function showDashboard() {

    const authPage = document.getElementById("authPage");
    const dashboard = document.querySelector(".container");

    authPage.style.setProperty("display", "none", "important");
    dashboard.style.setProperty("display", "block", "important");
}


// Check login when page loads

window.addEventListener("load", function () {

    const authPage = document.getElementById("authPage");
    const dashboard = document.querySelector(".container");

    const loggedIn = localStorage.getItem("isLoggedIn");

    if (loggedIn === "true") {

        showDashboard();

    } else {

        authPage.style.setProperty("display", "flex", "important");
        dashboard.style.setProperty("display", "none", "important");
    }
});


// ===============================
// PYTHON BACKEND CONNECTION
// ===============================

// ===============================
// PYTHON BACKEND CONNECTION
// ===============================

async function checkBackend() {
    try {

        const response = await fetch(
            "http://192.168.137.1:5000/api/status"
        );

        const data = await response.json();

        console.log("Python Backend:", data);

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );
    }
}

checkBackend();
// --------------------------------------------------------------------------------------------------
// logout button ke liye =============
function logoutUser() {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    location.reload();
}

// ==========================================================================================
// wellcome ke liye   hai

function showUserName() {

    const userName =
        localStorage.getItem("userName");

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    if (userName && welcomeMessage) {

        welcomeMessage.innerText =
            "Welcome, " + userName + " 👋";
    }
}

showUserName();

// user profile card ke liya ================================================================

function showProfile() {

    const userName =
        localStorage.getItem("userName");

    const userEmail =
        localStorage.getItem("userEmail");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    if (profileName && userName) {
        profileName.innerText = userName;
    }

    if (profileEmail && userEmail) {
        profileEmail.innerText = userEmail;
    }
}

showProfile();

//     =========================================================================
// quick safety action ke liye  ===============================================

// function getEmergencyLocation() {

//     const emergencyMessage =
//         document.getElementById("emergencyMessage");

//     if (!navigator.geolocation) {
//         emergencyMessage.innerText =
//             "❌ GPS is not supported by this browser.";
//         return;
//     }

//     emergencyMessage.innerText =
//         "📍 Getting your location...";

//     navigator.geolocation.getCurrentPosition(

//         function (position) {

//             const latitude = position.coords.latitude;
//             const longitude = position.coords.longitude;
//             alert("Location मिली!\nLat: " + latitude + "\nLng: " + longitude);

//             const mapsURL =
//                 "https://www.google.com/maps?q=" +
//                 latitude + "," + longitude;

//             emergencyMessage.innerText =
//                 "✅ Location detected successfully!\n" +
//                 "Lat: " + latitude.toFixed(6) +
//                 "\nLng: " + longitude.toFixed(6);

//             const mapLink =
//                 document.getElementById("emergencyMapLink");

//             if (mapLink) {
//                 mapLink.href = mapsURL;
//                 mapLink.style.display = "inline-block";
//             }

//             console.log("SOS Location:", latitude, longitude);

//             showEmergencyContacts(mapsURL);

//             if (typeof showSelectedEmergencyOptions === "function") {
//                 showSelectedEmergencyOptions();
//             }
//         },

//         function (error) {

//             console.log("Location Error:", error);

//             if (error.code === 1) {
//                 emergencyMessage.innerText =
//                     "❌ Location permission denied. Please allow location in Chrome.";
//             }
//             else if (error.code === 2) {
//                 emergencyMessage.innerText =
//                     "❌ Location unavailable. Check your device location.";
//             }
//             else if (error.code === 3) {
//                 emergencyMessage.innerText =
//                     "⏳ Location request timed out. Please try SOS again.";
//             }
//             else {
//                 emergencyMessage.innerText =
//                     "❌ Unable to get your location.";
//             }
//         },

//         {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0
//         }
//     );
// }

// emergency option choose
function saveEmergencyPreferences() {
    const preferences = {
        favorite: document.getElementById("favoriteOption").checked,
        police: document.getElementById("policeOption").checked,
        ambulance: document.getElementById("ambulanceOption").checked,
        fire: document.getElementById("fireOption").checked
    };

    localStorage.setItem(
        "emergencyPreferences",
        JSON.stringify(preferences)
    );

    const message =
        document.getElementById("preferenceMessage");

    message.innerText = "✅ Emergency preferences saved!";
}

function loadEmergencyPreferences() {
    const saved =
        localStorage.getItem("emergencyPreferences");

    if (!saved) return;

    const preferences = JSON.parse(saved);

    document.getElementById("favoriteOption").checked =
        preferences.favorite || false;

    document.getElementById("policeOption").checked =
        preferences.police || false;

    document.getElementById("ambulanceOption").checked =
        preferences.ambulance || false;

    document.getElementById("fireOption").checked =
        preferences.fire || false;
}

loadEmergencyPreferences();

// favorite persone ==========================================
function saveFavoriteContact() {

    const name =
        document.getElementById("favoriteName").value.trim();

    const phone =
        document.getElementById("favoritePhone").value.trim();

    const message =
        document.getElementById("favoriteMessage");

    if (!name || !phone) {
        message.innerText =
            "❌ Please enter name and phone number.";
        return;
    }

    const favoriteContact = {
        name: name,
        phone: phone
    };

    localStorage.setItem(
        "favoriteContact",
        JSON.stringify(favoriteContact)
    );

    message.innerText =
        "✅ Favorite person saved successfully!";
}

// refresh
function loadFavoriteContact() {

    const saved =
        localStorage.getItem("favoriteContact");

    if (!saved) return;

    const contact = JSON.parse(saved);

    const nameInput =
        document.getElementById("favoriteName");

    const phoneInput =
        document.getElementById("favoritePhone");

    if (nameInput) {
        nameInput.value = contact.name;
    }

    if (phoneInput) {
        phoneInput.value = contact.phone;
    }
}

loadFavoriteContact();
 
// sos ke sath location mess.
function createEmergencyMessage(lat, lng) {

    const mapsURL =
        `https://www.google.com/maps?q=${lat},${lng}`;

    return `🚨 EMERGENCY ALERT

I need help.

📍 My Location:
${mapsURL}`;
}
// for sos save
// function showSelectedEmergencyOptions() {

//     const saved =
//         localStorage.getItem("emergencyPreferences");

//     if (!saved) {
//         alert("Please select your emergency preferences first.");
//         return;
//     }

//     const preferences = JSON.parse(saved);

//     const favorite =
//         localStorage.getItem("favoriteContact");

//     let options = "";

//     if (preferences.favorite && favorite) {
//         const contact = JSON.parse(favorite);

//         options += `
//             <div class="emergency-option">
//                 <h4>❤️ ${contact.name}</h4>
//                 <a href="tel:${contact.phone}">
//                     📞 Call
//                 </a>
//             </div>
//         `;
//     }

//     if (preferences.police) {
//         options += `
//             <div class="emergency-option">
//                 <h4>👮 Police</h4>
//                 <a href="tel:112">
//                     📞 Call 112
//                 </a>
//             </div>
//         `;
//     }

//     if (preferences.ambulance) {
//         options += `
//             <div class="emergency-option">
//                 <h4>🚑 Ambulance</h4>
//                 <a href="tel:108">
//                     📞 Call 108
//                 </a>
//             </div>
//         `;
//     }

//     if (preferences.fire) {
//         options += `
//             <div class="emergency-option">
//                 <h4>🚒 Fire Service</h4>
//                 <a href="tel:101">
//                     📞 Call 101
//                 </a>
//             </div>
//         `;
//     }

//     if (!options) {
//         options = "<p>No emergency options selected.</p>";
//     }

//     const panel =
//         document.getElementById("emergencyContacts");

//     if (panel) {
//         panel.innerHTML = options;
//     }
// }

function showSelectedEmergencyOptions(mapsURL) {

    const saved =
        localStorage.getItem("emergencyPreferences");

    if (!saved) {
        alert("Please select your emergency preferences first.");
        return;
    }

    const preferences = JSON.parse(saved);

    const favorite =
        localStorage.getItem("favoriteContact");

    let options = "";

    // ❤️ Favorite Person
    if (preferences.favorite && favorite) {

        const contact = JSON.parse(favorite);

        options += `
            <div class="emergency-option">
                <h4>❤️ ${contact.name}</h4>

                <a href="tel:${contact.phone}">
                    📞 Call
                </a>

                <br><br>

                <button onclick="shareEmergencyLocation()">
               📤 Share My Location
               </button>
            </div>
        `;
    }

    // 👮 Police
    if (preferences.police) {

        options += `
            <div class="emergency-option">
                <h4>👮 Police</h4>

                <a href="tel:112">
                    📞 Call 112
                </a>

                <br><br>

                <button onclick="shareEmergencyLocation()">
    📤 Share My Location
</button>
            </div>
        `;
    }

    // 🚑 Ambulance
    if (preferences.ambulance) {

        options += `
            <div class="emergency-option">
                <h4>🚑 Ambulance</h4>

                <a href="tel:108">
                    📞 Call 108
                </a>

                <br><br>

                <button onclick="shareEmergencyLocation()">
    📤 Share My Location
</button>
            </div>
        `;
    }

    // 🚒 Fire Service
    if (preferences.fire) {

        options += `
            <div class="emergency-option">
                <h4>🚒 Fire Service</h4>

                <a href="tel:101">
                    📞 Call 101
                </a>

                <br><br>

                <button onclick="shareEmergencyLocation()">
    📤 Share My Location
</button>
            </div>
        `;
    }

    if (!options) {
        options =
            "<p>No emergency options selected.</p>";
    }

    const panel =
        document.getElementById("emergencyContacts");

    if (panel) {
        panel.innerHTML = options;
    }
}

// location share
// function shareEmergencyLocation(mapsURL) {

//     if (navigator.share) {

//         navigator.share({
//             title: "Emergency Location",
//             text: "🚨 I need help. This is my current location:",
//             url: mapsURL
//         });

//     } else {

//         navigator.clipboard.writeText(mapsURL);

//         alert(
//             "📍 Location link copied!\n" +
//             "अब इसे WhatsApp/SMS में भेज सकते हैं।"
//         );
//     }
// }
 
async function shareEmergencyLocation() {

    if (
        typeof emergencyLatitude === "undefined" ||
        typeof emergencyLongitude === "undefined"
    ) {
        alert("❌ Emergency location is not available.");
        return;
    }

    const mapsURL =
        "https://www.google.com/maps?q=" +
        emergencyLatitude + "," +
        emergencyLongitude;

    const directionsURL =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        emergencyLatitude + "," +
        emergencyLongitude;

    const shareText =
        "🚨 EMERGENCY ALERT\n\n" +
        "I need help.\n\n" +
        "📍 My Location:\n" +
        mapsURL +
        "\n\n" +
        "🧭 Get Directions:\n" +
        directionsURL;

    // Voice recording available
    if (recordedAudioBlob) {

        const audioFile = new File(
            [recordedAudioBlob],
            "emergency-voice.webm",
            {
                type: "audio/webm"
            }
        );

        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [audioFile]
            })
        ) {

            try {

                await navigator.share({
                    title: "🚨 Emergency Alert",
                    text: shareText,
                    files: [audioFile]
                });

                return;

            } catch (error) {

                console.log(
                    "Voice share cancelled:",
                    error
                );
            }
        }
    }

    // If no voice recording
    if (navigator.share) {

        try {

            await navigator.share({
                title: "🚨 Emergency Alert",
                text: shareText
            });

        } catch (error) {

            console.log(
                "Share cancelled:",
                error
            );
        }

    } else {

        navigator.clipboard.writeText(shareText);

        alert(
            "📍 Emergency location + directions copied!"
        );
    }
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const settingsButton =
    document.getElementById("settingsButton");

const settingsPanel =
    document.getElementById("settingsPanel");

settingsButton.addEventListener("click", function () {

    if (settingsPanel.style.display === "none") {
        settingsPanel.style.display = "block";
    } else {
        settingsPanel.style.display = "none";
    }

});
settingsPanel.style.display = "none";