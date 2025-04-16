from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv
import openai
import os

# Load environment variable
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data["text"]
    input_lang = data["inputLang"]
    output_lang = data["outputLang"]

    if input_lang.lower() == output_lang.lower():
        prompt = (
            f"You are a medical assistant AI. Explain the following healthcare term or phrase in simple {input_lang}:\n\n{text}\n"
            f"Return in the format:\nExplanation: <your explanation>"
        )
    else:
        prompt = (
            f"You are a healthcare assistant AI.\n"
            f"Step 1: Explain the following medical term in {input_lang}.\n"
            f"Step 2: Translate that explanation into {output_lang}.\n\n"
            f"Return exactly in this format:\n"
            f"Explanation: <your explanation>\n\nTranslation: <your translated explanation>\n\n"
            f"Text: {text}"
        )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.4
        )
        output = response.choices[0].message.content
        return jsonify({"translatedText": output})
    except Exception as e:
        import traceback
        print("OpenAI API call failed:")
        traceback.print_exc()
        return jsonify({"translatedText": "Translation failed."}), 500

    except Exception as e:
        import traceback
        print(" OpenAI API call failed:")
        traceback.print_exc()
        return jsonify({"translatedText": "Translation failed."}), 500


if __name__ == "__main__":
    app.run(debug=True)
