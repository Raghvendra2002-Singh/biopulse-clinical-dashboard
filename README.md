🧠 BioPulse Clinical — Cognitive Telemetry Dashboard

An interactive clinical cognitive monitoring dashboard that simulates EEG telemetry, patient cognitive metrics, brain-region mapping, and cognitive assessment tests.

Internship Project: IBM CSSRBOX / IBM Internship
Project Type: Frontend Web Application
Status: Completed

📌 Overview

BioPulse Clinical is an interactive web-based cognitive telemetry dashboard developed to demonstrate how clinical and cognitive information can be presented through a modern digital interface.

The application uses simulated patient profiles and simulated EEG signals to visualize cognitive-related metrics such as focus index, cognitive load, and response time. It also provides interactive brain-lobe inspection and cognitive assessment activities.

Note: This project is an educational simulation and does not collect real EEG data or provide medical diagnosis.

✨ Features

👤 Patient Profiles

Switch between multiple simulated patient profiles.

Display subject ID, name, age/sex, heart rate, and clinical status.

Patient-specific cognitive metrics and telemetry behavior.

🧠 Interactive Brain Mapping

SVG-based brain-region visualization.

Interactive cortical lobe inspection.

Displays descriptive information and simulated localized readings for:

Frontal Lobe

Parietal Lobe

Temporal Lobe

Occipital Lobe

Cerebellum

Brain Stem

📡 Simulated EEG Telemetry

Real-time animated EEG-style waveform visualization using the HTML5 Canvas API.

Separate simulated channels for:

Alpha — 8–12 Hz

Beta — 12–30 Hz

Theta — 4–8 Hz

Gamma — 30–100 Hz

Individual channels can be enabled or disabled.

Wave characteristics change according to the selected simulated patient profile.

🎯 Cognitive Assessments

Stroop Color-Word Test

Measures simulated:

Accuracy

Average reaction time

Total answers

Spatial Reaction Speed Grid

Measures simulated:

Targets clicked

Speed index

Average reaction time

Focus and cognitive-load updates

📊 Dynamic Metrics

The dashboard dynamically displays:

Focus Index

Cognitive Load

Synaptic Response Time

Session Duration

Signal Quality

🛠️ Technologies Used

Technology

Usage

HTML5

Application structure

CSS3

Responsive UI, layout, animations and styling

JavaScript (ES6+)

Application logic and interactivity

HTML5 Canvas

EEG waveform rendering

SVG

Interactive brain-lobe visualization

Lucide Icons

Interface icons

Google Fonts

Typography

📂 Project Structure

biopulse-cognitive-hub/
│
├── index.html
├── styles.css
├── app.js
│
└── js/
    ├── app.js
    ├── brainmap.js
    ├── cognitive.js
    └── telemetry.js

The application currently starts from index.html and loads the main application logic from the root app.js.

🚀 How to Run Locally

No backend or database is required for the current version.

Option 1 — VS Code Live Server

Clone or download the repository.

Open the project folder in VS Code.

Install the Live Server extension if needed.

Right-click index.html.

Select Open with Live Server.

Option 2 — Directly in Browser

Open index.html in a modern web browser.

🌐 Live Demo

After enabling GitHub Pages, the live project can be accessed here:

Coming soon

🔬 How the Simulation Works

The application uses predefined patient profiles and JavaScript-based calculations rather than real clinical hardware.

The EEG visualization generates waveform patterns using mathematical functions and patient-specific modifiers. Cognitive-test results are then used to update dashboard metrics such as focus, cognitive load, and response time.

Patient Profile
       ↓
Telemetry Simulation
       ↓
EEG Visualization
       ↓
Cognitive Assessment
       ↓
Performance Calculation
       ↓
Dynamic Dashboard Metrics

🎓 Internship Context

This project was developed as part of my IBM CSSRBOX internship to demonstrate practical skills in frontend web development, JavaScript programming, interactive data visualization, and user-interface design.

🔮 Future Enhancements

Potential improvements include:

Spring Boot / Java backend

REST API integration

MySQL patient database

Secure authentication and authorization

Persistent assessment history

Historical cognitive-performance charts

Real clinical-device/API integration

Doctor and administrator dashboards

Improved accessibility and testing

⚠️ Disclaimer

BioPulse Clinical is an educational software project using simulated patient information and simulated telemetry. It is not a medical device, diagnostic system, or substitute for professional medical evaluation.

👨‍💻 Author

Raghvendra Singh

B.Tech — Information Technology
Rajkiya Engineering College, Banda

GitHub: https://github.com/Raghvendra2002-Singh