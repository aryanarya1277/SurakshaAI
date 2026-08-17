# registerd data pythone backend tak bhejna
from flask import Flask, jsonify, request

#actual account save karne ke liye database add karna , taki register karne
#  pe database save ho our login time same account me entery ho

# flask me sqlite add karna ---------------------------------------

import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# upper ka part hai and     -------------       issi karan suraksh.db folder bana.
def init_db():
    conn = sqlite3.connect("suraksha.db")

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

from flask_cors import CORS

app = Flask(__name__)

CORS(app)


import os
from flask import Flask, jsonify, request, send_from_directory

@app.route("/")
def home():
    return send_from_directory(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "index.html"
    )


@app.route("/api/status")
def status():
    return jsonify({
        "success": True,
        "message": "Backend connected successfully",
        "project": "SurakshaAI"
    })

#----------------------------------------------------------------------------------------------
#register API add   , register data save

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    password_hash = generate_password_hash(password)

    try:
        conn = sqlite3.connect("suraksha.db")

        conn.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            """,
            (name, email, password_hash)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "User registered successfully"
        })

    except sqlite3.IntegrityError:

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409

    # api se login karna ----------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = sqlite3.connect("suraksha.db")
    conn.row_factory = sqlite3.Row

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if user and check_password_hash(user["password"], password):

        return jsonify({
            "success": True,
            "message": "Login successful",
            "name": user["name"],
            "email": user["email"]
        })

    return jsonify({
        "success": False,
        "message": "Invalid email or password"
    }), 401


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", debug=True, port=5000)