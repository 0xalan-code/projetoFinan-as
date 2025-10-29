// ==============================================
// 1. VARIÁVEIS GLOBAIS E DE ESTADO
// ==============================================

// Onde armazenamos o estado global da aplicação
let dadosFinanceiros = {
    rendaMensal: 0.00,
    limiteMensal: 0.00,
    transacoes: []
};

// Chave única para o localStorage
const STORAGE_KEY = 'budgetAppData';


// Referências ao DOM (Modal de Transações)
const modal = document.getElementById('transaction-modal');
const btnEntrada = document.querySelector('.btn-entrada');
const btnGasto = document.querySelector('.btn-gasto');
const closeBtn = document.querySelector('#transaction-modal .close-button'); // Melhor seletor
const transactionForm = document.getElementById('transaction-form');
const tipoTransacaoInput = document.getElementById('tipo-transacao');

// Referências ao DOM (Modal de Configurações)
const settingsModal = document.getElementById('settings-modal');
const btnConfiguracoesNav = document.getElementById('btn-configuracoes-nav');
const btnGerenciarApp = document.getElementById('btn-gerenciar-app');
const closeSettingsBtn = document.getElementById('close-settings-modal');
const rendaForm = document.getElementById('renda-form');
const novaRendaInput = document.getElementById('nova-renda');
const rendaAtualDisplay = document.getElementById('renda-atual-display');
const limiteForm = document.getElementById('limite-form');
const novoLimiteInput = document.getElementById('novo-limite');
const limiteAtualDisplay = document.getElementById('limite-atual-display'); 

// Correção: Agora apontamos para os botões dentro do MODAL, pois eles foram unificados no HTML
const btnFinalizarMes = settingsModal.querySelector('#btn-finalizar-mes');
const btnResetGeral = settingsModal.querySelector('#btn-reset-geral');


// Referências ao DOM (Lista Completa - NOVO)
const transactionsListModal = document.getElementById('transactions-list-modal');
const closeTransactionsListBtn = document.getElementById('close-transactions-list-modal');
const btnVerTodasTransacoes = document.getElementById('btn-ver-todas-transacoes');
const listaTransacoesCompleta = document.getElementById('lista-transacoes-completa');

// Variável global para armazenar a instância do gráfico
let meuGrafico;


// ==============================================
// 2. UTILITÁRIOS: NOTIFICAÇÕES E CONFIRMAÇÕES CUSTOMIZADAS
// ==============================================

/**
 * Exibe uma notificação customizada na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success'|'error'} type - O tipo de mensagem para estilização.
 */

function salvarNomeEEntrar() {
    // ⚠️ ATENÇÃO: Você precisa garantir que este ID exista na sua tela de Login/Cadastro
    const nomeInput = document.getElementById('nome-usuario-input'); 

    if (nomeInput) {
        const nome = nomeInput.value.trim();
        const STORAGE_KEY = 'budgetAppData';

        if (nome !== "") {
            // SALVA o nome com uma chave específica
            localStorage.setItem('nomeUsuario', nome);
            localStorage.removeItem(STORAGE_KEY);

            // Redireciona para a Home Page 
            window.location.href = "home.html"; 
        } else {
            alert("Por favor, digite seu nome.");
        }
    } else {
        console.error("Elemento de input do nome (ID 'nome-usuario-input') não encontrado. Verifique seu HTML.");
    }
}

/**
 * Recupera o nome do localStorage e atualiza o display de saudação.
 * Esta função deve ser chamada na inicialização da Home Page.
 */
function exibirSaudacao() {
    // ⚠️ ATENÇÃO: Você precisa adicionar o ID 'saudacao-usuario' ao elemento que contém a saudação no seu HTML da Home Page.
    const saudacaoElement = document.getElementById('saudacao-usuario');
    
    // Recupera o nome salvo. Usa 'Visitante' como padrão se não houver nome.
    const nomeSalvo = localStorage.getItem('nomeUsuario') || 'Visitante';
    
    if (saudacaoElement) {
        // Atualiza o texto. .toLocaleString() capitaliza a primeira letra em muitos casos.
        saudacaoElement.textContent = `Olá, ${nomeSalvo.toLocaleString()} 👋`;
    }
}

