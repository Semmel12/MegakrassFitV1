// API-Endpunkte
const WORKOUT_API_URL = 'https://exercisedb.p.rapidapi.com/exercises';
const QUOTE_API_URL = 'https://type.fit/api/quotes';
const IMAGE_API_URL = 'https://api.pexels.com/v1/search?query=fitness+motivation&per_page=1';

// Fallback-Zitate
const FALLBACK_QUOTES = [
  { text: 'Kein Schmerz, kein Gewinn!', author: 'MegaKrassFit' },
  { text: 'Werde zur Legende, Bro!', author: 'MegaKrassFit' },
  { text: 'Push hart, lieb zart!', author: 'MegaKrassFit' }
];

// Fallback-Bild
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1920';

// Fallback-Workouts
const FALLBACK_WORKOUTS = {
  calisthenics: [
    { name: 'Push-Ups', instructions: 'Halte den Rücken gerade, 3 Sätze à 15 Wiederholungen.', equipment: 'Kein Equipment', difficulty: 'Anfänger', isTimeBased: false },
    { name: 'Squats', instructions: 'Gehe tief, 3 Sätze à 20 Wiederholungen.', equipment: 'Kein Equipment', difficulty: 'Anfänger', isTimeBased: false },
    { name: 'Plank', instructions: 'Halte 30 Sekunden, 3 Sätze.', equipment: 'Kein Equipment', difficulty: 'Mittel', isTimeBased: true },
    { name: 'Dips', instructions: 'Nutze Stühle, 3 Sätze à 12 Wiederholungen.', equipment: 'Stühle', difficulty: 'Fortgeschritten', isTimeBased: false },
    { name: 'Lunges', instructions: 'Wechsel Beine, 3 Sätze à 10 pro Seite.', equipment: 'Kein Equipment', difficulty: 'Mittel', isTimeBased: false }
  ],
  gym: [
    { name: 'Bench Press', instructions: 'Langhantel, 3 Sätze à 10 Wiederholungen.', equipment: 'Langhantel', difficulty: 'Mittel', isTimeBased: false },
    { name: 'Deadlift', instructions: 'Rücken gerade, 3 Sätze à 8 Wiederholungen.', equipment: 'Langhantel', difficulty: 'Fortgeschritten', isTimeBased: false },
    { name: 'Shoulder Press', instructions: 'Kurzhanteln, 3 Sätze à 12 Wiederholungen.', equipment: 'Kurzhanteln', difficulty: 'Mittel', isTimeBased: false },
    { name: 'Lat Pulldown', instructions: 'Kabelzug, 3 Sätze à 10 Wiederholungen.', equipment: 'Kabelzug', difficulty: 'Anfänger', isTimeBased: false },
    { name: 'Leg Press', instructions: 'Maschine, 3 Sätze à 12 Wiederholungen.', equipment: 'Beinpresse', difficulty: 'Mittel', isTimeBased: false }
  ]
};

// Klasse für die Verwaltung der App
class MegaKrassFitApp {
  constructor() {
    // DOM-Elemente
    this.homeScreen = document.getElementById('homeScreen');
    this.workoutScreen = document.getElementById('workoutScreen');
    this.calisthenicsBtn = document.getElementById('calisthenicsBtn');
    this.gymBtn = document.getElementById('gymBtn');
    this.newWorkoutBtn = document.getElementById('newWorkoutBtn');
    this.backBtn = document.getElementById('backBtn');
    this.startTimerBtn = document.getElementById('startTimerBtn');
    this.nextExerciseBtn = document.getElementById('nextExerciseBtn');
    this.shareWorkoutBtn = document.getElementById('shareWorkoutBtn');
    this.mainContainer = document.getElementById('mainContainer');
    this.workoutContainer = document.getElementById('workoutContainer');
    this.workoutProgress = document.getElementById('workoutProgress');
    this.workoutProgressText = document.getElementById('workoutProgressText');
    this.scoreDisplay = document.getElementById('score');
    this.workoutHistory = document.getElementById('workoutHistory');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.errorMessage = document.getElementById('errorMessage');
    this.darkModeToggle = document.getElementById('darkModeToggle');

    // Event-Listener
    this.calisthenicsBtn.addEventListener('click', () => this.loadWorkout('calisthenics'));
    this.gymBtn.addEventListener('click', () => this.loadWorkout('gym'));
    this.newWorkoutBtn.addEventListener('click', () => this.loadWorkout(this.currentType));
    this.backBtn.addEventListener('click', () => this.showHomeScreen());
    this.startTimerBtn.addEventListener('click', () => this.startWorkoutTimer());
    this.nextExerciseBtn.addEventListener('click', () => this.nextExercise());
    this.shareWorkoutBtn.addEventListener('click', () => this.shareWorkout());
    this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

    // Konfetti-Instanz
    this.confetti = new JSConfetti();

    // Audio
    this.sounds = {
      start: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3'] }),
      complete: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-long-sweep-165.mp3'] })
    };

    // Initialisierung
    this.currentType = '';
    this.currentWorkout = [];
    this.timerInterval = null;
    this.currentExerciseIndex = 0;
    this.timerDuration = 30;
    this.pauseDuration = 30;
    this.isPausing = false;
    this.score = parseInt(localStorage.getItem('score') || '0');
    this.history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    this.scoreDisplay.textContent = this.score;
    this.updateHistory();
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) document.body.classList.add('dark-mode');

