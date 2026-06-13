const form = document.getElementById("form");
const lista = document.getElementById("lista");
const selectPai = document.getElementById("pai");
const selectMae = document.getElementById("mae");

const API_URL = "http://127.0.0.1:5000/passarinhos";

// Função para buscar dados da API e renderizar na tela
async function carregar() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        lista.innerHTML = "";
        
        // Limpa as opções anteriores deixando apenas o padrão
        selectPai.innerHTML = '<option value="">Nenhum (Pai Desconhecido)</option>';
        selectMae.innerHTML = '<option value="">Nenhum (Mãe Desconhecida)</option>';

        // 1º Passo: Preencher as caixas de seleção de Pai e Mãe
        data.forEach(p => {
            const option = document.createElement("option");
            option.value = p.anilha;
            option.textContent = `${p.nome} (${p.anilha})`;

            if (p.sexo === "Macho") {
                selectPai.appendChild(option);
            } else if (p.sexo === "Fêmea") {
                selectMae.appendChild(option);
            }
        });

        // 2º Passo: Montar a listagem na tela com a linhagem dos pais
        data.forEach(p => {
            const li = document.createElement("li");
            
            // Procura o nome do pai e da mãe na lista de dados usando a anilha
            const dadosPai = data.find(passaro => passaro.anilha === p.pai);
            const dadosMae = data.find(passaro => passaro.anilha === p.mae);

            const nomePai = dadosPai ? `${dadosPai.nome} (${p.pai})` : "Sem registro";
            const nomeMae = dadosMae ? `${dadosMae.nome} (${p.mae})` : "Sem registro";

            const emojiSexo = p.sexo === "Macho" ? "♂️" : "♀️";

            li.innerHTML = `
                <strong>${p.nome}</strong> - ${p.especie} (${emojiSexo} ${p.sexo})<br>
                Anilha: <code>${p.anilha}</code>
                <div class="parentesco">🧬 <b>Pai:</b> ${nomePai} | <b>Mãe:</b> ${nomeMae}</div>
            `;
            lista.appendChild(li);
        });

    } catch (error) {
        console.error("Erro de conexão:", error);
        lista.innerHTML = "<li style='border-left-color: red; color: red;'>⚠️ Erro ao conectar à API. Verifique se o servidor Python está rodando!</li>";
    }
}

// Evento do formulário (POST)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        anilha: document.getElementById("anilha").value,
        especie: document.getElementById("especie").value,
        sexo: document.getElementById("sexo").value,
        pai: selectPai.value,
        mae: selectMae.value
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            form.reset();
            carregar(); // Recarrega a lista e os seletores
        } else {
            const erro = await res.json();
            alert("Erro: " + erro.erro);
        }
    } catch (error) {
        alert("Não foi possível conectar ao servidor.");
    }
});

// Inicializa o sistema ao carregar a página
carregar();