function showNotification(message, type = 'success') {
    let notification = document.getElementById('custom-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'custom-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            transform: translateY(-20px);
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-weight: 600;
        `;
        document.body.appendChild(notification);
    }
    
    // Define a cor de fundo baseada no tipo
    if (type === 'error') {
        notification.style.backgroundColor = '#d32f2f'; 
    } else { // success
        notification.style.backgroundColor = '#1e88e5'; 
    }
    
    notification.textContent = message;
    
    // Exibe a notificação
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';

    // Oculta a notificação após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 3000);
}


/**
 * Exibe um modal de confirmação customizado, substituindo o confirm().
 * @param {string} message - A mensagem de confirmação.
 * @param {function} onConfirm - Callback a ser executado se o usuário confirmar.
 */
function showCustomConfirm(message, onConfirm) {
    let confirmModal = document.getElementById('custom-confirm-modal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'custom-confirm-modal';
        // Estilos para o overlay do modal
        confirmModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.7); display: none; z-index: 10000;
            justify-content: center; align-items: center;
            font-family: 'Inter', sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #2d3748; padding: 30px; border-radius: 12px;
            max-width: 400px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        `;
        
        const msgText = document.createElement('p');
        msgText.style.marginBottom = '20px';
        msgText.style.color = 'white';
        msgText.style.fontSize = '1.1em';
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'space-around';
        
        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = 'Sim, Confirmar'; // Alterado o texto para ser mais genérico
        btnConfirm.className = 'btn-confirm-yes';
        
        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancelar';
        btnCancel.className = 'btn-confirm-no';
        
        btnContainer.appendChild(btnConfirm);
        btnContainer.appendChild(btnCancel);
        content.appendChild(msgText);
        content.appendChild(btnContainer);
        confirmModal.appendChild(content);
        document.body.appendChild(confirmModal);

        // Estilos básicos para os botões
        btnConfirm.style.cssText = `padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; background: #d32f2f; color: white; font-weight: 600; transition: background 0.2s;`;
        btnConfirm.onmouseover = () => btnConfirm.style.background = '#c62828';
        btnConfirm.onmouseout = () => btnConfirm.style.background = '#d32f2f';

        btnCancel.style.cssText = `padding: 10px 20px; border: 1px solid #718096; border-radius: 6px; cursor: pointer; background: transparent; color: white; transition: background 0.2s;`;
        btnCancel.onmouseover = () => btnCancel.style.background = '#3e4a5d';
        btnCancel.onmouseout = () => btnCancel.style.background = 'transparent';
        
        // Setup listeners para o modal dinâmico
        btnConfirm.onclick = () => {
            confirmModal.style.display = 'none';
            onConfirm();
        };
        btnCancel.onclick = () => {
            confirmModal.style.display = 'none';
        };
        confirmModal.onclick = (e) => {
            if (e.target === confirmModal) {
                confirmModal.style.display = 'none';
            }
        };
    }
    
    // Atualiza o conteúdo e exibe
    confirmModal.querySelector('p').textContent = message;
    confirmModal.style.display = 'flex';

    // Re-anexa o onConfirm (garante que a função correta seja chamada)
    confirmModal.querySelector('.btn-confirm-yes').onclick = () => {
        confirmModal.style.display = 'none';
        onConfirm();
    };
    confirmModal.querySelector('.btn-confirm-no').onclick = () => {
        confirmModal.style.display = 'none';
    };
}


// ==============================================
// 3. FUNÇÕES CORE DE LÓGICA E PERSISTÊNCIA
// ==============================================

/**
 * Inicializa o estado global carregando do Local Storage.
 */
function inicializaDados() {
    const dataString = localStorage.getItem(STORAGE_KEY);
    if (dataString) {
        try {
            const storedData = JSON.parse(dataString);
            // Sobrescreve apenas as chaves existentes para manter a estrutura
            dadosFinanceiros.transacoes = storedData.transacoes || [];
            // Usamos || para garantir o fallback para o valor padrão se for undefined (novo usuário)
            dadosFinanceiros.rendaMensal = storedData.rendaMensal !== undefined ? storedData.rendaMensal : 0.00;
            dadosFinanceiros.limiteMensal = storedData.limiteMensal !== undefined ? storedData.limiteMensal : 0.00;
            return;
        } catch (e) {
            console.error("Erro ao carregar dados do localStorage, usando valores padrão.");
        }
    }
    // Salva os valores padrão se for a primeira vez
    salvarDadosCompletos();
}

/**
 * Salva o objeto de dados COMPLETO no Local Storage do navegador.
 */
function salvarDadosCompletos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosFinanceiros));
}

