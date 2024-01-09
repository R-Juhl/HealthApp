# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    surname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(260), nullable=False)
    language = db.Column(db.String(5), default='en')
    user_version = db.Column(db.String(10), default=None)  # Options are: ??

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    age = db.Column(db.Integer)
    height = db.Column(db.Integer)  # Store height in cm
    fitness_level = db.Column(db.Integer)
    dietary_restrictions = db.Column(db.Text)
    health_conditions = db.Column(db.Text)
    goals = db.Column(db.Text)  # Store as a comma-separated string for different goals
    height_unit = db.Column(db.String(10), default="cm")  # "cm" or "inches"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "age": self.age,
            "height": self.height,
            "fitness_level": self.fitness_level,
            "dietary_restrictions": self.dietary_restrictions,
            "health_conditions": self.health_conditions,
            "goals": json.loads(self.goals) if self.goals else None,
            "height_unit": self.height_unit
        }

class UserThreads(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    thread_id = db.Column(db.String(100))
    title = db.Column(db.String(255))
    date_created = db.Column(db.DateTime, default=datetime.utcnow)