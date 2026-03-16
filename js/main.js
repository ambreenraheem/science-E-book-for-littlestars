/* ============================================================
   SCIENCE FOR LITTLE STARS — main.js
   Shared JS: nav toggle, reveal animations, explorer,
   secret reveal, quiz engine with timer
   ============================================================ */

// ─── Run everything after DOM is ready ───
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRevealObserver();
  initExplorers();
  initSecretReveal();
  if (document.getElementById('quiz-app')) initQuiz();
});

/* ============================================================
   NAVIGATION — mobile hamburger toggle
   ============================================================ */
function initNav() {
  const hamburger = document.getElementById('nav-hamburger'); // hamburger button
  const mobileMenu = document.getElementById('nav-mobile');   // mobile menu panel

  if (!hamburger || !mobileMenu) return;

  // Toggle mobile menu open/close on button click
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close menu when any link inside it is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ============================================================
   SCROLL REVEAL — animate elements into view using
   IntersectionObserver (no library needed)
   ============================================================ */
function initRevealObserver() {
  // Select all elements with class "reveal"
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on index within the parent
        const siblings = [...entry.target.parentElement.children];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible'); // triggers CSS transition
        observer.unobserve(entry.target);       // animate once only
      }
    });
  }, { threshold: 0.12 }); // trigger when 12% visible

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   INTERACTIVE EXPLORER — prev/next slide navigator
   Handles multiple explorers on the same page
   ============================================================ */
function initExplorers() {
  // Each explorer has its own wrapper with class "explorer"
  document.querySelectorAll('.explorer').forEach(explorer => {
    const slides = explorer.querySelectorAll('.explorer__slide'); // all slides
    const dots   = explorer.querySelectorAll('.explorer__dot');   // dot indicators
    const prevBtn = explorer.querySelector('.prev-btn');           // ← button
    const nextBtn = explorer.querySelector('.next-btn');           // → button

    if (!slides.length) return;

    let current = 0; // track which slide is showing

    // Show a specific slide by index
    function showSlide(idx) {
      slides[current].classList.remove('active'); // hide current
      dots[current]?.classList.remove('active');

      current = (idx + slides.length) % slides.length; // wrap around

      slides[current].classList.add('active');    // show new
      dots[current]?.classList.add('active');
    }

    // Wire up prev/next buttons
    prevBtn?.addEventListener('click', () => showSlide(current - 1));
    nextBtn?.addEventListener('click', () => showSlide(current + 1));

    // Wire up dot clicks
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

    showSlide(0); // initialize first slide
  });
}

/* ============================================================
   SECRET REVEAL — click-to-reveal fun fact panels
   ============================================================ */
function initSecretReveal() {
  // Each secret box has a button and a content panel
  document.querySelectorAll('.secret-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling; // the div right after the button
      const isOpen  = content.classList.contains('open');

      // Toggle open/close
      content.classList.toggle('open', !isOpen);

      // Update button text (emoji + label)
      btn.querySelector('.secret-btn__label').textContent =
        isOpen ? '🔒 Reveal the Secret!' : '🔓 Hide Secret';
    });
  });
}

/* ============================================================
   QUIZ ENGINE — timer, options, score, badge system
   ============================================================ */