// Remoção de 'salvarTransacoes' pois 'salvarDadosCompletos' é o padrão

/**
 * Calcula o saldo atual e os gastos por categoria.
 */
function calcularTotais() {
    let saldo = dadosFinanceiros.rendaMensal;
    let totalSaidas = 0;
    let gastosFixos = 0;
    let gastosSuperfluos = 0;
    
    dadosFinanceiros.transacoes.forEach(t => {
        if (t.tipo === 'saida') {
            saldo -= t.valor;
            totalSaidas += t.valor;
            if (t.categoria === 'fixo') {
                gastosFixos += t.valor;
            } else if (t.categoria === 'superfluo') {
                gastosSuperfluos += t.valor;
            }
        } else if (t.tipo === 'entrada' && t.categoria !== 'renda') {
            // Entradas que não são a "renda inicial" (o valor de rendaMensal já foi somado no saldo)
            saldo += t.valor;
        } else if (t.tipo === 'entrada' && t.categoria === 'renda') {
             // Lógica para Renda Extra: O valor inicial está em 'rendaMensal', mas se adicionar outra 'renda' deve somar ao saldo.
             // Aqui, estamos assumindo que "renda" no formulário é uma entrada extra, pois a rendaMensal é um campo de settings.
             // Se houver entradas de categoria 'renda', elas somam ao saldo, mas não devem ser contadas como 'totalSaidas'
             saldo += t.valor;
        }
    });

    return {
        saldo: saldo,
        totalSaidas: totalSaidas,
        gastosFixos: gastosFixos,
        gastosSuperfluos: gastosSuperfluos
    };
}

/**
 * Renderiza a lista de transações (apenas as 3 últimas) no HTML principal.
 */
function renderizarTransacoes(transacoes) {
    const lista = document.querySelector('.lista-transacoes');
    if (!lista) return;
    
    lista.innerHTML = '';
    // Ordena pela data para pegar as 3 mais recentes
    const transacoesOrdenadas = transacoes.sort((a, b) => new Date(b.data) - new Date(a.data)); 
    const ultimasTransacoes = transacoesOrdenadas.slice(0, 3); 

    if (ultimasTransacoes.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 10px;">Nenhuma transação registrada.</p>';
        return;
    }

    ultimasTransacoes.forEach(t => {
        const isSaida = t.tipo === 'saida';
        // 'renda' deve ser tratada visualmente como 'entrada' se for uma transação
        const isRenda = t.categoria === 'renda' || t.tipo === 'entrada'; 
        const iconeClasse = isSaida ? 'saida' : 'entrada';
        // Ícone: se for Renda/Entrada (que não seja a Saída padrão), usa 'fa-plus' ou 'fa-arrow-up'. Saída usa 'fa-minus'.
        const iconeFa = (isRenda && t.categoria === 'renda') ? 'fa-arrow-up' : (isSaida ? 'fa-minus' : 'fa-plus');
        
        const itemHTML = `
            <div class="transacao-item">
                <div class="transacao-icone ${iconeClasse}">
                    <i class="fas ${iconeFa}"></i>
                </div>
                <div class="transacao-detalhes">
                    <h3>${t.descricao}</h3>
                    <p>${t.categoria.toUpperCase()}</p>
                </div>
                <span class="transacao-valor ${iconeClasse}">
                    ${isSaida ? '-' : '+'} R$ ${t.valor.toFixed(2).replace('.', ',')}
                </span>
            </div>
        `;
        lista.innerHTML += itemHTML;
    });
}

/**
 * Renderiza TODAS as transações no Modal de Lista Completa.
 */
function renderizarTransacoesCompletas(transacoes) {
    if (!listaTransacoesCompleta) return;
    
    listaTransacoesCompleta.innerHTML = '';
    
    if (transacoes.length === 0) {
        listaTransacoesCompleta.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 10px;">Nenhuma transação registrada.</p>';
        return;
    }

    // Ordena pela data para exibir do mais recente ao mais antigo
    const transacoesOrdenadas = transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    transacoesOrdenadas.forEach(t => {
        const isSaida = t.tipo === 'saida';
        const isRenda = t.categoria === 'renda' || t.tipo === 'entrada'; 
        const iconeClasse = isSaida ? 'saida' : 'entrada';
        const iconeFa = (isRenda && t.categoria === 'renda') ? 'fa-arrow-up' : (isSaida ? 'fa-minus' : 'fa-plus');
        
        // Formatação simples da data: YYYY-MM-DD -> DD/MM/YYYY
        const dataFormatada = t.data ? t.data.split('-').reverse().join('/') : 'S/ Data';

        const itemHTML = `
            <div class="transacao-item transacao-item-modal">
                <div class="transacao-icone ${iconeClasse}">
                    <i class="fas ${iconeFa}"></i>
                </div>
                <div class="transacao-detalhes">
                    <h3>${t.descricao}</h3>
                    <p>${t.categoria.toUpperCase()} - ${dataFormatada}</p> 
                </div>
                <span class="transacao-valor ${iconeClasse}">
                    ${isSaida ? '-' : '+'} R$ ${t.valor.toFixed(2).replace('.', ',')}
                </span>
            </div>
        `;
        listaTransacoesCompleta.innerHTML += itemHTML;
    });
}


