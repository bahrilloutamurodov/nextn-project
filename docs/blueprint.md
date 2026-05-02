# **App Name**: EduQuest Ascent

## Core Features:

- Interactive Level Map & Unlock Logic: Visual 'Level Map' displaying 10 educational stages, with levels 2-10 initially locked. Unlocking logic progresses players to the next stage upon achieving target scores.
- Subject-Based Quiz Module: Engaging quiz interface for Ona tili, Matematika, Ingliz tili, and Tarix. Each level features 10 progressively challenging questions.
- Gamified Mini-Games: After successfully completing a quiz, students play a 1-minute 'Memory Match' (with subject terms) or 'Quick Math Dash' game before advancing.
- Performance Feedback & Motivation: A 'Congrats!' screen after each level displays the percentage score and a motivational message, in the style of the provided image.
- Generative AI Hint Tool: An AI tool provides subtle, tailored hints to students for questions they struggle with, using reasoning based on their previous answers without directly giving the solution.
- User Progress and Analytics Storage: Securely save student's name, class, completed levels, average scores, and total time in a Firebase Firestore database for progress tracking.

## Style Guidelines:

- Color Palette: Dark Mode design. Primary interactive elements utilize a vibrant violet (#BA6AFF) to stand out against the deep background.
- Background: A very dark, subtle purplish-black (#1A181F) provides a modern and immersive dark mode experience, similar to the main interface shown in the reference image.
- Accent Color: A bright orange (#FBA130) is used for call-to-action elements, important notifications, and highlighting key information to create strong visual contrast, as per user's request.
- Headline Font: 'Space Grotesk' (sans-serif) for a modern, slightly techy, and engaging feel suitable for titles and interactive elements, matching the app's game-like nature.
- Body Font: 'Inter' (sans-serif) for clear readability in quiz questions and smaller text, ensuring a clean and accessible learning environment.
- Icons: Clean, flat, and modern vector icons to represent subjects, achievements, locked/unlocked levels, and quiz actions, inspired by contemporary mobile UI designs.
- Structure: Utilize a card-based layout with rounded corners for levels and quiz questions, creating a visually soft and engaging interface. An interactive circular or linear 'Level Map' on the home screen clearly visualizes progression.
- Transitions: Implement smooth, subtle transitions between screens and interactive states. Progress bars feature dynamic filling animations, and successful actions trigger celebratory visual effects.