    // Partikel-Animation
    particlesJS('particles-js', {
      particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: ['#0A1A3B', '#00A8E8', '#FF4D6D'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 100, color: '#00A8E8', opacity: 0.3, width: 1 },
        move: { enable: true, speed: 3, direction: 'none', random: true }
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 150, duration: 0.4 }, push: { particles_nb: 5 } }
      }
    });
  }

  // Startseite anzeigen
  showHomeScreen() {
    this.workoutScreen.classList.add('d-none');
    this.homeScreen.classList.remove('d-none');
    this.mainContainer.style.background = '';
    this.errorMessage.classList.add('d-none');
    this.nextExerciseBtn.classList.add('d-none');
    this.stopTimer();
    this.isPausing = false;
  }

  // Workout-Bildschirm anzeigen
  showWorkoutScreen() {
    this.homeScreen.classList.add('d-none');
    this.workoutScreen.classList.remove('d-none');
    this.errorMessage.classList.add('d-none');
  }

  // Ladeanimation anzeigen
  showLoading(show) {
    this.loadingSpinner.classList.toggle('d-none', !show);
  }

  // Fehlermeldung anzeigen
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('d-none');
  }

  // Dark Mode umschalten
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode);
    this.darkModeToggle.textContent = this.isDarkMode ? '☀️' : '🌙';
    this.sounds.start.play();
  }

  // Workout laden
  async loadWorkout(type) {
    this.currentType = type;
    this.currentExerciseIndex = 0;
    this.isPausing = false;
    this.showLoading(true);
    this.showWorkoutScreen();

    try {
      // Workout holen
      const workout = await this.fetchWorkout(type);
      this.currentWorkout = workout;
      this.renderWorkout();

      // Zitat holen
      const quote = await this.fetchQuote();
      document.getElementById('quoteText').textContent = quote.text;
      document.getElementById('quoteAuthor').textContent = quote.author;

      // Dynamischer Hintergrund
      this.mainContainer.style.background = type === 'calisthenics' 
        ? 'linear-gradient(135deg, #0A1A3B, #00A8E8)' 
        : 'linear-gradient(135deg, #0A1A3B, #FF4D6D)';

      // Soundeffekt
      this.sounds.start.play();

      // Historie aktualisieren
      const date = new Date().toLocaleString();
      this.history.push({ name: `${type} Workout`, type, date });
      localStorage.setItem('workoutHistory', JSON.stringify(this.history));
      this.updateHistory();
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      this.showError('Ups, etwas ging schief! Versuch’s nochmal, Bro!');
    } finally {
      this.showLoading(false);
    }
  }

  // Workout rendern (nur aktuelle Übung oder Pause)
  renderWorkout() {
    this.workoutContainer.innerHTML = '';
    if (this.currentExerciseIndex >= this.currentWorkout.length) {
      this.completeWorkout();
      return;
    }

    if (this.isPausing) {
      this.renderPause();
      return;
    }

    const exercise = this.currentWorkout[this.currentExerciseIndex];
    const card = document.createElement('div');
    card.className = 'card mx-auto shadow-lg workout-card mb-4';
    card.style.maxWidth = '800px';
    card.innerHTML = `
      <img class="card-img-top" src="${exercise.image || FALLBACK_IMAGE}" alt="${exercise.name}">
      <div class="card-body">
        <h3 class="card-title">${exercise.name}</h3>
        <p class="card-text">${exercise.instructions}</p>
        <p class="card-text"><strong>Equipment:</strong> ${exercise.equipment}</p>
        <p class="card-text"><strong>Schwierigkeit:</strong> ${exercise.difficulty}</p>
        <div class="progress mt-3">
          <div id="timerProgress" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
        </div>
        <p id="timerText" class="mt-2">${exercise.isTimeBased ? 'Übung-Timer: 0s' : 'Führe die Sätze aus'}</p>
        <button id="completeExerciseBtn" class="btn complete-btn mt-3 epic-btn">Übung abschließen</button>
      </div>
    `;
    this.workoutContainer.appendChild(card);
    this.updateWorkoutProgress();

    // Event-Listener für "Übung abschließen"
    document.getElementById('completeExerciseBtn').addEventListener('click', () => this.completeExercise());

    // Animation
    anime({
      targets: '.card',
      translateX: [100, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutQuad'
    });

    // Timer für zeitbasierte Übungen
    if (exercise.isTimeBased) {
      this.startExerciseTimer();
    }
  }

  // Pause rendern
  renderPause() {
    const card = document.createElement('div');
    card.className = 'card mx-auto shadow-lg workout-card mb-4';
    card.style.maxWidth = '800px';
    card.innerHTML = `
      <div class="card-body">
        <h3 class="card-title neon-text">Pause</h3>
        <p class="card-text">Nimm dir einen Moment, Bro!</p>
        <div class="progress mt-3">
          <div id="timerProgress" class="progress-bar bg-info" role="progressbar" style="width: 100%"></div>
        </div>
        <p id="timerText" class="mt-2">Pause: ${this.pauseDuration}s</p>
        <button id="skipPauseBtn" class="btn skip-pause-btn mt-3 epic-btn">Pause überspringen</button>
      </div>
    `;
    this.workoutContainer.appendChild(card);

    // Event-Listener für "Pause überspringen"
    document.getElementById('skipPauseBtn').addEventListener('click', () => this.skipPause());

    // Animation
    anime({
      targets: '.card',
      translateX: [100, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutQuad'
    });

    // Pause-Timer starten
    this.startPauseTimer();
  }

  // Nächste Übung
  nextExercise() {
    this.stopTimer();
    this.currentExerciseIndex++;
    this.isPausing = false;
    this.renderWorkout();
    this.nextExerciseBtn.classList.toggle('d-none', this.currentExerciseIndex >= this.currentWorkout.length);
    this.sounds.start.play();
  }

  // Übung abschließen
  completeExercise() {
    this.stopTimer();
    if (this.currentWorkout[this.currentExerciseIndex].isTimeBased) {
      this.nextExercise();
    } else {
      this.isPausing = true;
      this.renderWorkout();
    }
  }

  // Pause überspringen
  skipPause() {
    this.stopTimer();
    this.isPausing = false;
    this.nextExercise();
  }

  // Workout von ExerciseDB API abrufen
  async fetchWorkout(type, retryCount = 0) {
    const maxRetries = 2;
    try {
      let url = WORKOUT_API_URL;
      if (type === 'calisthenics') url += '?equipment=body%20weight';
      console.log(`API URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', 
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      if (!response.ok) throw new Error(`API-Fehler: ${response.status}`);
      const exercises = await response.json();
      console.log('API-Daten:', exercises);

      // Übungen filtern
      const validExercises = exercises.filter(ex => 
        ex.name && 
        ex.instructions && 
        ex.instructions.length > 20 &&
        ex.difficulty
      );

      if (validExercises.length < 5) {
        if (retryCount < maxRetries) {
          console.warn(`Zu wenige Übungen, Retry ${retryCount + 1}`);
          return await this.fetchWorkout(type, retryCount + 1);
        }
        console.warn('Fallback-Workouts verwenden');
        return FALLBACK_WORKOUTS[type].map(ex => ({
          ...ex,
          image: FALLBACK_IMAGE
        }));
      }

      // Wähle 5 zufällige Übungen
      const selectedExercises = [];
      const indices = Array.from({ length: validExercises.length }, (_, i) => i);
      for (let i = 0; i < 5; i++) {
        if (indices.length === 0) break;
        const randomIndex = Math.floor(Math.random() * indices.length);
        const exerciseIndex = indices.splice(randomIndex, 1)[0];
        const exercise = validExercises[exerciseIndex];
        const image = await this.fetchBackgroundImage(exercise.name);
        selectedExercises.push({
          name: exercise.name,
          instructions: exercise.instructions,
          equipment: exercise.equipment || 'Kein Equipment',
          difficulty: exercise.difficulty,
          image,
          isTimeBased: exercise.instructions.toLowerCase().includes('halte') || exercise.instructions.toLowerCase().includes('sekunden')
        });
      }
      console.log('Ausgewählte Übungen:', selectedExercises);
      return selectedExercises;
    } catch (error) {
      console.error('Workout-Fehler:', error);
      if (retryCount < maxRetries) {
        console.warn(`Retry ${retryCount + 1} nach Fehler`);
        return await this.fetchWorkout(type, retryCount + 1);
      }
      return FALLBACK_WORKOUTS[type].map(ex => ({
        ...ex,
        image: FALLBACK_IMAGE
      }));
    }
  }

  // Zitat von Type.fit API abrufen
  async fetchQuote() {
    try {
      const response = await fetch(QUOTE_API_URL);
      if (!response.ok) throw new Error('Quote API-Fehler');
      const quotes = await response.json();
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      console.log('Geladenes Zitat:', quote);
      return quote;
    } catch (error) {
      console.error('Quote Fehler:', error);
      const fallbackQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      console.log('Fallback-Zitat:', fallbackQuote);
      return fallbackQuote;
    }
  }

  // Bild von Pexels API abrufen
  async fetchBackgroundImage(query) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
      console.log('Bild-URL:', url);
      const response = await fetch(url, {
        headers: {
          Authorization: 'YOUR_PEXELS_API_KEY' 
        }
      });
      if (!response.ok) throw new Error('Pexels API-Fehler');
      const data = await response.json();
      const imageUrl = data.photos[0]?.src?.large2x || FALLBACK_IMAGE;
      console.log('Geladenes Bild:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Bild-Fehler:', error);
      return FALLBACK_IMAGE;
    }
  }

  // Workout-Timer starten
  startWorkoutTimer() {
    this.stopTimer();
    this.currentExerciseIndex = 0;
    this.isPausing = false;
    this.renderWorkout();
    this.nextExerciseBtn.classList.remove('d-none');
  }

  // Timer für einzelne Übung
  startExerciseTimer() {
    if (this.currentExerciseIndex >= this.currentWorkout.length) {
      this.completeWorkout();
      return;
    }

    let timeLeft = this.timerDuration;
    const progressBar = document.getElementById('timerProgress');
    const timerText = document.getElementById('timerText');
    progressBar.style.width = '100%';
    timerText.textContent = `Übung-Timer: ${timeLeft}s`;

    this.sounds.start.play();
    this.timerInterval = setInterval(() => {
      timeLeft--;
      const percentage = (timeLeft / this.timerDuration) * 100;
      progressBar.style.width = `${percentage}%`;
      timerText.textContent = `Übung-Timer: ${timeLeft}s`;

      if (timeLeft <= 0) {
        this.completeExercise();
      }
    }, 1000);
    this.updateWorkoutProgress();
  }

  // Pause-Timer starten
  startPauseTimer() {
    let timeLeft = this.pauseDuration;
    const progressBar = document.getElementById('timerProgress');
    const timerText = document.getElementById('timerText');
    progressBar.style.width = '100%';
    timerText.textContent = `Pause: ${timeLeft}s`;

    this.sounds.start.play();
    this.timerInterval = setInterval(() => {
      timeLeft--;
      const percentage = (timeLeft / this.pauseDuration) * 100;
      progressBar.style.width = `${percentage}%`;
      timerText.textContent = `Pause: ${timeLeft}s`;

      if (timeLeft <= 0) {
        this.skipPause();
      }
    }, 1000);
  }

  // Workout abschließen
  completeWorkout() {
    this.stopTimer();
    this.score += 50;
    localStorage.setItem('score', this.score);
    this.scoreDisplay.textContent = this.score;
    this.confetti.addConfetti({ emojis: ['💪', '🔥', '🏋️'] });
    this.sounds.complete.play();
    this.nextExerciseBtn.classList.add('d-none');
    this.workoutContainer.innerHTML = '<h3 class="text-white neon-text">Krass gemacht, Bro! Workout abgeschlossen!</h3>';
    this.updateWorkoutProgress();
    anime({
      targets: '#score',
      scale: [1, 1.5, 1],
      duration: 800,
      easing: 'easeInOutQuad'
    });
  }

  // Timer stoppen
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const progressBar = document.getElementById('timerProgress');
    const timerText = document.getElementById('timerText');
    if (progressBar) progressBar.style.width = '0%';
    if (timerText) timerText.textContent = this.isPausing ? `Pause: ${this.pauseDuration}s` : 'Übung-Timer: 0s';
  }

  // Workout-Fortschritt aktualisieren
  updateWorkoutProgress() {
    const progress = this.currentWorkout.length > 0 
      ? (Math.min(this.currentExerciseIndex + (this.isPausing ? 0 : 1), this.currentWorkout.length) / this.currentWorkout.length) * 100 
      : 0;
    this.workoutProgress.style.width = `${progress}%`;
    this.workoutProgressText.textContent = `Workout-Fortschritt: ${Math.round(progress)}%`;
  }

  // Workout auf X teilen
  shareWorkout() {
    const exerciseNames = this.currentWorkout.map(ex => ex.name).join(', ');
    const text = `Gerade ein krasses ${this.currentType} Workout bei MegaKrassFit zerstört! Übungen: ${exerciseNames} 💪🔥 #MegaKrassFit`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    this.sounds.start.play();
  }

  // Workout-Historie aktualisieren
  updateHistory() {
    this.workoutHistory.innerHTML = '';
    this.history.slice(-5).forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${item.name} (${item.type}) - ${item.date}`;
      this.workoutHistory.appendChild(li);
    });
  }
}

// App initialisieren
const app = new MegaKrassFitApp();

// Hosting-URL (GitHub Pages)
console.log('App erreichbar unter: https://yourusername.github.io/megakrassfit/');