/**
 * Cria ou atualiza o gráfico de pizza com base nos dados de gastos.
 */
function atualizarGrafico(gastosFixos, gastosSuperfluos) {
    const canvas = document.getElementById('graficoPizza');
    if (!canvas) {
        console.warn("Elemento canvas #graficoPizza não encontrado.");
        return;
    }
    
    // Verifica se há gastos para exibir o gráfico. Se não, destrói e evita erro.
    if (gastosFixos === 0 && gastosSuperfluos === 0) {
        if (meuGrafico) {
            meuGrafico.destroy();
            meuGrafico = null;
        }
        // Exibe mensagem de "sem dados" se o gráfico for destruído
        const parent = canvas.parentNode;
        let msg = parent.querySelector('.grafico-vazio-msg');
        if (!msg) {
             msg = document.createElement('p');
             msg.className = 'grafico-vazio-msg';
             msg.textContent = 'Sem gastos registrados para exibir o gráfico.';
             msg.style.cssText = 'text-align: center; color: #a0aec0; padding: 20px;';
             parent.appendChild(msg);
        }
        canvas.style.display = 'none';
        return;
    } else {
        // Remove a mensagem e exibe o canvas
        const parent = canvas.parentNode;
        const msg = parent.querySelector('.grafico-vazio-msg');
        if (msg) parent.removeChild(msg);
        canvas.style.display = 'block';
    }


    const ctx = canvas.getContext('2d');
    const cores = ['#2196F3', '#FFC107'];

    const dados = {
        labels: ['Gastos Fixos', 'Gastos Supérfluos'],
        datasets: [{
            data: [gastosFixos, gastosSuperfluos],
            backgroundColor: cores,
            hoverBackgroundColor: cores,
            borderWidth: 0,
        }]
    };

    const configuracao = {
        type: 'doughnut',
        data: dados,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    // Sugestão: use uma variável CSS ou uma cor compatível com o tema escuro/claro
                    labels: { color: 'white', boxWidth: 15, padding: 15 } 
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) { label += ': '; }
                            label += 'R$ ' + context.formattedValue;
                            return label;
                        }
                    }
                }
            },
            layout: { padding: { left: 5, right: 5, top: 5, bottom: 5 } }
        }
    };
    
    if (meuGrafico) {
        meuGrafico.destroy();
    }
    
    meuGrafico = new Chart(ctx, configuracao);
}


/**
 * Funções de Controle Mensal
 */
function atualizarRendaMensal(novoValor) {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor < 0) return;
    
    dadosFinanceiros.rendaMensal = valor;
    salvarDadosCompletos(); 
    atualizarDisplay();
    // Não fecha o modal aqui, permite que o usuário veja a atualização
    showNotification("Renda mensal atualizada com sucesso!", 'success');
}

/**
 * Atualiza o valor do Limite de Gastos Mensal.
 */
function atualizarLimiteMensal(novoValor) {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor < 0) return;
    
    dadosFinanceiros.limiteMensal = valor;
    salvarDadosCompletos(); 
    atualizarDisplay();
    // Não fecha o modal aqui, permite que o usuário veja a atualização
    showNotification("Limite mensal atualizado com sucesso!", 'success');
}


function finalizarMes() {
    // Mantém renda e limite, mas zera as transações
    dadosFinanceiros.transacoes = []; 
    salvarDadosCompletos(); 
    
    showNotification("Mês finalizado com sucesso! As transações foram resetadas.", 'success');
    
    atualizarDisplay();
    if(settingsModal) settingsModal.style.display = 'none'; // Fecha o modal após o reset
}

/**
 * Atualiza todos os dados na tela (Saldo, Porcentagem, Transações E Gráficos).
 */
