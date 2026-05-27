import os
import sqlite3
from flask import Flask, flash, redirect, render_template, request

app = Flask(__name__)

# Database
conn = sqlite3.connect("churros.db", check_same_thread=False)
db = conn.cursor()

db.execute('''CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome TEXT NOT NULL, 
            whatsapp TEXT, 
            tradicional INTEGER,
            recheado INTEGER,
            mini INTEGER,
            valor_total INTEGER,
            observacao TEXT,
            status TEXT)
           ''')

conn.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/vendas")
def vendas():
    return render_template("vendas.html")
    
@app.route("/pedidos", methods=["GET", "POST"])
def pedidos():
    if request.method == "POST":
        nome = request.form["nome"]
        whatsapp = request.form["whatsapp"]
        observacao = request.form["observacao"]

        produtos = {}
        produtos_lista = request.form.getlist("produtos[]")
        quantidades_lista = request.form.getlist("quantidades[]")
        for i in range (len(produtos_lista)):
            produtos[produtos_lista[i]] = int(quantidades_lista[i])

        valor_total = produtos.get("tradicional", 0) * 8 + produtos.get("recheado", 0) * 10 + produtos.get("mini", 0) * 5

        db.execute('''INSERT INTO pedidos 
                   (nome, whatsapp, tradicional, recheado, mini, valor_total, observacao, status) VALUES
                   (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        nome,
                        whatsapp,
                        produtos.get("tradicional", 0),
                        produtos.get("recheado", 0),
                        produtos.get("mini", 0),
                        valor_total,
                        observacao,
                        "Em andamento"
                        )
                    )
        conn.commit()

        return redirect("/pedidos")
    else:
        return render_template("pedidos.html")
    
if __name__ == "__main__":
    app.run(debug=True)