const questionBank = {
  easy: [
    { question: '¿Cuántas velas tiene una corona de Adviento tradicional?', answers: ['Cuatro', 'Tres', 'Cinco'], correct: 'Cuatro', detail: 'Se enciende una vela más en cada domingo de Adviento.' },
    { question: '¿En qué fecha se celebra la Nochebuena?', answers: ['El 24 de diciembre', 'El 6 de diciembre', 'El 1 de enero'], correct: 'El 24 de diciembre', detail: 'La Nochebuena se celebra la víspera de Navidad.' },
    { question: '¿Qué se suele colocar en la punta del árbol de Navidad?', answers: ['Una estrella', 'Una campana', 'Un calcetín'], correct: 'Una estrella', detail: 'La estrella es uno de los adornos navideños más tradicionales.' }
  ],
  medium: [
    { question: '¿Cuántas puertas tiene un calendario de Adviento tradicional?', answers: ['24', '12', '31'], correct: '24', detail: 'El calendario cuenta los días del 1 al 24 de diciembre.' },
    { question: '¿Qué árbol se usa tradicionalmente como árbol de Navidad?', answers: ['Abeto', 'Abedul', 'Castaño'], correct: 'Abeto', detail: 'Los abetos y las píceas son árboles típicos de Navidad.' },
    { question: '¿Qué especia se usa a menudo en las galletas navideñas?', answers: ['Canela', 'Albahaca', 'Eneldo'], correct: 'Canela', detail: 'La canela es una especia muy común en los dulces navideños.' },
    { question: '¿Qué se suele poner debajo del árbol de Navidad?', answers: ['Regalos', 'Huevos de Pascua', 'Faroles'], correct: 'Regalos', detail: 'Muchas familias colocan los regalos debajo del árbol.' },
    { question: '¿Qué animal acompaña a Papá Noel en muchas historias?', answers: ['Un reno', 'Un oso polar', 'Un zorro'], correct: 'Un reno', detail: 'En muchos cuentos, los renos tiran del trineo de Papá Noel.' },
    { question: '¿Qué fruto seco suele llevar el turrón?', answers: ['Almendras', 'Aceitunas', 'Avellanas'], correct: 'Almendras', detail: 'El turrón tradicional suele prepararse con almendras y miel.' },
    { question: '¿Qué planta se suele colgar como adorno navideño?', answers: ['Muérdago', 'Lavanda', 'Girasol'], correct: 'Muérdago', detail: 'El muérdago es una planta muy asociada con la Navidad.' },
    { question: '¿Qué se enciende en la corona de Adviento?', answers: ['Velas', 'Linternas', 'Fuegos artificiales'], correct: 'Velas', detail: 'Se enciende una vela en cada domingo de Adviento.' },
    { question: '¿Qué figura representa el nacimiento de Jesús?', answers: ['El pesebre', 'El trineo', 'La corona'], correct: 'El pesebre', detail: 'El pesebre representa el nacimiento de Jesús.' }
  ],
  hard: [
    { question: '¿Qué celebración religiosa tiene lugar el 6 de enero?', answers: ['Día de Reyes', 'Día de Todos los Santos', 'Día de la Candelaria'], correct: 'Día de Reyes', detail: 'El Día de Reyes conmemora la visita de los Reyes Magos.' },
    { question: '¿En qué país se originó la tradición moderna del árbol de Navidad?', answers: ['Alemania', 'Italia', 'Grecia'], correct: 'Alemania', detail: 'La costumbre de decorar árboles de Navidad se popularizó en Alemania.' },
    { question: '¿Cómo se llama el periodo de las cuatro semanas antes de Navidad?', answers: ['Adviento', 'Cuaresma', 'Pentecostés'], correct: 'Adviento', detail: 'El Adviento comprende los cuatro domingos previos a Navidad.' },
    { question: '¿Qué celebración de luces tiene lugar el 13 de diciembre en Suecia?', answers: ['Santa Lucía', 'San Martín', 'Santa Bárbara'], correct: 'Santa Lucía', detail: 'La fiesta de Santa Lucía ilumina los días oscuros del invierno.' },
    { question: '¿Qué tres regalos llevaron los Reyes Magos?', answers: ['Oro, incienso y mirra', 'Sal, pan y aceite', 'Canela, miel y nueces'], correct: 'Oro, incienso y mirra', detail: 'Los tres regalos aparecen en el relato bíblico de los Reyes Magos.' },
    { question: '¿Qué árbol de la familia de las coníferas pierde sus hojas en otoño?', answers: ['Alerce', 'Abeto', 'Pino'], correct: 'Alerce', detail: 'A diferencia de la mayoría de las coníferas, el alerce pierde sus hojas.' },
    { question: '¿Qué dulce navideño español se elabora tradicionalmente con miel y almendras?', answers: ['Turrón', 'Mazapán', 'Polvorón'], correct: 'Turrón', detail: 'El turrón tradicional se elabora con miel, azúcar y almendras.' },
    { question: '¿Qué significa la palabra latina «decem», relacionada con diciembre?', answers: ['Diez', 'Doce', 'Cien'], correct: 'Diez', detail: 'En el antiguo calendario romano, diciembre era el décimo mes.' },
    { question: '¿Qué bebida caliente suele prepararse con vino y especias en algunos países europeos?', answers: ['Vino especiado', 'Limonada', 'Horchata'], correct: 'Vino especiado', detail: 'El vino caliente especiado es una bebida popular en algunos mercados navideños.' },
    { question: '¿Cómo se llama la escena que representa el nacimiento de Jesús?', answers: ['Nacimiento', 'Romería', 'Procesión'], correct: 'Nacimiento', detail: 'El nacimiento o pesebre representa la escena de Belén.' }
  ]
};

