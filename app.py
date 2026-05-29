import os
import sqlite3
from flask import Flask, flash, redirect, render_template, request
from datetime import datetime

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
            data_pedido TIMESTAMP,
            status TEXT)
           ''')

conn.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/vendas")
def vendas():
    data_inicio = request.args.get("data_inicio")
    data_fim = request.args.get("data_fim")

    params = ["Concluído"]
    query1 = 'SELECT nome, tradicional, recheado, mini, valor_total, data_pedido FROM pedidos WHERE status = ?'
    query2 = 'SELECT SUM(tradicional), SUM(recheado), SUM(mini) FROM pedidos WHERE status = ?'
    query3 = 'SELECT SUM(valor_total) AS soma_valor, COUNT(*) AS num_pedidos, AVG(valor_total) AS ticket, SUM(tradicional + recheado + mini) AS num_produtos FROM pedidos WHERE status = ?'

    if data_inicio:
        params.append(data_inicio)
        query1 += ' AND date(data_pedido) >= ?'
        query2 += ' AND date(data_pedido) >= ?'
        query3 += ' AND date(data_pedido) >= ?'

    if data_fim:
        params.append(data_fim)
        query1 += ' AND date(data_pedido) <= ?'
        query2 += ' AND date(data_pedido) <= ?'
        query3 += ' AND date(data_pedido) <= ?'

    db.execute(query1, params)
    ultimas_vendas = db.fetchall()
    db.execute(query2, params)
    unidades = db.fetchall()
    db.execute(query3, params)
    data_cards = db.fetchall()
    return render_template("vendas.html", ultimas_vendas=ultimas_vendas, unidades=unidades, data_cards=data_cards, data_inicio=data_inicio, data_fim=data_fim)

@app.route("/pedidos", methods=["GET"])
def pedidos():
    db.execute('SELECT COUNT(*) as num_pedidos FROM pedidos WHERE status = (?)', ("Em andamento",))
    num_pedidos = int(db.fetchone()[0])
    db.execute('SELECT id, nome, whatsapp, tradicional, recheado, mini, valor_total, data_pedido FROM pedidos WHERE status = (?)', ("Em andamento",))
    items = db.fetchall()
    items = [list(item) for item in items]
    for item in items:
        item[7] = (datetime.now() - datetime.strptime(item[7], "%Y-%m-%d %H:%M:%S.%f")).total_seconds() / 60
    return render_template("pedidos.html", num_pedidos=num_pedidos, items=items)
    
@app.route("/cancelar-pedido", methods=["POST"])
def cancelarPedido():
    if request.method == "POST":
        id = request.form["id_pedido"]
        db.execute('DELETE FROM pedidos WHERE id = ?', (id,))
        conn.commit()
        return redirect("/pedidos")
    
@app.route("/concluir-pedido", methods=["POST"])
def concluirPedido():
    if request.method == "POST":
        id = request.form["id_pedido"]
        db.execute('UPDATE pedidos SET status = ? WHERE id = ?', ("Concluído", id))
        conn.commit()
        return redirect("/pedidos")
    
@app.route("/inserir-pedido", methods=["GET", "POST"])
def inserirPedido():
    if request.method == "POST":

        nome = request.form["nome"]
        if not nome.strip():
            return "Nome é obrigatório", 400
        
        whatsapp = request.form["whatsapp"].strip()
        if whatsapp and (len(whatsapp) != 11 or not whatsapp.isdigit()):
            return "Formato de whatsapp inválido", 400
        observacao = request.form["observacao"]

        produtos = {}
        produtos_lista = request.form.getlist("produtos[]")
        quantidades_lista = request.form.getlist("quantidades[]")
        for i in range (len(produtos_lista)):
            produtos[produtos_lista[i]] = int(quantidades_lista[i])

        valor_total = produtos.get("tradicional", 0) * 8 + produtos.get("recheado", 0) * 10 + produtos.get("mini", 0) * 5

        db.execute('''INSERT INTO pedidos 
                   (nome, whatsapp, tradicional, recheado, mini, valor_total, observacao, data_pedido, status) VALUES
                   (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        nome,
                        whatsapp,
                        produtos.get("tradicional", 0),
                        produtos.get("recheado", 0),
                        produtos.get("mini", 0),
                        valor_total,
                        observacao,
                        datetime.now(),
                        "Em andamento"
                        )
                    )
        conn.commit()

        return render_template("inserir-pedido.html")
    else:
        return render_template("inserir-pedido.html")
    
if __name__ == "__main__":
    app.run(debug=True)