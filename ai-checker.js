const textInput = document.querySelector("#textInput");
const clearButton = document.querySelector("#clearButton");
const sampleButton = document.querySelector("#sampleButton");
const wordCount = document.querySelector("#wordCount");
const scoreValue = document.querySelector("#scoreValue");
const scoreLabel = document.querySelector("#scoreLabel");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const meterValue = document.querySelector("#meterValue");
const signalList = document.querySelector("#signalList");
const statWords = document.querySelector("#statWords");
const statSentences = document.querySelector("#statSentences");
const statAverage = document.querySelector("#statAverage");
const statRepeat = document.querySelector("#statRepeat");
const rewriteButton = document.querySelector("#rewriteButton");
const rewriteOutput = document.querySelector("#rewriteOutput");
const rewriteCount = document.querySelector("#rewriteCount");
const copyRewriteButton = document.querySelector("#copyRewriteButton");
const revisionTips = document.querySelector("#revisionTips");

const circumference = 2 * Math.PI * 66;

const sampleText = `In today's fast-paced digital world, effective communication plays a crucial role in shaping personal and professional success. Whether individuals are writing emails, preparing reports, or sharing ideas online, clarity and structure help ensure that messages are understood by a wide audience. Moreover, thoughtful writing can improve collaboration, reduce confusion, and create stronger connections between people. As technology continues to evolve, writers should balance efficiency with authenticity so their work remains useful, engaging, and meaningful.`;

