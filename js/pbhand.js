// variáveis globais
var registrandoGoleiro = false;
var registrandoAcerto = false;
const emQuadra = [12];

// função load
document.addEventListener('DOMContentLoaded', async () => {
    if (existePartida() && await desejaContinuarJogando())
        tabelaExportacao.innerHTML = localStorage.getItem("tabelaExportacao");
    else
        iniciarNovoJogo();
    preencherBanco();
});

// funções de configuração
function iniciarNovoJogo() {
    exportarTabela();
    resetarStorage();
    solicitarPartida(); 
}
function solicitarPartida() {
    swal({
        text: "Digite o nome do adversário da partida:",
        content: "input",
        button: true,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
    .then((adversario) => {
        localStorage.setItem("partida", adversario);
        return adversario == '' ? solicitarPartida() : adversario;
    })
}
async function desejaContinuarJogando() {
    return swal({
        title: "Continuar jogando contra " + localStorage.getItem("partida") + "?",
        buttons: true,
        closeOnClickOutside: false,
        closeOnEsc: false
    });
}
function preencherBanco() {
    for (var i = 8; i < 40; i++) {
        if (!emQuadra.includes(i))        
            bancoReserva.innerHTML += '<li class="nav-item"><a id="banco'+i+'" class="nav-link" href="javascript:substituirJogador('+i+')"><span class="jogador">'+i+'</span></a></li>';
    }
}
function exportarTabela() {  
    if (!existePartida())
        return;
        
    var hoje = new Date();
    var yyyy = hoje.getFullYear();
    var mm = String(hoje.getMonth() + 1).padStart(2, '0');
    var dd = String(hoje.getDate()).padStart(2, '0');
    var partida = localStorage.getItem("partida");
    var nomeTabela = yyyy + "-" + mm + "-" + dd + "_" + partida;

    tabelaExportacao.innerHTML = localStorage.getItem("tabelaExportacao");
    TableToExcel.convert(document.getElementById("tblToExcel"), {
        name: nomeTabela + ".xlsx"
    });
}
function resetarStorage() {
    localStorage.clear();
    tabelaExportacao.innerHTML = localStorage.getItem("tabelaExportacao");
}
function existePartida() {
    return localStorage.getItem("partida") && localStorage.getItem("partida") != null;
}

// funções do jogo
function limparCampos(limparMensagem = true) {
    txtJogador.value = "";
    txtJogador.classList.remove("validado");
    txtAcerto.value = "";
    txtAcerto.classList.remove("validado");
    txtPosicao.value = "";
    txtPosicao.classList.remove("validado");
    registrandoGoleiro = false;
    if (limparMensagem)
        lblMensagem.innerText = "";
    else
        ckb7metros.checked = false;
}
function escolherJogador(nJogador, limparMensagem = true) {
    limparCampos(limparMensagem);
    txtJogador.value = nJogador;
    txtJogador.classList.add("validado");
}
function escolherGoleiro(nGoleiro) {
    escolherJogador(nGoleiro);
    registrandoGoleiro = true;
}
function escolherAcerto(acertou) {
    if (txtJogador.value == "")
    {
        exibirMensagem("Selecione na ordem: Jogador-Acerto-Posicao", false);
        return;
    }
    if (registrandoGoleiro)
        txtAcerto.value = acertou ? "DEFENDEU" : "SOFREU";
    else
        txtAcerto.value = acertou ? "ACERTOU" : "ERROU";
    txtAcerto.classList.add("validado");
    registrandoAcerto = acertou;
}
function escolherPosicao(nPosicao) {
    if (txtJogador.value == "" || txtAcerto.value  == "")
    {
        exibirMensagem("Selecione na ordem: Jogador-Acerto-Posicao", false);
        return;
    }
    txtPosicao.value = nPosicao;
    txtPosicao.classList.add("validado");
    processarEscolhas();
}
function processarEscolhas() {
    criarRegistro();
    var mensagem = "Gravado com Sucesso!\n";
    mensagem += "Jogador " + txtJogador.value;
    mensagem += " " + txtAcerto.value.toLowerCase();
    mensagem += " na posição " + txtPosicao.value;    
    exibirMensagem(mensagem, true);
    setTimeout(function() { 
        limparCampos(false); 
    }, 500);
}
function criarRegistro() {
    tabelaExportacao.innerHTML += "<tr><td>"+ txtJogador.value +"</td><td data-t=\"b\">"+ registrandoAcerto +"</td><td>"+ txtPosicao.value +"</td><td data-t=\"b\">"+ registrandoGoleiro +"</td><td data-t=\"b\">"+ ckb7metros.checked +"</td></tr>";
    localStorage.setItem("tabelaExportacao", tabelaExportacao.innerHTML);
}
function exibirMensagem(mensagem, sucesso) {
    lblMensagem.classList.remove("sucesso");
    lblMensagem.classList.remove("atencao");
    var classe = sucesso ? "sucesso" : "atencao";
    lblMensagem.classList.add(classe);
    lblMensagem.innerText = mensagem;
}
function substituirJogador(novoNumero) { 
    if (txtJogador.value == "")
    {
        exibirMensagem("Selecione um Jogador!", false);
        return;
    }
    var banco = document.getElementById("banco" + novoNumero);
    banco.outerHTML = '<a id="banco'+txtJogador.value+'" class="nav-link substituido" href="javascript:substituirJogador('+txtJogador.value+')"><span class="jogador">'+txtJogador.value+'</span></a>';
    var jogador = document.getElementById("jogador" + txtJogador.value);
    var classes = jogador.querySelector('span').classList.toString();
    var funcao = registrandoGoleiro ? "Goleiro" : "Jogador";
    jogador.outerHTML = '<a id="jogador'+novoNumero+'" href="javascript:escolher'+funcao+'('+novoNumero+')"><span class="'+classes+'">'+novoNumero+'</span></a>';
    exibirMensagem("Substituição entre o " + funcao + " " + txtJogador.value + " e " + novoNumero, true);    
    escolherJogador(novoNumero, false);
}