$(document).ready(function () {
    const quizzes = [
        { id: 1, title: "LE XXième siècle", image: "dates20.jpg", jsonFile: "quizz/quizzdates20.json" },
        { id: 2, title: "Méandres d'internet", image: "internet.jpg", jsonFile: "quizz/quizzinternet.json" },
        { id: 3, title: "Javascript", image: "javascript.png", jsonFile: "quizz/quizzjavascript.json" },
        { id: 4, title: "Microsoft", image: "microsoft.jpg", jsonFile: "quizz/quizzmicrosoft.json" },
        { id: 5, title: "Nintendo", image: "nintendo.jpg", jsonFile: "quizz/quizznintendo.json" },
        { id: 6, title: "Trouver le Nombre", image: "nombres.jpg", jsonFile: "quizz/quizznombres.json" },
        { id: 7, title: "PHP", image: "php.jpg", jsonFile: "quizz/quizzphp.json" },
        { id: 8, title: "Application web", image: "web.jpg", jsonFile: "quizz/quizzweb.json" }
    ];

    let selectedQuiz = null;
    let selectedLevel = null;
    let quizData = null;
    let currentQuestionIndex = 0;
    let userName = "";
    let userScore = 0;

    // Générer les quizz
    function generateQuizzes() {
        quizzes.forEach((quiz, index) => {
            const quizHtml = `
                <div class="col-md-2 quiz-item" data-id="${quiz.id}">
                    <div class="quiz-title">${quiz.title}</div>
                    <img src="img/${quiz.image}" alt="${quiz.title}" class="quiz-img">
                    <div class="level-selector">
                        <label>
                            <input type="radio" name="level${quiz.id}" value="Débutant"> Débutant
                        </label>
                        <label>
                            <input type="radio" name="level${quiz.id}" value="Confirmé"> Confirmé
                        </label>
                        <label>
                            <input type="radio" name="level${quiz.id}" value="Expert"> Expert
                        </label>
                    </div>
                </div>
            `;

            if (index < 4) {
                $("#quizRow1").append(quizHtml);
            } else {
                $("#quizRow2").append(quizHtml);
            }
        });
    }

    // Charger les données du quiz
    function loadQuizData(quizId) {
        const selectedQuizData = quizzes.find(q => q.id === quizId);

        if (selectedQuizData && selectedQuizData.jsonFile) {
            $.getJSON(selectedQuizData.jsonFile, function (data) {
                quizData = data.quizz;
                console.log(quizData);
            });
        }
    }

    // Afficher une question à la fois avec drag-and-drop
    function displayQuizQuestions(level) {
        const questions = quizData[level.toLowerCase()];
        const question = questions[currentQuestionIndex];

        $(".quiz-title-section").html(`<h2 class="mb-5" style="color: white;font-family: 'Anton SC', sans-serif;">${selectedQuiz} - Niveau ${selectedLevel}</h2>`);
        $(".question-text").html(`
            <h4 class="mb-5" style="color: black;font-family: 'Anton SC', sans-serif;text-align : center;">
        <span style="color: white;font-family: 'Anton SC', sans-serif;"> Question ${currentQuestionIndex + 1}</span>: ${question.question}
            </h4>
        `);

        const optionsHtml = question.propositions.map(option => `
            <div class="answer-option border border-warning p-2 m-1" draggable="true" data-answer="${option}">
                ${option}
            </div>
        `).join('');

        $(".answer-options").html(`<div class="row">${optionsHtml}</div>`);

        $(".anecdote").text("").removeClass("valid invalid");
        $(".drop-zone").removeClass("valid invalid").text("Posez votre réponse ici !!!");

        $(".answer-option").on("dragstart", function (e) {
            e.originalEvent.dataTransfer.setData("text", $(this).data("answer"));
        });

        $(".drop-zone").on("dragover", function (e) {
            e.preventDefault();
        });

        $(".drop-zone").on("drop", function (e) {
            e.preventDefault();
            const answer = e.originalEvent.dataTransfer.getData("text");
            const correctAnswer = question.réponse;

            if (answer === correctAnswer) {
                $(this).addClass("valid").text(answer);
                $(`[data-answer="${answer}"]`).addClass("bg-success text-white");
                $(".anecdote").text("Anecdote : " + question.anecdote).show();
                userScore++;
            } else {
                $(this).addClass("invalid").text(answer);
                $(`[data-answer="${correctAnswer}"]`).addClass("bg-success text-white");
                $(".anecdote").hide();
            }

            $(".answer-option").off("dragstart");
            $(".drop-zone").off("dragover drop");
        });
    }

    // Générer les quizzes au chargement
    generateQuizzes();

    // Gérer la sélection de quiz et niveau
    $(".quiz-container").on("change", "input[type='radio']", function () {
        const quizItem = $(this).closest(".quiz-item");
        selectedQuiz = quizItem.find(".quiz-title").text();
        selectedLevel = $(this).val();

        const quizId = quizItem.data("id");
        loadQuizData(quizId);

        $("#nameModal").modal("show");
    });

    // Confirmer le prénom
    $("#confirmName").on("click", function () {
        userName = $("#userName").val().trim();

        if (userName === "") {
            alert("Veuillez entrer votre prénom !");
            return;
        }

        $(".quiz-container").addClass("d-none");
        $(".recap-page").removeClass("d-none");
        $("#nameModal").modal("hide");

        const recapText = `
        <p style="font-family: 'Anton SC', sans-serif; font-size:30px;color: white;">${selectedQuiz} - Niveau ${selectedLevel}</p>
        <p style= "font-size:30px";><strong>${userName}</strong>, <span style="font-family: 'Anton SC', sans-serif;font-size:30px ;color: white;">vous allez pouvoir démarrer ce quiz !</span></p>
        <img src="img/${quizzes.find(q => q.title === selectedQuiz).image}" alt="${selectedQuiz}" class="quiz-img" style="border: 8px solid white;border-radius:15px;">
    `;
        $(".recap-content").html(recapText);
    });

    // Démarrer le quiz
    $("#startQuiz").on("click", function () {
        $(".recap-page").addClass("d-none");
        $(".quiz-container").addClass("d-none");
        $(".quiz-page").removeClass("d-none");

        currentQuestionIndex = 0;
        userScore = 0;
        displayQuizQuestions(selectedLevel);
    });

    // Gérer le bouton "suivant"
    $("#nextQuestion").on("click", function () {
        currentQuestionIndex++;
        const questions = quizData[selectedLevel.toLowerCase()];

        if (currentQuestionIndex < questions.length) {
            displayQuizQuestions(selectedLevel);
        } else {
            $(".quiz-page").addClass("d-none");
            $(".recap-page").removeClass("d-none");

            $("#startQuiz").addClass("d-none");

            const recapText = `
                <p style="font-size:40px ;font-family: 'Anton SC', sans-serif; color: white;">${selectedQuiz} - Niveau ${selectedLevel}</p>
                <p style= "font-size:30px";><strong>${userName}</strong>,<span style="font-family: 'Anton SC', sans-serif;font-size:30px; color: white;"> vous avez obtenu le score de :</span> <span style="font-size: 1.2em;font-family: 'Anton SC'; color: orange;">${userScore} / 10</span></p>
                <button class="btn btn-warning" id="restartQuiz">Accueil</button>
            `;
            $(".recap-content").html(recapText);
        }
    });

    // Revenir à l'accueil
    $(document).on("click", "#restartQuiz", function () {
        $(".recap-page").addClass("d-none");
        $(".quiz-container").removeClass("d-none");

        $(".quiz-item input[type='radio']").prop("checked", false);

        $("#startQuiz").removeClass("d-none"); // Réaffiche le bouton "Démarrer"
    });
});