const phraseSwaps = [
  [/\bin today's fast-paced digital world\b/gi, "these days"],
  [/\bplays a crucial role in\b/gi, "matters for"],
  [/\bit is important to note that\b/gi, "importantly"],
  [/\bmoreover\b/gi, "also"],
  [/\bfurthermore\b/gi, "also"],
  [/\badditionally\b/gi, "plus"],
  [/\btherefore\b/gi, "so"],
  [/\boverall\b/gi, "in the end"],
  [/\butilize\b/gi, "use"],
  [/\bfacilitate\b/gi, "help"],
  [/\bindividuals\b/gi, "people"],
  [/\bnumerous\b/gi, "many"],
  [/\bdemonstrates\b/gi, "shows"],
  [/\benhance\b/gi, "improve"],
  [/\bensure that\b/gi, "make sure"],
  [/\ba wide audience\b/gi, "more people"]
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getWords(text) {
  return text.toLowerCase().match(/\b[a-z][a-z'-]*\b/g) || [];
}

function getSentences(text) {
  return text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean);
}

function standardDeviation(values) {
  if (values.length < 2) return 0;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

function analyzeText(text) {
  const words = getWords(text);
  const sentences = getSentences(text);
  const wordTotal = words.length;
  const sentenceTotal = sentences.length;
  const uniqueWords = new Set(words);

  const sentenceLengths = sentences
    .map((sentence) => getWords(sentence).length)
    .filter(Boolean);

  const averageSentence = sentenceLengths.length
    ? sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceLengths.length
    : 0;

  const sentenceVariation = standardDeviation(sentenceLengths);
  const uniqueRatio = wordTotal ? uniqueWords.size / wordTotal : 0;
  const repeatRatio = wordTotal ? 1 - uniqueRatio : 0;

  const transitionWords = [
    "moreover",
    "furthermore",
    "additionally",
    "therefore",
    "overall",
    "ultimately",
    "however",
    "consequently",
    "in conclusion",
    "it is important",
    "plays a crucial role"
  ];

  const transitionHits = transitionWords.reduce((count, phrase) => {
    return count + (text.toLowerCase().includes(phrase) ? 1 : 0);
  }, 0);

  const longBalancedSentences = averageSentence >= 17 && averageSentence <= 28 ? 18 : 0;
  const lowVariation = sentenceVariation > 0 && sentenceVariation < 7 && sentenceTotal >= 4 ? 20 : 0;
  const repetition = repeatRatio > 0.46 ? 18 : repeatRatio > 0.38 ? 10 : 0;
  const polishedTransitions = clamp(transitionHits * 7, 0, 21);
  const punctuationUniformity = /[,;:]/.test(text) && sentenceVariation < 9 && sentenceTotal >= 5 ? 10 : 0;
  const shortTextPenalty = wordTotal < 50 ? -24 : wordTotal < 90 ? -8 : 0;

  const score = clamp(
    Math.round(
      longBalancedSentences +
      lowVariation +
      repetition +
      polishedTransitions +
      punctuationUniformity +
      shortTextPenalty +
      14
    ),
    0,
    99
  );

  return {
    score,
    wordTotal,
    sentenceTotal,
    averageSentence,
    repeatRatio,
    sentenceVariation,
    transitionHits,
    signals: buildSignals({
      wordTotal,
      averageSentence,
      sentenceVariation,
      repeatRatio,
      transitionHits,
      punctuationUniformity
    })
  };
}

function buildSignals(data) {
  if (data.wordTotal < 50) {
    return ["Add more text for a more useful estimate. Short samples are hard to classify."];
  }

  const signals = [];

  if (data.averageSentence >= 17 && data.averageSentence <= 28) {
    signals.push("Sentence length is consistently polished, a pattern common in generated explanatory writing.");
  } else {
    signals.push("Sentence length is less uniform, which often points toward more human variation.");
  }

  if (data.sentenceVariation < 7) {
    signals.push("Sentence rhythm has low variation across the sample.");
  } else {
    signals.push("Sentence rhythm varies noticeably across the sample.");
  }

  if (data.repeatRatio > 0.42) {
    signals.push("Vocabulary repeats at a relatively high rate.");
  } else {
    signals.push("Vocabulary variety is reasonably strong.");
  }

  if (data.transitionHits >= 2) {
    signals.push("Several formal transition phrases appear in the text.");
  } else {
    signals.push("Few formulaic transition phrases were found.");
  }

  return signals;
}

function describeScore(score, words) {
  if (words < 50) {
    return {
      label: "Too short",
      title: "More text needed",
      summary: "This sample is too short for a meaningful estimate. Paste at least 50 words for a better read."
    };
  }

  if (score >= 70) {
    return {
      label: "High",
      title: "Likely AI-assisted",
      summary: "The writing shows multiple patterns often found in AI-generated or heavily AI-polished text."
    };
  }

  if (score >= 42) {
    return {
      label: "Mixed",
      title: "Possibly AI-assisted",
      summary: "The result is mixed. Some signals look generated, while others look more naturally varied."
    };
  }

  return {
    label: "Low",
    title: "Likely human-written",
    summary: "The writing has enough variation and vocabulary movement to score lower on these AI-like patterns."
  };
}

function updateMeter(score) {
  const offset = circumference - (score / 100) * circumference;

  meterValue.style.strokeDasharray = `${circumference}`;
  meterValue.style.strokeDashoffset = `${offset}`;
  meterValue.style.stroke = score >= 70
    ? "var(--bad)"
    : score >= 42
      ? "var(--warn)"
      : "var(--good)";
}

function splitLongSentence(sentence) {
  const words = getWords(sentence);

  if (words.length < 26 || !sentence.includes(",")) {
    return sentence;
  }

  const parts = sentence.split(",");

  if (parts.length < 2) {
    return sentence;
  }

  const first = parts.shift().trim();
  const rest = parts.join(",").trim();

  if (first.length < 25 || rest.length < 25) {
    return sentence;
  }

  return `${first}. ${capitalize(rest)}`;
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function softenText(text) {
  let revised = text.trim().replace(/\s+/g, " ");

  phraseSwaps.forEach(([pattern, replacement]) => {
    revised = revised.replace(pattern, replacement);
  });

  revised = revised
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bthey are\b/gi, "they're")
    .replace(/\bwe are\b/gi, "we're");

  return revised
    .split(/(?<=[.!?])\s+/)
    .map(splitLongSentence)
    .map(capitalize)
    .join(" ")
    .replace(/\s+([,.!?])/g, "$1");
}

function buildRevisionTips(text) {
  const analysis = analyzeText(text);
  const tips = [];

  tips.push({
    title: "Add one real detail",
    body: "Include a specific class, job, project, moment, place, or example that only you would naturally know."
  });

  if (analysis.averageSentence >= 17) {
    tips.push({
      title: "Break the rhythm",
      body: "Mix one short sentence into the paragraph so every line does not sound equally polished."
    });
  }

  if (analysis.transitionHits > 0) {
    tips.push({
      title: "Use simpler links",
      body: "Replace formal transitions with plain connectors like also, but, so, or in my view."
    });
  }

  tips.push({
    title: "Show your stance",
    body: "Add one sentence that says what you actually think, what surprised you, or what you would do next."
  });

  return tips;
}

function renderRevisionTips(tips) {
  revisionTips.innerHTML = tips
    .map((tip) => `<li><strong>${tip.title}</strong>${tip.body}</li>`)
    .join("");
}

function rewriteDraft() {
  const text = textInput.value.trim();

  if (!text) {
    rewriteOutput.value = "";
    rewriteCount.textContent = "0 words";

    renderRevisionTips([
      {
        title: "Paste text first",
        body: "Add a paragraph above, then use Rewrite draft."
      }
    ]);

    return;
  }

  const revised = softenText(text);

  rewriteOutput.value = revised;
  rewriteCount.textContent = `${getWords(revised).length} words`;
  renderRevisionTips(buildRevisionTips(text));
}

function render() {
  const text = textInput.value.trim();
  const analysis = analyzeText(text);
  const description = describeScore(analysis.score, analysis.wordTotal);

  wordCount.textContent = `${analysis.wordTotal} ${analysis.wordTotal === 1 ? "word" : "words"}`;
  scoreValue.textContent = `${analysis.score}%`;
  scoreLabel.textContent = description.label;
  resultTitle.textContent = description.title;
  resultSummary.textContent = description.summary;

  statWords.textContent = analysis.wordTotal.toLocaleString();
  statSentences.textContent = analysis.sentenceTotal.toLocaleString();
  statAverage.textContent = analysis.averageSentence
    ? `${analysis.averageSentence.toFixed(1)} words`
    : "0";
  statRepeat.textContent = `${Math.round(analysis.repeatRatio * 100)}%`;

  signalList.innerHTML = analysis.signals
    .map((signal) => `<li>${signal}</li>`)
    .join("");

  updateMeter(analysis.score);
}

textInput.addEventListener("input", render);

clearButton.addEventListener("click", () => {
  textInput.value = "";
  textInput.focus();
  render();
});

sampleButton.addEventListener("click", () => {
  textInput.value = sampleText;
  render();
});

rewriteButton.addEventListener("click", rewriteDraft);

copyRewriteButton.addEventListener("click", async () => {
  if (!rewriteOutput.value.trim()) {
    return;
  }

  await navigator.clipboard.writeText(rewriteOutput.value);

  copyRewriteButton.textContent = "Copied";

  window.setTimeout(() => {
    copyRewriteButton.textContent = "Copy draft";
  }, 1200);
});

render();

renderRevisionTips([
  {
    title: "Start with your text",
    body: "Paste text above, check it, then rewrite a draft you can personally edit."
  }
]);