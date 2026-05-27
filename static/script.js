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
    observer.observe(section);
});


// Pedidos - Função para captar as novas rows inseridas pelo botão
function captarNovosSelects () {
    document.querySelectorAll('.itens-row select').forEach(select => {
        select.addEventListener("change", () => {
            let row = select.parentElement
            let tag_preco_unidade = row.querySelector('.preco_unidade')
            let preco_unidade = valores[select.value]
            tag_preco_unidade.textContent = `R$ ${preco_unidade.toFixed(2)}`
            atualiza_total()
        })
    })
}

// Essa chamada é para pegar o elemento que já está por padrão na página
captarNovosSelects()

// Pedidos - Adicionar Produto
let produtos = 1;
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
            <p>X</p>
            </div>
    `);
        produtos++;
    }
    captarNovosSelects()
});


// Botões + e - na página pedidos
function somar (btn, valor) {
    const div_btn = btn.parentElement;
    const input = div_btn.querySelector("input");
    
    let actual_valor = parseInt(input.value) || 1;
    let new_valor = actual_valor + valor;

    if (new_valor < 1) {
        new_valor = 1;
    }

    input.value = new_valor;

    atualiza_total()
}


// Preço unidade e preço total da página pedidos

const valores = {
    tradicional: 8,
    recheado: 10,
    mini: 5
}

function atualiza_total () {
    let row = document.querySelectorAll('.itens-row').forEach(row => {
        let preco_unidade = valores[row.querySelector('select').value]
        let quantidade = parseInt(row.querySelector('input').value)
        let preco_total = preco_unidade * quantidade
        let tag_preco_total = row.querySelector('.preco_total')
        tag_preco_total.textContent = `R$ ${preco_total.toFixed(2)}`
    })
}