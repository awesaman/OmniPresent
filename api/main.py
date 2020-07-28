"""Flask API."""
from flask import Flask
from flask import request, jsonify
from summarize import noun1
from flask_cors import CORS
from googletrans import Translator
app = Flask(__name__)
CORS(app)

translator = Translator()

@app.route('/', methods=['GET'])
def index():
   print(request.values)
   return jsonify(noun1(request.values.get('sentence')))

@app.route('/translate', methods=['GET'])
def trans():
   translated = translator.translate(request.values.get('sentence')).text
   print(translated)
   return translated

if __name__ == '__main__':
   app.run()
