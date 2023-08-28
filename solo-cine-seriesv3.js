<script>
let defiId = null;
$(document).ready(function () {
function addLoadingSpinner() {
const spinner = document.createElement("div");
spinner.setAttribute("id", "loading-spinner");
spinner.style.display = "none";
document.body.appendChild(spinner);
}
addLoadingSpinner();
function getURLParameter(name) {
return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
function showSpinner() {
const spinner = document.getElementById("loading-spinner");
spinner.style.display = "block";
}
function hideSpinner() {
const spinner = document.getElementById("loading-spinner");
spinner.style.display = "none";
}
defiId = getURLParameter('defi');
function userIsConnected() {
return firebase.auth().currentUser !== null;
}
function getPlayerB_UID() {
return localStorage.getItem('uidDefied');
}
const questionItems = $(".questions");
const totalQuestions = questionItems.length;
let gameOver = false;
let randomQuestions = [];
let currentQuestionIndex = 0;
const totalQuestionsPerGame = 10;
let timeOut;
let rng;
function shuffleArray(array, seed) {
rng = new Math.seedrandom(seed);
for (let i = array.length - 1; i > 0; i--) {
const j = Math.floor(rng() * (i + 1));
[array[i], array[j]] = [array[j], array[i]];
}
}
function generateRandomQuestions() {
const seed = Date.now().toString();
localStorage.setItem('selectedQuestionsSeed', seed);
let allQuestionsIndices = Array.from({ length: totalQuestions }, (_, index) => index);
shuffleArray(allQuestionsIndices, seed);
randomQuestions = allQuestionsIndices.slice(0, totalQuestionsPerGame);
}

function generateRandomQuestionsForChallenge() {
let seed;
if (isInChallenge()) {
seed = getChallengeSeed();
} else {
seed = Date.now().toString();
}
let allQuestionsIndices = Array.from({ length: totalQuestions }, (_, index) => index);
shuffleArray(allQuestionsIndices, seed);
randomQuestions = allQuestionsIndices.slice(0, totalQuestionsPerGame);
}
function startQuiz() {
if (defiId) {
checkForDefiAndInitQuiz();
} else {
generateRandomQuestions();
}
questionItems.hide();
showCurrentQuestion();
$(".bar-total").text(totalQuestionsPerGame);
$(".bar-answered").text("0");
}
function checkForDefiAndInitQuiz() {
const urlParams = new URLSearchParams(window.location.search);
const defiId = urlParams.get('defi');
if (defiId) {
firebase.firestore().collection('defis').doc(defiId).get().then(doc => {
if (doc.exists) {
const challengeData = doc.data();
const seed = challengeData.seed;
randomQuestions = Array.from({ length: totalQuestions }, (_, index) => index);
shuffleArray(randomQuestions, seed);
showCurrentQuestion();
hideSpinner();
} else {
console.error('Aucun défi trouvé avec cet ID:', defiId);
hideSpinner();
}
}).catch(error => {
console.error('Erreur lors de la récupération du défi:', error);
hideSpinner();
});
} else {
hideSpinner();
}
}

function initializeQuiz() {
questionItems.hide();
$(".bar-total").text(totalQuestionsPerGame);
$(".bar-answered").text("0");
showSpinner();
if (defiId) {
checkForDefiAndInitQuiz();
} else {
startQuiz();
hideSpinner();
}
}
$(document).ready(function() {
    initializeQuiz();
});
function revealNextButton(questionElement) {
$(".glass").addClass("is--hidden");
setTimeout(function () {
questionElement.find(".frame-link, .move").css("transform", "scale(1.0)");
$(".frame-art-img").removeClass("hide-during-animation");
}, 500);
}
function updateUi() {
let answeredQuestions = $(".is--answered").length;
let progress = 100 * (answeredQuestions / totalQuestionsPerGame);
$(".bar-fill").css("width", progress + "%");
let correctAnswers = $(".answered-correct").length;
let points = correctAnswers * 10;
$(".points-number").text(points);
updateBarText();
if (progress == 100) {
$(".frame-link-text").text("TERMINER");
gameOver = true;
}
let snobLevel = 100 * (correctAnswers / totalQuestionsPerGame);
$(".your-score-label").text("Votre score :");
$(".snob-level").text(Math.round(snobLevel));
}
function updateBarText() {
let answeredCount = $(".is--answered").length;
let text = answeredCount === 1 ? "RÉPONDUE" : "RÉPONDUES";
$(".bar-text").text(`${answeredCount} / ${totalQuestionsPerGame} ${text}`);
}
$(document).on("click", ".quiz-link", function () {
clearTimeout(timeOut);
let parentItem = $(this).closest(".questions");
let isCorrect = $(this).find(".value").hasClass("true");
markQuestionAsAnswered(parentItem, isCorrect);
revealNextButton(parentItem);
$(this).addClass("is--selected");
updateUi();
});
$(document).on("click", ".frame-link", function () {
if (!gameOver) {
let currentQuestion = $(".questions.is--current-question");
let nextQuestion = currentQuestion.next(".questions");
currentQuestion.removeClass("is--current-question").hide();
nextQuestion.addClass("is--current-question").show();
$(".glass").removeClass("is--hidden");
$(".frame-art-img").addClass("hide-during-animation");
currentQuestionIndex++;
showCurrentQuestion();
} else {
showResults();
}
});
function markQuestionAsAnswered(questionElement, isCorrect) {
questionElement.find(".quiz-options").addClass("is--answered");
questionElement.find(".true").closest(".quiz-pill").addClass("is--correct");
if (isCorrect) {
questionElement.addClass("answered-correct");
}
setTimeout(function () {
questionElement.find(".frame-link, .move").css("transform", "scale(1.0)");
$(".frame-art-img").removeClass("hide-during-animation");
}, 500);
updateUi();
}
function showCurrentQuestion(callback) {
clearTimeout(timeOut);
let currentIndex = randomQuestions[currentQuestionIndex];
let currentQuestion = questionItems.eq(currentIndex);
questionItems.hide().removeClass("is--current-question");
currentQuestion.show().addClass("is--current-question");
showResponses(currentQuestion);
activateCounter(currentQuestionIndex + 1);
timeOut = setTimeout(function() {
if (!currentQuestion.find(".quiz-options").hasClass("is--answered")) {
markQuestionAsAnswered(currentQuestion, false);
revealNextButton(currentQuestion);
updateUi();
}
}, 10000);
if (callback) callback();
}
function showResponses(question) {
const quizOptions = question.find(".quiz-options");
const quizLinks = quizOptions.find(".quiz-link");
if (!userIsConnected()) {
const clonedLinks = quizLinks.clone();
shuffleArray(clonedLinks);
quizOptions.empty();
quizOptions.append(clonedLinks);
clonedLinks.css("transform", "scale(1.0)");
} else {
quizLinks.css("transform", "scale(1.0)");
}
}
function resetQuiz() {
gameOver = false;
$(".frame-link-text").text("SUIVANT");
$(".finish-card, .finish-button").hide();
$(".container.is--quiz .wrapper, .container.is--quiz .frame, .bar, .bar-text").show();
$(".section.is--bottom, .section.is--nav").removeClass("fade-away");
startQuiz();
}
function showResults() {
let correctAnswers = $(".answered-correct").length;
let points = correctAnswers * 10;
if (userIsConnected()) {
$(".finish").css("display", "flex");
$(".finish-card").show();
$(".finish-button").show();
if (defiId) {
firebase.firestore().collection('defis').doc(defiId).delete().then(() => {
localStorage.removeItem('selectedQuestionsSeed');
}).catch((error) => {
console.error("Erreur lors de la suppression du défi :", error);
});
}
$(".container.is--quiz .wrapper, .container.is--quiz .frame, .bar, .bar-text, .points").hide();
$(".finish-card .result-message").text(`Défi terminé! Vous avez répondu correctement à ${correctAnswers} questions sur ${totalQuestionsPerGame}.`);
$(".finish-button").text("RETOUR AU MENU");
$(".finish-button").off('click').click(function() {
window.location.href = "https://quiz-addict.webflow.io/user-home";
});
sendChallengeToPlayerB(false);
} else {
$(".finish-card .result-message").text(`Vous avez répondu correctement à ${correctAnswers} questions sur ${totalQuestionsPerGame}.`);
$(".finish-card .points").text(`Votre score : ${points}%`);
$(".container.is--quiz .wrapper, .container.is--quiz .frame, .bar, .bar-text, .points").hide();
$(".section.is--bottom, .section.is--nav").addClass("fade-away");
$(".finish").css("display", "flex");
$(".finish-card").show();
$(".finish-button").text("REJOUER");
$(".finish-button").show();
$(".finish-button").off('click').click(function() {
window.location.href = "https://quiz-addict.webflow.io/";
});
}
}
function getUIDDefied() {
return localStorage.getItem('uidDefied');
}

function sendChallengeToPlayerB(shouldShowResults = true) {
if (!userIsConnected()) {
console.error("User A is not connected!");
return;
}
const userA_UID = firebase.auth().currentUser.uid;
const userAScore = calculateScore();
const playerB_UID = getPlayerB_UID();
if(userA_UID === playerB_UID) {
return;
}
const selectedTheme = localStorage.getItem('selectedTheme');
const challengeData = {
uidDefiant: userA_UID,
uidDefied: playerB_UID,
questionsIndices: randomQuestions,
score: userAScore,
timestamp: firebase.firestore.Timestamp.now(),
status: "pending",
selectedTheme: selectedTheme,
seed: localStorage.getItem('selectedQuestionsSeed')
};
firebase.firestore().collection("defis").add(challengeData)
.then(() => {
localStorage.removeItem('selectedQuestionsSeed');
if (shouldShowResults) {
showResults();
}
})
.catch(error => {
console.error("Error sending challenge:", error);
if (shouldShowResults) {
showResults();
}
});
}
function calculateScore() {
const correctAnswers = $(".answered-correct").length;
const pointsPerAnswer = 10;
return correctAnswers * pointsPerAnswer;
}
$(".finish-button").click(function() {
$('.content').fadeOut('slow', function() {
resetQuiz();
setTimeout(function () {
window.location.href = "quiz-addict.webflow.io";
}, 100);
});
});
});
</script>
