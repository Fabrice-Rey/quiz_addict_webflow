<script>
  $(document).ready(function () {
    const questionItems = $(".questions");
    const totalQuestions = questionItems.length;
    let gameOver = false;
    let randomQuestions = [];
    let currentQuestionIndex = 0;
    const totalQuestionsPerGame = 10;

    $(".frame-link-text").on("click", function () {
      if (!gameOver) {
        let currentQuestion = $(".questions.is--current-question");
        let nextQuestion = currentQuestion.next(".questions");

        currentQuestion.removeClass("is--current-question").hide();
        nextQuestion.addClass("is--current-question").show();

        $(".glass").removeClass("is--hidden");
        $(".frame-art-img").addClass("hide-during-animation");
        loadAnimation();
        currentQuestionIndex++;
        showResponses(nextQuestion);

        timePassed = 0;
      } else {
        $(".frame-link-text").text("TERMINER");
        $(".finish-button-text").text("REJOUER");
        $(".finish-button").show();
        showResults();
        currentQuestionIndex = 0;

        timePassed = 0;
      }

      update();
    });

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function generateRandomQuestions() {
      randomQuestions = [];
      while (randomQuestions.length < totalQuestionsPerGame) {
        let randomIndex = Math.floor(Math.random() * totalQuestions);
        if (!randomQuestions.includes(randomIndex)) {
          randomQuestions.push(randomIndex);
        }
      }
    }

    function startQuiz() {
      generateRandomQuestions();
      questionItems.hide();
      showCurrentQuestion();
      $(".bar-total").text(totalQuestionsPerGame);
    }

    startQuiz();

    function updateUi() {
      $(".bar-answered").text($(".is--answered").length);
      let progress = 100 * ($(".is--answered").length / totalQuestionsPerGame);
      $(".bar-fill").css("width", progress + "%");
      let correctAnswers = $(".answered-correct").length;
      let points = correctAnswers * 25;
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

    $(document).on("click", ".quiz-link", function () {
      let parentItem = $(this).closest(".questions");
      $(".glass").addClass("is--hidden");
      $(this).closest(".quiz-options").addClass("is--answered");
      setTimeout(function () {
        parentItem.find(".frame-link, .move").css("transform", "scale(1.0)");
        $(".frame-art-img").removeClass("hide-during-animation");
      }, 500);
      if ($(this).find(".value").hasClass("true")) {
        parentItem.addClass("answered-correct");
      }
      parentItem.find(".true").closest(".quiz-pill").addClass("is--correct");
      $(this).addClass("is--selected");
      updateUi();
    });

    $(document).on("click", ".frame-link", function () {
      if (gameOver == false) {
        let currentQuestion = $(".questions.is--current-question");
        let nextQuestion = currentQuestion.next(".questions");

        currentQuestion.removeClass("is--current-question").hide();
        nextQuestion.addClass("is--current-question").show();

        $(".glass").removeClass("is--hidden");
        $(".frame-art-img").addClass("hide-during-animation");
        loadAnimation();
        currentQuestionIndex++;
        showResponses(nextQuestion);
      } else {
        $(".frame-link-text").text("TERMINER");
        $(".finish-button-text").text("REJOUER");
        $(".finish-button").show();
        showResults();
        currentQuestionIndex = 0;
      }
    });

    function showCurrentQuestion() {
      let currentIndex = randomQuestions[currentQuestionIndex];
      let currentQuestion = questionItems.eq(currentIndex);
      questionItems.hide().removeClass("is--current-question");
      currentQuestion.show().addClass("is--current-question");
      showResponses(currentQuestion);
    }

    function showResponses(question) {
      const quizOptions = question.find(".quiz-options");
      const quizLinks = quizOptions.find(".quiz-link");
      const clonedLinks = quizLinks.clone();
      shuffleArray(clonedLinks);
      quizOptions.empty();
      quizOptions.append(clonedLinks);
      clonedLinks.css("display", "flex");
    }

    var tricksWord = document.getElementsByClassName("quiz-heading");
    for (var i = 0; i < tricksWord.length; i++) {
      var wordWrap = tricksWord.item(i);
      wordWrap.innerHTML = wordWrap.innerHTML.replace(
        /(^|<\/?[^>]+>|\s+)([^\s<]+)/g,
        '$1<span class="tricksword">$2</span>'
      );
    }

    function loadAnimation() {
      var fadeUp = anime.timeline({
        loop: false,
        autoplay: false,
        complete: function () {
          $(".frame-art-img").removeClass("hide-during-animation");
        },
      });

      fadeUp.add({
        targets: ".is--current-question .tricksword",
        translateY: [100, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 500,
        delay: (el, i) => 50 + 20 * i,
      });

      var fadeUp2 = anime.timeline({
        loop: false,
        autoplay: false,
        begin: function () {
          $(".quiz-link").css("display", "flex");
        },
      });

      fadeUp2.add({
        targets: ".quiz-options",
        translateY: [100, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 600,
        delay: (el, i) => 100 + 60 * i,
      });

      var maxDuration = Math.max(fadeUp.duration, fadeUp2.duration);
      fadeUp.play();
      fadeUp2.play();

      setTimeout(function () {
        $(".frame-art").show();
        $(".frame").css("opacity", "1");
      }, maxDuration);
    }

    loadAnimation($(".questions.is--current-question"));

    $(document).on("click", ".finish-button", function () {
      showResults();
    });

    function showResults() {
      let correctAnswers = $(".answered-correct").length;
      let points = correctAnswers * 25;
      $(".finish-card .result-message").text(
        `Vous avez répondu correctement à ${correctAnswers} questions sur ${totalQuestionsPerGame}.`
      );
      $(".finish-card .points").text(`Votre score : ${points}%`);

      $(".container.is--quiz .wrapper, .container.is--quiz .frame, .bar, .bar-text").hide();
      $(".section.is--bottom, .section.is--nav").addClass("fade-away");

      $(".finish").css("display", "flex");
      $(".finish-card").show();
      $(".finish-button").show();
    }

    function updateBarText() {
      let answeredCount = $(".is--answered").length;
      let text = answeredCount === 1 ? "RÉPONDUE" : "RÉPONDUES";
      $(".bar-text").text(`${answeredCount} / ${totalQuestionsPerGame} ${text}`);
    }
  });

  var width = 400,
    height = 400,
    timePassed = 0,
    timeLimit = 8;

  var fields = [
    {
      value: timeLimit,
      size: timeLimit,
      update: function () {
        return (timePassed = timePassed + 1);
      },
    },
  ];

  var nilArc = d3
    .arc()
    .innerRadius(width / 3 - 133)
    .outerRadius(width / 3 - 133)
    .startAngle(0)
    .endAngle(2 * Math.PI);

  var arc = d3
    .arc()
    .innerRadius(width / 3 - 55)
    .outerRadius(width / 3 - 25)
    .startAngle(0)
    .endAngle(function (d) {
      return (d.value / d.size) * 2 * Math.PI;
    });

  var svg = d3
    .select(".counter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var field = svg
    .selectAll(".field")
    .data(fields)
    .enter()
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .attr("class", "field");

  var back = field
    .append("path")
    .attr("class", "path path--background")
    .attr("d", nilArc);

  var path = field.append("path").attr("class", "path path--foreground");

  var label = field.append("text").attr("class", "label").attr("dy", ".35em");

  (function update() {
    field.each(function (d) {
      d.previous = d.value;
      d.value = d.update(timePassed);
    });

    path
      .transition()
      .ease(d3.easeElastic)
      .duration(500)
      .attrTween("d", arcTween);

    if (timeLimit - timePassed <= 3) pulseText();
    else
      label.text(function (d) {
        return d.size - d.value;
      });

    if (timePassed <= timeLimit)
      setTimeout(update, 1000 - (timePassed % 1000));
    else destroyTimer();
  })();

  function pulseText() {
    back.classed("pulse", true);
    label.classed("pulse", true);

    if (timeLimit - timePassed >= 0) {
      label
        .style("font-size", "120px")
        .attr("transform", "translate(0," + +4 + ")")
        .text(function (d) {
          return d.size - d.value;
        });
    }

    label
      .transition()
      .ease(d3.easeElastic)
      .duration(900)
      .style("font-size", "90px")
      .attr("transform", "translate(0," + -10 + ")");
  }

  function destroyTimer() {
    label
      .transition()
      .ease(d3.easeBack)
      .duration(700)
      .style("opacity", "0")
      .style("font-size", "5")
      .attr("transform", "translate(0," + -40 + ")")
      .each("end", function () {
        field.selectAll("text").remove();
      });

    path
      .transition()
      .ease(d3.easeBack)
      .duration(700)
      .attr("d", nilArc);

    back
      .transition()
      .ease(d3.easeBack)
      .duration(700)
      .attr("d", nilArc)
      .each("end", function () {
        field.selectAll("path").remove();
      });
  }

  function arcTween(b) {
    var i = d3.interpolate(
      {
        value: b.previous,
      },
      b
    );
    return function (t) {
      return arc(i(t));
    };
  }
</script>
