const sections = document.querySelectorAll('.section-hidden');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add("section-show");
        }

    });
},  {
    threshold: 0.25
});
sections.forEach((section) => {
    observer.observe(section)
});


// Inserir Pedido - Função para captar as novas rows inseridas pelo botão
function captarNovosSelects () {
    document.querySelectorAll('.itens-row select').forEach(select => {
        select.addEventListener("change", () => {
            let row = select.parentElement
            let tag_preco_unidade = row.querySelector('.preco_unidade')
            let preco_unidade = valores[select.value]
            tag_preco_unidade.textContent = `R$ ${preco_unidade.toFixed(2)}`
            atualizaTotal()
        })
    })
}

// Essa chamada é para pegar o elemento que já está por padrão na página
captarNovosSelects()

// Inserir Pedido - Adicionar Produto
let produtos = 1
const pedidos_itens = document.querySelector('#itens');
const btn_pedidos_adicionar = document.querySelector('#btn_pedidos_adicionar')
btn_pedidos_adicionar.addEventListener ("click", () => {
    if (produtos < 3) {
        pedidos_itens.insertAdjacentHTML ('beforeend', `
            <div class="itens-row">
            <select name="produtos[]">
            <option value="tradicional">Churros Tradicional</option>
            <option value="recheado">Churros Recheado</option>
            <option value="mini">Mini Churros</option>
            </select>
            <div class="div-quantidade">
            <button onclick="somar(this, -1)" type="button">-</button>
            <input type="number" name="quantidades[]" value="1" min="1">
            <button onclick="somar(this, 1)" type="button">+</button>
            </div>
            <p class="preco_unidade">R$ 8,00</p>
            <p class="preco_total">R$ 8,00</p>
            <a onclick="removeRow(this.parentElement)"><img src="/static/assets/excluir.png"></a>
            </div>
    `)
        produtos++
    }
    captarNovosSelects()
    atualizaTotal()
});


// Botões + e - na página inserir pedidos
function somar (btn, valor) {
    const div_btn = btn.parentElement;
    const input = div_btn.querySelector("input");
    
    let actual_valor = parseInt(input.value) || 1
    let new_valor = actual_valor + valor;

    if (new_valor < 1) {
        new_valor = 1
    }

    input.value = new_valor

    atualizaTotal()
}


// Preço unidade e preço total da página inserir pedidos

const valores = {
    tradicional: 8,
    recheado: 10,
    mini: 5
}

function atualizaTotal () {
    let valor_total_all_rows = 0
    document.querySelectorAll('.itens-row').forEach(row => {
        let preco_unidade = valores[row.querySelector('select').value]
        let quantidade = parseInt(row.querySelector('input').value)
        let preco_total = preco_unidade * quantidade
        valor_total_all_rows += preco_total
        let tag_preco_total = row.querySelector('.preco_total')
        tag_preco_total.textContent = `R$ ${preco_total.toFixed(2)}`
    })
    document.querySelector('#adicionar-total p').textContent = `R$ ${valor_total_all_rows.toFixed(2)}`
}

function removeRow (row) {
    row.remove()
    produtos--
    atualizaTotal()
}

function createCards (num, items) {
    let rows
    if ((num % 4) == 0) {
        rows = num / 4
    }
    else {
        rows = Math.trunc(num / 4) + 1
    }


    const start = document.querySelector('#pedidos-page div')
    for (let i = 0; i < rows; i++) {
        start.insertAdjacentHTML ('afterend', `
                <div class="cards-row">
                </div>
            `)
    }

    let cont = 0
    const tag_rows = document.querySelectorAll('.cards-row')
    tag_rows.forEach((tag_row) => {
        for (let i = 0; i < 4; i++) {
            if (cont == num) return
            tag_row.insertAdjacentHTML ('beforeend', `
                    <div class="card">
                    <div>
                    <h3>ID: #${items[cont][0]}</h3>
                    <p>TEMPO</p>
                    </div>
                    <h4>${items[cont][1]}</h4>
                    <ul>
                    <li>Tradicional: ${items[cont][3]}</li>
                    <li>Recheado: ${items[cont][4]}</li>
                    <li>Mini: ${items[cont][5]}</li>
                    <li>Total: R$ ${items[cont][6]},00</li>
                    </ul>
                    <div class="div-whatsapp">
                    <a href="https://wa.me/${items[cont][2]}" target="blank"><img src="/static/assets/whatsapp.png"></a>
                    <p>${items[cont][2]}</p>
                    </div>
                    <form action="/pedidos" method="PATCH">
                    <button>Marcar como Concluído</button>
                    </form>
                    <form action="/pedidos" method="DELETE">
                    <button>Cancelar Pedido</button>
                    </form>
                    </div>
                `)
            cont++
        }
    })
    const ultima_row = tag_rows[tag_rows.length - 1]
    ultima_row.id = "ultima-card-row"

}