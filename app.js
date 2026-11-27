(function () {
  "use strict";

  const grid = document.getElementById("listing-grid");
  const form = document.getElementById("match-form");
  const knownLanguage = document.getElementById("known-language");
  const practiceLanguage = document.getElementById("practice-language");
  const chatDuration = document.getElementById("chat-duration");
  const status = document.getElementById("match-status");
  const emptyMessage = document.getElementById("empty-message");
  const pricingGrid = document.getElementById("pricing-grid");
  const planNotice = document.getElementById("plan-notice");
  const practicePanel = document.getElementById("practice-panel");
  const pointsTotal = document.getElementById("points-total");
  const pointsStorageKey = "lingualink-practice-points";
  const pointsAward = 10;

  let points = 0;
  let canPersistPoints = true;
  let activeChat = null;

  try {
    const savedPoints = localStorage.getItem(pointsStorageKey);
    if (savedPoints !== null) {
      const parsedPoints = Number(savedPoints);
      if (Number.isSafeInteger(parsedPoints) && parsedPoints >= 0) {
        points = parsedPoints;
      } else {
        canPersistPoints = false;
      }
    }
  } catch (error) {
    canPersistPoints = false;
  }
  pointsTotal.textContent = points;

  function persistPoints() {
    if (!canPersistPoints) {
      return false;
    }
    try {
      localStorage.setItem(pointsStorageKey, String(points));
      return true;
    } catch (error) {
      canPersistPoints = false;
      return false;
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes + ":" + String(remainingSeconds).padStart(2, "0");
  }

  function closePracticePanel() {
    if (activeChat && activeChat.intervalId) {
      window.clearInterval(activeChat.intervalId);
    }
    activeChat = null;
    practicePanel.replaceChildren();
    practicePanel.hidden = true;
  }

  function finishChat(chat) {
    if (chat.phase !== "active") {
      return;
    }
    window.clearInterval(chat.intervalId);
    chat.intervalId = null;
    chat.phase = "consent";
    renderPracticePanel(chat);
  }

  function makeConsentSelect(label, name, isDemoPartner) {
    const field = document.createElement("label");
    field.className = "consent-choice";
    field.textContent = label;

    const select = document.createElement("select");
    select.name = name;
    select.required = true;
    [
      { value: "", label: "Choose an answer" },
      { value: "yes", label: "Yes, let's continue" },
      { value: "no", label: "Not this time" }
    ].forEach(function (choice) {
      const option = document.createElement("option");
      option.value = choice.value;
      option.textContent = choice.label;
      select.appendChild(option);
    });
    if (isDemoPartner) {
      select.setAttribute("aria-describedby", "partner-choice-note");
    }
    field.appendChild(select);
    return field;
  }

  function renderPracticePanel(chat) {
    practicePanel.replaceChildren();
    practicePanel.hidden = false;

    const eyebrow = document.createElement("p");
    eyebrow.className = "practice-eyebrow";
    eyebrow.textContent = chat.phase === "consent" || chat.phase === "complete"
      ? "PRACTICE COMPLETE"
      : "DEMO PRACTICE ROOM";
    const heading = document.createElement("h3");
    heading.textContent = chat.phase === "consent" || chat.phase === "complete"
      ? "Keep the conversation going?"
      : chat.duration + "-minute language swap with " + chat.person.name;
    const description = document.createElement("p");
    description.className = "practice-description";

    if (chat.phase === "ready") {
      description.textContent = "Take turns practicing, then see if you both want to keep learning together.";
      const start = document.createElement("button");
      start.type = "button";
      start.className = "button button-dark";
      start.textContent = "Start " + chat.duration + "-minute chat";
      start.addEventListener("click", function () {
        chat.phase = "active";
        renderPracticePanel(chat);
        chat.intervalId = window.setInterval(function () {
          chat.secondsLeft -= 1;
          const timer = practicePanel.querySelector(".chat-timer");
          if (timer) {
            timer.textContent = formatTime(chat.secondsLeft);
          }
          if (chat.secondsLeft <= 0) {
            finishChat(chat);
          }
        }, 1000);
      });

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "text-button";
      cancel.textContent = "Not now";
      cancel.addEventListener("click", closePracticePanel);
      practicePanel.append(eyebrow, heading, description, start, cancel);
      return;
    }

    if (chat.phase === "active") {
      description.textContent = "This is a timed demo chat; no video or audio is connected.";
      const timer = document.createElement("p");
      timer.className = "chat-timer";
      timer.setAttribute("role", "timer");
      timer.textContent = formatTime(chat.secondsLeft);
      const finish = document.createElement("button");
      finish.type = "button";
      finish.className = "button button-dark";
      finish.textContent = "End chat";
      finish.addEventListener("click", function () {
        finishChat(chat);
      });
      practicePanel.append(eyebrow, heading, description, timer, finish);
      return;
    }

    if (chat.phase === "consent") {
      description.textContent = "Earn +" + pointsAward + " points when you both choose to continue practicing together.";
      const consentForm = document.createElement("form");
      consentForm.className = "consent-form";
      consentForm.append(
        makeConsentSelect("Your choice", "your-choice", false),
        makeConsentSelect(chat.person.name + "'s choice", "partner-choice", true)
      );
      const partnerNote = document.createElement("p");
      partnerNote.className = "partner-choice-note";
      partnerNote.id = "partner-choice-note";
      partnerNote.textContent = "Partner choice is simulated for this demo.";
      const confirm = document.createElement("button");
      confirm.type = "submit";
      confirm.className = "button button-dark";
      confirm.textContent = "Confirm choices";
      consentForm.append(partnerNote, confirm);
      consentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const bothWantToContinue = consentForm.querySelector('[name="your-choice"]').value === "yes"
          && consentForm.querySelector('[name="partner-choice"]').value === "yes";
        chat.pointsEarned = bothWantToContinue;
        chat.phase = "complete";
        if (bothWantToContinue) {
          points += pointsAward;
          pointsTotal.textContent = points;
          chat.pointsSaved = persistPoints();
        }
        renderPracticePanel(chat);
      });
      practicePanel.append(eyebrow, heading, description, consentForm);
      return;
    }

    description.textContent = chat.pointsEarned
      ? "You both chose to continue. +" + pointsAward + " points earned! Your balance is " + points + "."
      : "No points this time — both people need to opt in to keep practicing.";
    practicePanel.append(eyebrow, heading, description);
    if (chat.pointsEarned && !chat.pointsSaved) {
      const storageNote = document.createElement("p");
      storageNote.className = "partner-choice-note";
      storageNote.textContent = "Points are available during this visit, but couldn't be saved in this browser.";
      practicePanel.appendChild(storageNote);
    }
  }

  function makePartnerCard(person) {
    const card = document.createElement("article");
    card.className = "partner-card";

    const top = document.createElement("div");
    top.className = "partner-card-top";
    const avatar = document.createElement("div");
    avatar.className = "partner-avatar avatar-" + person.color;
    avatar.textContent = person.initials;
    avatar.setAttribute("aria-hidden", "true");
    const location = document.createElement("span");
    location.className = "partner-location";
    location.textContent = person.location;
    top.append(avatar, location);

    const name = document.createElement("h3");
    name.textContent = person.name;
    const level = document.createElement("span");
    level.className = "level-tag";
    level.textContent = person.level + " level";
    const note = document.createElement("p");
    note.className = "partner-note";
    note.textContent = person.note;

    const languages = document.createElement("div");
    languages.className = "partner-languages";
    const learns = document.createElement("span");
    learns.className = "language-tag language-learns";
    learns.textContent = "Learning " + person.practices.join(", ");
    const teaches = document.createElement("span");
    teaches.className = "language-tag";
    teaches.textContent = "Speaks " + person.knows.join(", ");
    languages.append(learns, teaches);

    const invite = document.createElement("button");
    invite.type = "button";
    invite.className = "partner-invite";
    invite.textContent = "Start " + chatDuration.value + "-min chat";
    invite.addEventListener("click", function () {
      if (activeChat && activeChat.intervalId) {
        window.clearInterval(activeChat.intervalId);
      }
      activeChat = {
        person: person,
        duration: Number(chatDuration.value),
        secondsLeft: Number(chatDuration.value) * 60,
        phase: "ready",
        intervalId: null,
        pointsEarned: false,
        pointsSaved: false
      };
      status.textContent = "A timed demo chat is ready; no invitation was sent.";
      renderPracticePanel(activeChat);
      practicePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    card.append(top, name, level, note, languages, invite);
    return card;
  }

  function renderMatches() {
    const speak = knownLanguage.value;
    const practice = practiceLanguage.value;
    const matches = LISTINGS.filter(function (person) {
      return person.knows.includes(practice) && person.practices.includes(speak);
    });

    grid.replaceChildren.apply(grid, matches.map(makePartnerCard));
    emptyMessage.hidden = matches.length > 0;
    if (activeChat) {
      closePracticePanel();
    }
    status.textContent = matches.length
      ? matches.length + (matches.length === 1 ? " potential partner" : " potential partners") + " speak " + practice + " and are practicing " + speak + "."
      : "";
  }

  function makePlanCard(plan) {
    const card = document.createElement("article");
    card.className = "price-card" + (plan.popular ? " price-card-popular" : "");

    if (plan.popular) {
      const badge = document.createElement("span");
      badge.className = "popular-badge";
      badge.textContent = "MOST POPULAR";
      card.appendChild(badge);
    }

    const name = document.createElement("h3");
    name.textContent = plan.name;
    const description = document.createElement("p");
    description.className = "plan-description";
    description.textContent = plan.description;
    const price = document.createElement("p");
    price.className = "plan-price";
    price.textContent = "$" + plan.price;
    const perMonth = document.createElement("span");
    perMonth.textContent = "/ month";
    price.appendChild(perMonth);

    const features = document.createElement("ul");
    features.className = "plan-features";
    plan.features.forEach(function (feature) {
      const item = document.createElement("li");
      item.textContent = feature;
      features.appendChild(item);
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = plan.popular ? "button button-dark plan-button" : "button button-outline plan-button";
    button.textContent = "Choose " + plan.name;
    button.addEventListener("click", function () {
      planNotice.textContent = plan.name + " ($" + plan.price + "/month) selected for this demo. No payment is processed.";
    });

    card.append(name, description, price, features, button);
    return card;
  }

  chatDuration.addEventListener("change", function () {
    grid.querySelectorAll(".partner-invite").forEach(function (button) {
      button.textContent = "Start " + chatDuration.value + "-min chat";
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    renderMatches();
  });

  pricingGrid.replaceChildren.apply(pricingGrid, PLANS.map(makePlanCard));
  renderMatches();
})();