// Full question bank — 10 questions per chapter = 100 questions
const QUESTION_BANK = [
  // ── SOLAR SYSTEM (index 0–9) ──
  { chapter:'Solar System', q:'How many planets are in our Solar System?', opts:['8','9','7','10'], ans:0 },
  { chapter:'Solar System', q:'Which planet is closest to the Sun?', opts:['Venus','Earth','Mercury','Mars'], ans:2 },
  { chapter:'Solar System', q:'Which planet is the largest?', opts:['Saturn','Neptune','Earth','Jupiter'], ans:3 },
  { chapter:'Solar System', q:'What is the center of our Solar System?', opts:['The Moon','The Sun','Mars','A Star'], ans:1 },
  { chapter:'Solar System', q:'Which planet has rings around it?', opts:['Jupiter','Earth','Saturn','Mars'], ans:2 },
  { chapter:'Solar System', q:'How long does Earth take to go around the Sun?', opts:['1 Month','1 Week','1 Day','1 Year'], ans:3 },
  { chapter:'Solar System', q:'What is the Moon?', opts:['A planet','A star','Earth\'s natural satellite','A comet'], ans:2 },
  { chapter:'Solar System', q:'Which is the hottest planet?', opts:['Mercury','Venus','Mars','Jupiter'], ans:1 },
  { chapter:'Solar System', q:'What do we call a rocky body that orbits the Sun?', opts:['Galaxy','Comet','Asteroid','Nebula'], ans:2 },
  { chapter:'Solar System', q:'Which planet is called the Red Planet?', opts:['Venus','Mercury','Saturn','Mars'], ans:3 },

  // ── PLANTS (index 10–19) ──
  { chapter:'Plants', q:'What do plants need to make their own food?', opts:['Milk','Sunlight, water & air','Soil only','Rain only'], ans:1 },
  { chapter:'Plants', q:'What is the process by which plants make food called?', opts:['Digestion','Respiration','Photosynthesis','Absorption'], ans:2 },
  { chapter:'Plants', q:'Which part of a plant absorbs water from the soil?', opts:['Leaves','Flowers','Roots','Stem'], ans:2 },
  { chapter:'Plants', q:'What do we call the green material in leaves?', opts:['Chlorophyll','Glucose','Oxygen','Carbon'], ans:0 },
  { chapter:'Plants', q:'What gas do plants release that we breathe?', opts:['Carbon dioxide','Nitrogen','Hydrogen','Oxygen'], ans:3 },
  { chapter:'Plants', q:'Which part of a plant carries water to all parts?', opts:['Roots','Stem','Flower','Leaf'], ans:1 },
  { chapter:'Plants', q:'What do we call plants that lose their leaves in winter?', opts:['Evergreen','Deciduous','Annual','Perennial'], ans:1 },
  { chapter:'Plants', q:'Which plant stores water in its stem?', opts:['Rose','Cactus','Tulip','Fern'], ans:1 },
  { chapter:'Plants', q:'What do seeds need to germinate?', opts:['Snow','Water, warmth & air','Only sunlight','Rocks'], ans:1 },
  { chapter:'Plants', q:'What is the female part of a flower called?', opts:['Stamen','Petal','Pistil','Sepal'], ans:2 },

  // ── ANIMALS (index 20–29) ──
  { chapter:'Animals', q:'Which animal is a mammal?', opts:['Frog','Salmon','Eagle','Dolphin'], ans:3 },
  { chapter:'Animals', q:'What do we call animals that eat only plants?', opts:['Carnivores','Herbivores','Omnivores','Insectivores'], ans:1 },
  { chapter:'Animals', q:'Which animal lays eggs and has feathers?', opts:['Bat','Whale','Bird','Snake'], ans:2 },
  { chapter:'Animals', q:'How do fish breathe underwater?', opts:['Lungs','Gills','Skin','Nose'], ans:1 },
  { chapter:'Animals', q:'What do we call a group of lions?', opts:['Pack','Herd','Pride','Flock'], ans:2 },
  { chapter:'Animals', q:'Which is the fastest land animal?', opts:['Lion','Horse','Cheetah','Leopard'], ans:2 },
  { chapter:'Animals', q:'What do caterpillars turn into?', opts:['Spiders','Bees','Butterflies','Moths'], ans:2 },
  { chapter:'Animals', q:'How many legs does an insect have?', opts:['4','8','6','10'], ans:2 },
  { chapter:'Animals', q:'Which animal sleeps all winter?', opts:['Rabbit','Bear','Eagle','Deer'], ans:1 },
  { chapter:'Animals', q:'What do we call animals that are active at night?', opts:['Diurnal','Nocturnal','Migratory','Social'], ans:1 },

  // ── FIVE SENSES (index 30–39) ──
  { chapter:'Five Senses', q:'How many senses do humans have?', opts:['3','4','6','5'], ans:3 },
  { chapter:'Five Senses', q:'Which body part is used for the sense of smell?', opts:['Ears','Eyes','Nose','Tongue'], ans:2 },
  { chapter:'Five Senses', q:'Which sense helps you hear music?', opts:['Sight','Hearing','Touch','Smell'], ans:1 },
  { chapter:'Five Senses', q:'What do taste buds help us do?', opts:['See colors','Feel textures','Taste food','Hear sounds'], ans:2 },
  { chapter:'Five Senses', q:'Which sense tells you if something is hot?', opts:['Smell','Hearing','Touch','Sight'], ans:2 },
  { chapter:'Five Senses', q:'What organ is used for the sense of sight?', opts:['Nose','Ears','Skin','Eyes'], ans:3 },
  { chapter:'Five Senses', q:'Which part of the tongue tastes sweet things best?', opts:['Back','Sides','Middle','Tip'], ans:3 },
  { chapter:'Five Senses', q:'What do we use to protect our eyes from bright light?', opts:['Eyelids','Eyebrows','Eyelashes','All of these'], ans:3 },
  { chapter:'Five Senses', q:'What helps sound travel to your eardrum?', opts:['The nose','The ear canal','Skin vibrations','Eye nerves'], ans:1 },
  { chapter:'Five Senses', q:'Which sense is most important for balance?', opts:['Sight','Smell','Touch','Hearing'], ans:0 },

  // ── MAGNETS (index 40–49) ──
  { chapter:'Magnets', q:'Which material is attracted to a magnet?', opts:['Plastic','Glass','Iron','Wood'], ans:2 },
  { chapter:'Magnets', q:'What are the two poles of a magnet called?', opts:['Top & Bottom','Left & Right','North & South','East & West'], ans:2 },
  { chapter:'Magnets', q:'What happens when two same poles of magnets face each other?', opts:['They attract','They stick','They repel','Nothing happens'], ans:2 },
  { chapter:'Magnets', q:'Earth behaves like a giant what?', opts:['Battery','Magnet','Light bulb','Motor'], ans:1 },
  { chapter:'Magnets', q:'What do we call the area around a magnet where its force works?', opts:['Magnetic field','Electric zone','Power area','Gravity zone'], ans:0 },
  { chapter:'Magnets', q:'Which of these is NOT magnetic?', opts:['Iron','Steel','Nickel','Rubber'], ans:3 },
  { chapter:'Magnets', q:'What tool uses a magnet to show direction?', opts:['Ruler','Compass','Telescope','Thermometer'], ans:1 },
  { chapter:'Magnets', q:'Which pole of a magnet points toward Earth\'s North Pole?', opts:['South pole','East pole','North pole','West pole'], ans:0 },
  { chapter:'Magnets', q:'Can magnets work through paper?', opts:['No, never','Only metal paper','Yes, they can','Only at night'], ans:2 },
  { chapter:'Magnets', q:'What makes an electromagnet?', opts:['Only a coil','A coil of wire with electricity','Just a battery','Only iron'], ans:1 },

  // ── WEATHER (index 50–59) ──
  { chapter:'Weather', q:'What is the layer of air around Earth called?', opts:['Biosphere','Hydrosphere','Atmosphere','Lithosphere'], ans:2 },
  { chapter:'Weather', q:'What tool measures temperature?', opts:['Barometer','Anemometer','Rain gauge','Thermometer'], ans:3 },
  { chapter:'Weather', q:'How does rain form?', opts:['Ice melts','Water evaporates then cools as clouds','Wind blows water','The sun melts clouds'], ans:1 },
  { chapter:'Weather', q:'What is a very strong tropical storm called?', opts:['Blizzard','Tornado','Hurricane','Thunderstorm'], ans:2 },
  { chapter:'Weather', q:'What causes wind?', opts:['Rain clouds moving','Differences in air pressure','The Moon pulling air','Ocean waves'], ans:1 },
  { chapter:'Weather', q:'What do we call frozen rain?', opts:['Sleet or hail','Snow only','Frost','Ice storm'], ans:0 },
  { chapter:'Weather', q:'What is the water cycle?', opts:['Rain only','Evaporation only','The movement of water through evaporation, condensation & precipitation','Snow melting'], ans:2 },
  { chapter:'Weather', q:'Which season has the shortest days?', opts:['Spring','Summer','Autumn','Winter'], ans:3 },
  { chapter:'Weather', q:'What causes lightning?', opts:['Static electricity in clouds','Sun reflection','Wind friction','Rain colliding'], ans:0 },
  { chapter:'Weather', q:'What tool measures wind speed?', opts:['Thermometer','Barometer','Anemometer','Hygrometer'], ans:2 },

  // ── SIMPLE MACHINES (index 60–69) ──
  { chapter:'Simple Machines', q:'How many types of simple machines are there?', opts:['4','5','6','7'], ans:2 },
  { chapter:'Simple Machines', q:'A see-saw is an example of which simple machine?', opts:['Pulley','Wheel & axle','Lever','Wedge'], ans:2 },
  { chapter:'Simple Machines', q:'Which simple machine is used to lift a heavy flag?', opts:['Lever','Pulley','Inclined plane','Screw'], ans:1 },
  { chapter:'Simple Machines', q:'What does a simple machine do?', opts:['Creates energy','Makes work harder','Makes work easier','Stores power'], ans:2 },
  { chapter:'Simple Machines', q:'A ramp is an example of which machine?', opts:['Lever','Wedge','Screw','Inclined plane'], ans:3 },
  { chapter:'Simple Machines', q:'Which simple machine is used to split wood?', opts:['Pulley','Screw','Wedge','Wheel'], ans:2 },
  { chapter:'Simple Machines', q:'A bicycle wheel is an example of which machine?', opts:['Lever','Inclined plane','Wheel & axle','Screw'], ans:2 },
  { chapter:'Simple Machines', q:'What is a screw?', opts:['A flat ramp','An inclined plane wrapped around a cylinder','A lever arm','A wheel'], ans:1 },
  { chapter:'Simple Machines', q:'Which machine helps turn a bolt?', opts:['Lever','Pulley','Screw','Wedge'], ans:2 },
  { chapter:'Simple Machines', q:'What do simple machines NOT create?', opts:['Mechanical advantage','Ease of work','New energy','Less effort needed'], ans:2 },

  // ── OUR BODY (index 70–79) ──
  { chapter:'Our Body', q:'How many bones are in the adult human body?', opts:['186','206','226','256'], ans:1 },
  { chapter:'Our Body', q:'What is the largest organ in the body?', opts:['Brain','Liver','Heart','Skin'], ans:3 },
  { chapter:'Our Body', q:'What does the heart do?', opts:['Digests food','Pumps blood through the body','Filters air','Controls movement'], ans:1 },
  { chapter:'Our Body', q:'Which organ controls everything you do?', opts:['Heart','Lungs','Brain','Stomach'], ans:2 },
  { chapter:'Our Body', q:'How many chambers does the human heart have?', opts:['2','3','4','5'], ans:2 },
  { chapter:'Our Body', q:'What do red blood cells carry?', opts:['Food to cells','Oxygen to cells','Water to cells','Messages to brain'], ans:1 },
  { chapter:'Our Body', q:'Which organ removes waste from blood to make urine?', opts:['Liver','Lungs','Kidneys','Stomach'], ans:2 },
  { chapter:'Our Body', q:'How many teeth do adult humans have?', opts:['28','30','32','34'], ans:2 },
  { chapter:'Our Body', q:'What type of muscle works without you thinking?', opts:['Skeletal muscle','Voluntary muscle','Smooth muscle','Bone muscle'], ans:2 },
  { chapter:'Our Body', q:'What is the hardest substance in your body?', opts:['Bone','Cartilage','Tooth enamel','Nail'], ans:2 },

  // ── ENERGY & ELECTRICITY (index 80–89) ──
  { chapter:'Energy & Electricity', q:'Which of these is a form of energy?', opts:['Water','Soil','Heat','Air'], ans:2 },
  { chapter:'Energy & Electricity', q:'What energy does the Sun give us?', opts:['Wind energy','Sound energy','Solar energy','Chemical energy'], ans:2 },
  { chapter:'Energy & Electricity', q:'What do we call energy that can be replaced naturally?', opts:['Nuclear','Fossil fuel','Renewable','Chemical'], ans:2 },
  { chapter:'Energy & Electricity', q:'Which of these is a renewable energy source?', opts:['Coal','Oil','Natural gas','Wind'], ans:3 },
  { chapter:'Energy & Electricity', q:'What flows through electric wires?', opts:['Water','Air','Electricity','Light'], ans:2 },
  { chapter:'Energy & Electricity', q:'What do we need to complete an electric circuit?', opts:['Only a battery','Only wires','A power source, wires & device','Just a bulb'], ans:2 },
  { chapter:'Energy & Electricity', q:'Which material conducts electricity well?', opts:['Plastic','Wood','Rubber','Copper'], ans:3 },
  { chapter:'Energy & Electricity', q:'What converts wind energy into electricity?', opts:['Solar panel','Wind turbine','Hydroelectric dam','Generator'], ans:1 },
  { chapter:'Energy & Electricity', q:'Energy cannot be created or destroyed, only what?', opts:['Reduced','Stored','Transformed','Removed'], ans:2 },
  { chapter:'Energy & Electricity', q:'What type of energy is stored in food?', opts:['Solar','Kinetic','Chemical','Nuclear'], ans:2 },

  // ── SAVING OUR PLANET (index 90–99) ──
  { chapter:'Saving Our Planet', q:'What does "reduce, reuse, recycle" help with?', opts:['Making more products','Reducing waste','Earning money','Getting energy'], ans:1 },
  { chapter:'Saving Our Planet', q:'What gas is mainly responsible for global warming?', opts:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'], ans:2 },
  { chapter:'Saving Our Planet', q:'What do we call the slow warming of Earth\'s temperature?', opts:['Global cooling','The ice age','Global warming','Climate normal'], ans:2 },
  { chapter:'Saving Our Planet', q:'Which human activity causes the most CO2 emissions?', opts:['Walking','Burning fossil fuels','Eating plants','Recycling'], ans:1 },
  { chapter:'Saving Our Planet', q:'What is deforestation?', opts:['Planting trees','Cutting down forests','Watering plants','Growing crops'], ans:1 },
  { chapter:'Saving Our Planet', q:'Which of these is NOT eco-friendly?', opts:['Solar panels','Recycling','Burning coal','Riding a bicycle'], ans:2 },
  { chapter:'Saving Our Planet', q:'What protects Earth from harmful UV rays?', opts:['The clouds','The ozone layer','The ocean','The mountains'], ans:1 },
  { chapter:'Saving Our Planet', q:'What do we call species that are almost extinct?', opts:['Common species','Invasive species','Endangered species','Domestic species'], ans:2 },
  { chapter:'Saving Our Planet', q:'How can you save water at home?', opts:['Leave taps running','Take very long showers','Turn off taps when not in use','Water plants in the afternoon'], ans:2 },
  { chapter:'Saving Our Planet', q:'What is composting?', opts:['Burning rubbish','Turning food scraps into natural fertilizer','Pouring chemicals on soil','Dumping waste in rivers'], ans:1 },
];

// Badge system — 5 tiers based on percentage
function getBadge(score, total) {
  const pct = (score / total) * 100;
  if (pct === 100) return { label: '🏆 Grand Star Scholar!',  emoji: '🏆' };
  if (pct >= 80)   return { label: '🌟 Super Scientist!',     emoji: '🌟' };
  if (pct >= 60)   return { label: '⭐ Bright Explorer!',     emoji: '⭐' };
  if (pct >= 40)   return { label: '🔭 Curious Learner!',     emoji: '🔭' };
  return             { label: '🌱 Keep Exploring!',            emoji: '🌱' };
}

/* ── Quiz state ── */
let quizQuestions = [];  // questions for current session
let currentQ      = 0;   // current question index
let score         = 0;   // correct answers count
let timerInterval = null; // setInterval handle
let answered      = false; // prevent double-click

function initQuiz() {
  // DOM references
  const categoryBtns   = document.querySelectorAll('.quiz-cat-btn');
  const startScreen    = document.getElementById('quiz-start');
  const questionScreen = document.getElementById('quiz-question-screen');
  const resultScreen   = document.getElementById('quiz-result');

  // "Start Quiz" button
  document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
    startQuizSession();
    startScreen.style.display    = 'none';
    questionScreen.style.display = 'block';
  });

  // "Play Again" button
  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    resultScreen.classList.remove('visible');
    startScreen.style.display = 'block';
    currentQ = 0; score = 0;
  });

  // Category filter buttons
  let selectedCategory = 'All'; // default = all chapters
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.chapter; // chapter name or "All"
    });
  });

  // Store selected category globally so startQuizSession() can use it
  document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
    buildQuestionSet(selectedCategory);
  }, { once: false }); // Note: we call buildQuestionSet from startQuizSession too

  function buildQuestionSet(chapter) {
    // Filter and shuffle questions
    let pool = chapter === 'All'
      ? [...QUESTION_BANK]
      : QUESTION_BANK.filter(q => q.chapter === chapter);

    // Shuffle pool using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    quizQuestions = pool.slice(0, 10); // always 10 questions per session
    currentQ = 0;
    score    = 0;
  }

  function startQuizSession() {
    buildQuestionSet(selectedCategory);
    loadQuestion();
  }

  // ── Load a question ──
  function loadQuestion() {
    answered = false;
    const data = quizQuestions[currentQ]; // current question object

    // Update progress bar
    const pct = (currentQ / quizQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('q-count').textContent =
      `Question ${currentQ + 1} of ${quizQuestions.length}`;

    // Show question text
    document.getElementById('question-text').textContent = data.q;

    // Render answer options
    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = ''; // clear previous

    data.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(i, data.ans));
      optsContainer.appendChild(btn);
    });

    // Hide feedback & next button
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn    = document.getElementById('next-btn');
    feedbackEl.className = 'quiz-feedback'; // reset class
    feedbackEl.textContent = '';
    nextBtn.classList.remove('visible');

    startTimer(20); // 20 seconds per question
  }

  // ── Timer logic ──
  function startTimer(seconds) {
    clearInterval(timerInterval); // clear any running timer

    let remaining = seconds;
    const ring    = document.getElementById('timer-ring');   // SVG ring
    const number  = document.getElementById('timer-number'); // center number
    const circumference = 220; // stroke-dasharray value from CSS

    function updateTimer() {
      remaining--;
      const offset = circumference - (remaining / seconds) * circumference;
      ring.style.strokeDashoffset = offset; // shrink ring visually
      number.textContent = remaining;

      // Turn red when ≤ 5 seconds
      if (remaining <= 5) {
        ring.style.stroke  = '#ef4444';
        number.style.color = '#ef4444';
      }

      // Time's up — auto-submit wrong answer
      if (remaining <= 0) {
        clearInterval(timerInterval);
        if (!answered) handleAnswer(-1, quizQuestions[currentQ].ans);
      }
    }

    // Reset visuals
    ring.style.stroke         = 'var(--accent)';
    number.style.color        = 'var(--accent)';
    ring.style.strokeDashoffset = 0;
    number.textContent        = seconds;

    timerInterval = setInterval(updateTimer, 1000);
  }

  // ── Handle answer selection ──
  function handleAnswer(selected, correct) {
    if (answered) return; // prevent clicking twice
    answered = true;
    clearInterval(timerInterval); // stop the timer

    const options    = document.querySelectorAll('.quiz-option');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn    = document.getElementById('next-btn');

    // Disable all options
    options.forEach(opt => opt.disabled = true);

    if (selected === correct) {
      // ✅ Correct
      score++;
      options[correct].classList.add('correct');
      feedbackEl.textContent = '✅ Correct! Well done!';
      feedbackEl.className   = 'quiz-feedback correct';
    } else {
      // ❌ Wrong
      if (selected >= 0) options[selected].classList.add('wrong');
      options[correct].classList.add('correct'); // show correct answer
      feedbackEl.textContent = `❌ Oops! The answer is: ${quizQuestions[currentQ].opts[correct]}`;
      feedbackEl.className   = 'quiz-feedback wrong';
    }

    nextBtn.classList.add('visible'); // show "Next" button
  }

  // ── "Next Question" button ──
  document.getElementById('next-btn')?.addEventListener('click', () => {
    currentQ++;

    if (currentQ >= quizQuestions.length) {
      // Quiz complete — show result
      showResult();
    } else {
      loadQuestion(); // next question
    }
  });

  // ── Show final result ──
  function showResult() {
    document.getElementById('quiz-question-screen').style.display = 'none';
    const resultEl = document.getElementById('quiz-result');
    resultEl.classList.add('visible');

    const badge = getBadge(score, quizQuestions.length);

    document.getElementById('result-score').textContent =
      `${score} / ${quizQuestions.length}`;
    document.getElementById('result-trophy').textContent = badge.emoji;
    document.getElementById('result-badge').textContent  = badge.label;
    document.getElementById('result-title').textContent  =
      score >= 8 ? 'Amazing job! 🎉' : score >= 5 ? 'Good effort! 👍' : 'Keep learning! 💪';

    // Fill final progress bar to 100%
    document.getElementById('progress-fill').style.width = '100%';
  }
}
