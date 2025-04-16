function startSpeech() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const inputLang = document.getElementById("inputLang").value;
    const outputLang = document.getElementById("outputLang").value;
    recognition.lang = inputLang.toLowerCase().slice(0, 2);
  
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
  
        // Show/hide translated box if needed
        const isSameLang = inputLang === outputLang;
        document.getElementById("translatedBox").style.display = isSameLang ? "none" : "block";
  
      } catch (error) {
        console.error("Fetch failed:", error);
        document.getElementById("explanationText").value = "Translation failed.";
        document.getElementById("translatedText").value = "";
      }
    };
  
    recognition.start();
  }
  
  function speakTranslated() {
    const text = document.getElementById("translatedText").value;
    const lang = document.getElementById("outputLang").value.toLowerCase().slice(0, 2);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
  