function atualizarDisplay() {
    const totais = calcularTotais();
    const limite = dadosFinanceiros.limiteMensal;
    
    const percentualUsado = limite > 0 ? ((totais.totalSaidas / limite) * 100).toFixed(0) : 0;
    
    // 1. Atualiza o Saldo
    const saldoElement = document.getElementById('saldo-total');
    if(saldoElement) saldoElement.textContent = totais.saldo.toFixed(2).replace('.', ',');
    
    // 2. Atualiza o Limite e Porcentagem (Display Principal)
    const limiteElement = document.getElementById('limite-mensal');
    const percentualElement = document.getElementById('percentual-usado');
    if(limiteElement) limiteElement.textContent = limite.toFixed(2).replace('.', ',');
    if(percentualElement) percentualElement.textContent = `${percentualUsado}%`;
    
    // 3. Renderiza as 3 últimas transações
    renderizarTransacoes(dadosFinanceiros.transacoes);
    
    // 4. Atualiza os Gráficos
    atualizarGrafico(totais.gastosFixos, totais.gastosSuperfluos);
    
    // 5. Atualiza o display de renda no Modal de Configurações
    const rendaElement = document.getElementById('renda-atual-display');
    if(rendaElement) rendaElement.textContent = dadosFinanceiros.rendaMensal.toFixed(2).replace('.', ',');
    
    // 6. Atualiza o display de limite no Modal de Configurações
    const limiteAtualElement = document.getElementById('limite-atual-display');
    if(limiteAtualElement) limiteAtualElement.textContent = limite.toFixed(2).replace('.', ',');
}

// ==============================================
// FUNÇÃO DE RESET GERAL (DELETAR TUDO)
// ==============================================

/**
 * Zera o estado da aplicação, voltando para os valores padrão, e limpa o localStorage.
 */
function resetarTudoParaPadrao() {
    // 1. Redefine o estado global para os valores iniciais
    dadosFinanceiros = {
        rendaMensal: 3000.00,
        limiteMensal: 3000.00,
        transacoes: []
    };
    
    // 2. Remove o dado do localStorage (o reset 'completo')
    localStorage.removeItem(STORAGE_KEY);
    
    // 3. Atualiza a interface
    atualizarDisplay();
    
    // 4. Fecha o modal
    if(settingsModal) settingsModal.style.display = 'none';
    
    // 5. Notifica o usuário
    showNotification("Dados da aplicação completamente resetados para o padrão de fábrica!", 'error'); 
}

// ----------------------------------------------
// FUNÇÕES DE MANIPULAÇÃO DE DADOS
// ----------------------------------------------

/**
 * Adiciona uma nova transação ao estado e salva.
 */
function adicionarTransacao(descricao, valor, tipo, categoria, meio) {
    const novaTransacao = {
        id: Date.now(),
        descricao: descricao,
        valor: parseFloat(valor),
        tipo: tipo,
        categoria: categoria,
        meio: meio,
        data: new Date().toISOString().split('T')[0]
    };
    
    dadosFinanceiros.transacoes.unshift(novaTransacao);
    salvarDadosCompletos(); 
    
    atualizarDisplay(); 
}


// ==============================================
// 4. EVENT LISTENERS E INICIALIZAÇÃO
// ==============================================

// Listener do Modal de Transações
if (btnEntrada && btnGasto && modal && closeBtn && transactionForm) {
    
    btnEntrada.onclick = function() {
        modal.style.display = 'block';
        tipoTransacaoInput.value = 'entrada';
        document.querySelector('#transaction-modal .modal-content h2').textContent = 'Nova Entrada';
        document.getElementById('categoria').value = 'renda';
        transactionForm.reset();
    };

    btnGasto.onclick = function() {
        modal.style.display = 'block';
        tipoTransacaoInput.value = 'saida';
        document.querySelector('#transaction-modal .modal-content h2').textContent = 'Novo Gasto';
        // Define uma categoria padrão que não seja 'renda' para gastos
        document.getElementById('categoria').value = 'fixo'; 
        transactionForm.reset();
    };

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        transactionForm.reset();
    };

    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const descricao = document.getElementById('descricao').value.trim();
        const valor = document.getElementById('valor').value;
        const categoria = document.getElementById('categoria').value;
        const tipo = tipoTransacaoInput.value;
        // Uso de optional chaining para segurança
        const meio = document.querySelector('input[name="meio"]:checked')?.value || 'fisico'; 

        if (descricao && valor && categoria && parseFloat(valor) > 0) {
            adicionarTransacao(descricao, valor, tipo, categoria, meio);
            
            transactionForm.reset();
            modal.style.display = 'none';
            showNotification("Transação registrada com sucesso!", 'success');
        } else {
            showNotification('Por favor, preencha todos os campos corretamente e informe um valor positivo.', 'error');
        }
    });
} else {
    console.error("Um ou mais elementos do Modal de Transação não foram encontrados.");
}

