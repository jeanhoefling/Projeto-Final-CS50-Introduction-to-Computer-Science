import os
import sqlite3
from flask import Flask, flash, redirect, render_template, request

app = Flask(__name__)

# Database
conn = sqlite3.connect("churros.db", check_same_thread=False)
db = conn.cursor()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/vendas", methods=["GET", "POST"])
def vendas():
    if request.method == "POST":
        return render_template("vendas.html")
    else:
        return render_template("vendas.html")
    
if __name__ == "__main__":
    app.run(debug=True)