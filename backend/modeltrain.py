import numpy as np
import pandas as pd
import re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import nltk
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from xgboost import XGBClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from flask import send_file
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)
nltk.download ('stopwords')
print (stopwords.words('english'))
twitter_data = pd.read_csv(r'C:\Users\adebo\FYP\backend\CyberBullying Comments Dataset.csv', encoding='ISO-8859-1')
print (twitter_data.shape)
print(twitter_data.head())
print(twitter_data['CB_Label'].value_counts())

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Define the stemming function
def stemming(content):
    port_stem = PorterStemmer()
    content = re.sub('[^a-zA-Z\s]', '', content)
    content = content.lower()
    words = content.split()
    stemmed_words = [port_stem.stem(word) for word in words if word not in stopwords.words('english')]
    stemmed_content = ' '.join(stemmed_words)
    return stemmed_content

# Example usage of the stemming function
# sample_text = "This is an example of a tweet that needs to be processed."
# processed_text = stemming(sample_text)
# print(processed_text)
twitter_data['stemmed_content'] = twitter_data['Text'].apply(stemming)
print(twitter_data.head())
X = twitter_data['stemmed_content'].values
Y = twitter_data['CB_Label'].values
print(X)
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.3, stratify=Y, random_state=2)
print(X_train)
vectorizer = TfidfVectorizer()
X_train = vectorizer.fit_transform(X_train)
X_test = vectorizer.transform(X_test)
print(X_train)

svm_model = SVC()
svm_model.fit(X_train, Y_train)
Y_pred_svm = svm_model.predict(X_test)
print("SVM Accuracy: ", accuracy_score(Y_test, Y_pred_svm))
print(classification_report(Y_test, Y_pred_svm))

nb_model = MultinomialNB()
nb_model.fit(X_train, Y_train)
Y_pred_nb = nb_model.predict(X_test)
print("Naive Bayes Accuracy: ", accuracy_score(Y_test, Y_pred_nb))
print(classification_report(Y_test, Y_pred_nb))

xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
xgb_model.fit(X_train, Y_train)
Y_pred_xgb = xgb_model.predict(X_test)
print("XGBoost Accuracy: ", accuracy_score(Y_test, Y_pred_xgb))
print(classification_report(Y_test, Y_pred_xgb))

knn_model = KNeighborsClassifier()
knn_model.fit(X_train, Y_train)
Y_pred_knn = knn_model.predict(X_test)
print("K-Nearest Neighbors Accuracy: ", accuracy_score(Y_test, Y_pred_knn))
print(classification_report(Y_test, Y_pred_knn))

rf_model = RandomForestClassifier()
rf_model.fit(X_train, Y_train)
Y_pred_rf = rf_model.predict(X_test)
print("Random Forest Accuracy: ", accuracy_score(Y_test, Y_pred_rf))
print(classification_report(Y_test, Y_pred_rf))

dt_model = DecisionTreeClassifier()
dt_model.fit(X_train, Y_train)
Y_pred_dt = dt_model.predict(X_test)
print("Decision Tree Accuracy: ", accuracy_score(Y_test, Y_pred_dt))
print(classification_report(Y_test, Y_pred_dt))

@app.route('/analyze_csv', methods=['POST'])
def analyze_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        tweet_data = pd.read_csv(file_path)

        if 'Text' not in tweet_data.columns:
            return jsonify({'error': 'The CSV file should contain a "Text" column'}), 400
        
        tweet_data['stemmed_content'] = tweet_data['Text'].apply(stemming)
        tweet_data_vectorized = vectorizer.transform(tweet_data['stemmed_content'])
        tweet_data['CB_Label'] = nb_model.predict(tweet_data_vectorized)

        output_file_path = os.path.join(UPLOAD_FOLDER, 'analyzed_' + filename)
        tweet_data[['Text', 'CB_Label']].to_csv(output_file_path, index=False)

        return send_file(output_file_path, mimetype='text/csv', as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/')
def home():
    return "Welcome to the Cyberbullying Detection API!"

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.json['text']
    processed_text = stemming(input_data)  
    transformed_text = vectorizer.transform([processed_text])  
    prediction = nb_model.predict(transformed_text)  
    response = {'prediction': int(prediction[0])} 
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)