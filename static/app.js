let recordedAudioBlob = null;

function startSpeech() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const inputLang = document.getElementById("inputLang").value;
  const outputLang = document.getElementById("outputLang").value;
  recognition.lang = inputLang.toLowerCase().slice(0, 2);

  const isSameLang = inputLang === outputLang;
  document.getElementById("translatedBox").style.display = isSameLang ? "none" : "block";

  const mediaRecorderPromise = navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorderPromise.then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    let audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      document.getElementById("playOriginalAudioBtn").style.display = "inline-block";
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      document.getElementById("originalText").value = text;

      try {
        const response = await fetch("/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, inputLang, outputLang })
        });

        const data = await response.json();
        const fullOutput = data.translatedText || "Translation failed.";

        let explanation = fullOutput;
        let translation = "";

        if (fullOutput.includes("Translation:")) {
          const explainMatch = fullOutput.match(/Explanation:(.*?)Translation:/s);
          const translateMatch = fullOutput.match(/Translation:(.*)/s);
          explanation = explainMatch ? explainMatch[1].trim() : "";
          translation = translateMatch ? translateMatch[1].trim() : "";
        } else if (fullOutput.includes("Explanation:")) {
          const explainOnly = fullOutput.match(/Explanation:(.*)/s);
          explanation = explainOnly ? explainOnly[1].trim() : fullOutput;
        }

        document.getElementById("explanationText").value = explanation;
        document.getElementById("translatedText").value = translation;

      } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("translatedText").value = "Translation failed.";
      }
    };

    mediaRecorder.start();
    recognition.start();

    recognition.onend = () => {
      mediaRecorder.stop();
    };
  }).catch(error => {
    console.error("Mic access error:", error);
    alert("Microphone access is required.");
  });
}

function playOriginalAudio() {
  if (recordedAudioBlob) {
    const audioUrl = URL.createObjectURL(recordedAudioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } else {
    alert("No original audio recorded yet.");
  }
}

function speakTranslated() {
  const text = document.getElementById("translatedText").value;
  const lang = document.getElementById("outputLang").value.toLowerCase().slice(0, 2);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}
