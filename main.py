from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
# O CORS permite que o seu arquivo HTML local converse com a API Flask sem ser bloqueado
CORS(app)

# ==========================================
# CONFIGURAÇÃO E CRIAÇÃO DO BANCO DE DADOS
# ==========================================
def criar_banco():
    conexao = sqlite3.connect("passarinhos.db")
    cursor = conexao.cursor()

    # Criamos a tabela incluindo as colunas 'pai' e 'mae'
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passarinhos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        anilha TEXT UNIQUE NOT NULL,
        especie TEXT NOT NULL,
        sexo TEXT NOT NULL,
        pai TEXT,
        mae TEXT
    )
    """)
    conexao.commit()
    conexao.close()

criar_banco()


# ==========================================
# LISTAR PASSARINHOS (GET)
# ==========================================
@app.route("/passarinhos", methods=["GET"])
def listar_passarinhos():
    try:
        conexao = sqlite3.connect("passarinhos.db")
        cursor = conexao.cursor()
        cursor.execute("SELECT id, nome, anilha, especie, sexo, pai, mae FROM passarinhos")
        resultados = cursor.fetchall()
        conexao.close()

        passarinhos = []
        for p in resultados:
            passarinhos.append({
                "id": p[0],
                "nome": p[1],
                "anilha": p[2],
                "especie": p[3],
                "sexo": p[4],
                "pai": p[5] if p[5] else "",
                "mae": p[6] if p[6] else ""
            })

        return jsonify(passarinhos), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ==========================================
# CADASTRAR PASSARINHO (POST)
# ==========================================
@app.route("/passarinhos", methods=["POST"])
def cadastrar_passarinho():
    try:
        dados = request.get_json()

        # Validação básica
        if not dados.get("nome") or not dados.get("anilha"):
            return jsonify({"erro": "Nome e Anilha são obrigatórios"}), 400

        conexao = sqlite3.connect("passarinhos.db")
        cursor = conexao.cursor()
        
        cursor.execute("""
            INSERT INTO passarinhos (nome, anilha, especie, sexo, pai, mae)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            dados["nome"],
            dados["anilha"],
            dados["especie"],
            dados["sexo"],
            dados.get("pai", ""),
            dados.get("mae", "")
        ))

        conexao.commit()
        conexao.close()

        return jsonify({"mensagem": "Passarinho cadastrado com sucesso!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Essa anilha já está cadastrada no sistema."}), 400
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)