const questionsPerRound = { easy: 1, medium: 3, hard: 3 };

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function makeRound() {
  return shuffle(Object.entries(questionsPerRound).flatMap(([level, count]) =>
    shuffle(questionBank[level]).slice(0, count).map(question => ({ ...question, level }))
  ));
}

export default function mountChristmasQuiz(container) {
  const section = document.createElement('section');
  section.className = 'christmas-quiz-section activity-section';
  section.innerHTML = '<p class="christmas-quiz-eyebrow">Trivia navideña</p><div class="christmas-quiz-heading"><span class="christmas-quiz-stamp" aria-hidden="true">✦</span><div><p class="christmas-quiz-progress"></p><h2 class="christmas-quiz-question"></h2></div></div><div class="christmas-quiz-meter" aria-hidden="true"></div><div class="christmas-quiz-answers" role="group" aria-label="Opciones de respuesta"></div><p class="christmas-quiz-feedback" aria-live="polite"></p><button class="christmas-quiz-continue" type="button" hidden>Siguiente</button>';
  container.appendChild(section);

  const progress = section.querySelector('.christmas-quiz-progress');
  const questionNode = section.querySelector('.christmas-quiz-question');
  const meter = section.querySelector('.christmas-quiz-meter');
  const answersNode = section.querySelector('.christmas-quiz-answers');
  const feedback = section.querySelector('.christmas-quiz-feedback');
  const continueButton = section.querySelector('.christmas-quiz-continue');
  const stamp = section.querySelector('.christmas-quiz-stamp');
  let round = makeRound();
  let questionIndex = 0;
  let score = 0;
  let answered = false;
  let showingResult = false;

  function renderQuestion() {
    const current = round[questionIndex];
    answered = false;
    showingResult = false;
    progress.textContent = `Pregunta ${String(questionIndex + 1).padStart(2, '0')} / 07 · ${current.level === 'easy' ? 'Fácil' : current.level === 'medium' ? 'Intermedio' : 'Difícil'}`;
    questionNode.textContent = current.question;
    feedback.textContent = '';
    continueButton.hidden = true;
    continueButton.textContent = questionIndex === round.length - 1 ? 'Ver resultado' : 'Siguiente';
    stamp.classList.remove('is-stamped');
    answersNode.replaceChildren();
    meter.replaceChildren(...round.map((_, index) => {
      const mark = document.createElement('span');
      mark.className = `christmas-quiz-mark${index < questionIndex ? ' is-complete' : ''}${index === questionIndex ? ' is-current' : ''}`;
      return mark;
    }));

    shuffle(current.answers).forEach(answer => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'christmas-quiz-answer';
      button.textContent = answer;
      button.addEventListener('click', () => chooseAnswer(button, answer, current));
      answersNode.appendChild(button);
    });
  }

  function chooseAnswer(button, answer, current) {
    if (answered) return;
    answered = true;
    const correct = answer === current.correct;
    if (correct) score += 1;
    answersNode.querySelectorAll('button').forEach(option => {
      option.disabled = true;
      if (option.textContent === current.correct) option.classList.add('is-correct');
    });
    if (!correct) button.classList.add('is-incorrect');
    feedback.textContent = `${correct ? '¡Correcto!' : 'No es correcto.'} ${current.detail}`;
    continueButton.hidden = false;
    stamp.classList.toggle('is-stamped', correct);
  }

  function showResult() {
    showingResult = true;
    progress.textContent = 'Terminaste la trivia navideña';
    questionNode.textContent = score === round.length ? '¡Una ronda brillante!' : score >= 5 ? '¡Casi todas correctas!' : '¡Bien hecho!';
    answersNode.replaceChildren();
    meter.replaceChildren(...round.map((_, index) => {
      const mark = document.createElement('span');
      mark.className = `christmas-quiz-mark${index < score ? ' is-complete' : ''}`;
      return mark;
    }));
    feedback.textContent = `Respondiste correctamente ${score} de ${round.length} preguntas.`;
    stamp.classList.add('is-stamped');
    continueButton.hidden = false;
    continueButton.textContent = 'Jugar otra ronda';
    if (score >= 5) window.launchConfetti?.();
  }

  function startNewRound() {
      round = makeRound();
      questionIndex = 0;
      score = 0;
      renderQuestion();
  }

  function advance() {
    if (questionIndex === round.length - 1) {
      showResult();
      return;
    }
    questionIndex += 1;
    renderQuestion();
  }

  continueButton.addEventListener('click', () => {
    if (showingResult) startNewRound();
    else advance();
  });
  renderQuestion();
}