// Função Unificada para abrir o Modal de Configurações
function abrirSettingsModal() {
    if (!settingsModal || !novaRendaInput || !novoLimiteInput) return;

    settingsModal.style.display = 'block';
    // Preenche os campos de input com os valores atuais para edição
    novaRendaInput.value = dadosFinanceiros.rendaMensal.toFixed(2);
    novoLimiteInput.value = dadosFinanceiros.limiteMensal.toFixed(2); 
}

// Listeners do Modal de Configurações
if (btnConfiguracoesNav && settingsModal && closeSettingsBtn && rendaForm && limiteForm && btnFinalizarMes && btnResetGeral) {
    
    // ABRIR MODAL DE CONFIGURAÇÕES (via Nav-Bar)
    btnConfiguracoesNav.onclick = abrirSettingsModal; 
    
    // ABRIR MODAL DE CONFIGURAÇÕES (via botão principal)
    if (btnGerenciarApp) {
        btnGerenciarApp.onclick = abrirSettingsModal;
    }
    
    // Fechar Modal de Configurações
    closeSettingsBtn.onclick = function() {
        settingsModal.style.display = 'none';
    };

    // Lidar com o Envio do Formulário de Renda
    rendaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const novoValor = novaRendaInput.value;
        if (novoValor && parseFloat(novoValor) >= 0) {
            atualizarRendaMensal(novoValor);
        } else {
            showNotification("Por favor, insira um valor de renda válido.", 'error');
        }
    });
    
    // Lidar com o Envio do Formulário de Limite
    limiteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const novoValor = novoLimiteInput.value;
        if (novoValor && parseFloat(novoValor) >= 0) {
            atualizarLimiteMensal(novoValor);
        } else {
            showNotification("Por favor, insira um valor de limite válido.", 'error');
        }
    });

    // Lidar com o botão de Finalizar Mês
    btnFinalizarMes.onclick = function() {
        showCustomConfirm(
            "Você tem certeza que deseja finalizar o mês? Esta ação apagará todas as transações atuais para iniciar um novo ciclo.",
            finalizarMes
        );
    };

    // Lidar com o botão de Reset Geral (DELETAR TUDO)
    btnResetGeral.onclick = function() {
        showCustomConfirm(
            "⚠️ ATENÇÃO! Esta ação IRREVERSÍVEL apagará *todos* os seus dados (Renda, Limite e Transações) e resetará o aplicativo para o estado inicial de fábrica. Tem certeza?",
            resetarTudoParaPadrao
        );
    };
    
} else {
    console.warn("Um ou mais elementos do Modal de Configurações não foram encontrados. Verifique seu HTML e IDs.");
}

// ==============================================
// LISTENERS DO MODAL DE TRANSAÇÕES COMPLETAS (NOVO)
// ==============================================

if (btnVerTodasTransacoes && transactionsListModal && closeTransactionsListBtn) {
    
    // 1. Abrir Modal de Transações Completas (Ação para o botão 'Ver Tudo')
    btnVerTodasTransacoes.onclick = function() {
        // Renderiza a lista completa APENAS quando o modal é aberto
        renderizarTransacoesCompletas(dadosFinanceiros.transacoes); 
        transactionsListModal.style.display = 'block';
    };

    // 2. Fechar Modal
    closeTransactionsListBtn.onclick = function() {
        transactionsListModal.style.display = 'none';
    };
}


// 3. Lida com o clique fora dos modais
window.onclick = function(event) {
    // Fecha o modal de transação
    if (event.target == modal) {
        modal.style.display = 'none';
        transactionForm.reset();
    }
    // Fecha o modal de configurações
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
    // Fecha o modal de lista de transações (NOVO)
    if (event.target == transactionsListModal) {
        transactionsListModal.style.display = 'none';
    }
};


// 4. Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    inicializaDados(); // Carrega os dados do localStorage ANTES de atualizar a tela
    exibirSaudacao();
    atualizarDisplay();
});

