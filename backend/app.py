# app.py:
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer as Serializer
from datetime import datetime, timedelta
from modules.models import db, User

import openai
client = openai.OpenAI(
  api_key = os.environ.get("OPENAI_API_KEY_AIHEALTHCOACH")
)

app = Flask(__name__)
cors_origin = os.environ.get("CORS_ORIGIN", "http://localhost:3000")
CORS(app, origins=[cors_origin])

# Database configuration (DigitalOcean hosting)
postgres_user = os.environ.get("POSTGRES_USER_HEALTHAPP")
postgres_pw = os.environ.get("POSTGRES_PW_HEALTHAPP")
postgres_host = os.environ.get("POSTGRES_HOST_HEALTHAPP")
postgres_port = os.environ.get("POSTGRES_PORT_HEALTHAPP")
postgres_db = os.environ.get("POSTGRES_DB_HEALTHAPP")
print("DB User:", postgres_user)
print("DB Password:", postgres_pw)
print("DB Host:", postgres_host)
print("DB Port:", postgres_port)
print("DB Name:", postgres_db)
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{postgres_user}:{postgres_pw}@{postgres_host}:{postgres_port}/{postgres_db}?sslmode=require'

app.config['SECRET_KEY'] = os.environ.get("SECRET_TOKEN_KEY_HEALTHAPP")

# Initialize SQLAlchemy with the app
db.init_app(app)

with app.app_context():
    db.drop_all() # For dev to delete all tables and create them from scratch
    db.create_all()

@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.json
    print("Received data:", data)
    hashed_password = generate_password_hash(data['password']) # Hash the password
    new_user = User(
        name=data['name'],
        surname=data['surname'],
        email=data['email'],
        password=hashed_password
    )
    db.session.add(new_user)
    try:
        db.session.commit()
        print(f"User created successfully: {new_user.name} {new_user.surname}")
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {e}")  # Log any error
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        # Correct password
        expiration_time = datetime.utcnow() + timedelta(hours=1)  # Expires 1 hour from now
        s = Serializer(app.config['SECRET_KEY'])
        token = s.dumps({'user_id': user.id, 'exp': expiration_time.timestamp()})
        return jsonify({"token": token, "user": user.name, "user_id": user.id}), 200
    else:
        # Incorrect password
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/verify_token', methods=['POST'])
def verify_token():
    token = request.json.get('token')
    s = Serializer(app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
        # Check if token is expired
        if datetime.utcnow().timestamp() > data['exp']:
            return jsonify({"error": "Token expired"}), 401
        user = User.query.get(data['user_id'])
        if user:
            return jsonify({
                "user": user.name, 
                "user_id": user.id, 
                "user_version": user.user_version
            }), 200
        else:
            return jsonify({"user": user.name, "user_id": user.id}), 200
    except:
        return jsonify({"error": "Invalid token"}), 401

@app.route('/update_language', methods=['POST'])
def update_language():
    data = request.json
    user_id = data['user_id']
    language = data['language']
    print("user_id:", user_id)
    print("language_id:", language)

    user = User.query.get(user_id)
    if user:
        user.language = language
        db.session.commit()
        return jsonify({"message": "Language updated successfully"}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/get_language', methods=['POST'])
def get_language():
    user_id = request.json.get('user_id')
    user = User.query.get(user_id)
    if user:
        return jsonify({"language": user.language}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/update_user_version', methods=['POST'])
def update_user_version():
    if not request.is_json:
        return jsonify({"error": "Invalid request"}), 400

    data = request.json
    user_id = data.get('user_id')
    user_version = data.get('user_version')

    user = User.query.get(user_id)
    if user:
        user.user_version = user_version
        db.session.commit()
        return jsonify({"message": "User version updated successfully"}), 200
    return jsonify({"error": "User not found"}), 404


if __name__ == '__main__':
    app.run(debug=True)
