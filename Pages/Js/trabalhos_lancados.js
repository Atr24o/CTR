// trabalhos_lancados.js - Funções para gerenciar trabalhos

let equipeAtual = null;
let trabalhoSelecionado = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página Trabalhos Lançados carregada');
    redirecionarSeNaoLogado();

    const usuarioLogado = storage.getUsuarioLogado();
    atualizarBotaoUsuario(usuarioLogado);

    // Busca equipe atual
    equipeAtual = localStorage.getItem('equipeAtual');
    if (!equipeAtual) {
        alert('❌ Nenhuma equipe selecionada!');
        window.location.href = 'Entrar_Equipes.html';
        return;
    }

    verificarSeEhLider();
    carregarTrabalhos();
    configurarFiltros();
});

function atualizarBotaoUsuario(usuario) {
    const botaoUser = document.getElementById('user');
    if (botaoUser && usuario) {
        botaoUser.setAttribute('data-text', usuario.nome || 'Usuário');
    }
}

// ===== VERIFICAR SE É LÍDER =====
function verificarSeEhLider() {
    const usuarioLogado = storage.getUsuarioLogado();
    const equipe = storage.getEquipePorId(equipeAtual);

    if (equipe && equipe.liderId === usuarioLogado.id) {
        // É líder - mostra botões de gerenciamento
        const btnGerenciar = document.getElementById('btn-gerenciar-membros');
        if (btnGerenciar) {
            btnGerenciar.style.display = 'inline-block';
            btnGerenciar.onclick = abrirModalMembros;
        }

        // Mostra botão de criar trabalho
        const linkNovoTrabalho = document.getElementById('link-novo-trabalho');
        if (linkNovoTrabalho) {
            linkNovoTrabalho.style.display = 'block';
        }
    } else {
        // Não é líder - esconde botões
        const btnGerenciar = document.getElementById('btn-gerenciar-membros');
        if (btnGerenciar) {
            btnGerenciar.style.display = 'none';
        }

        const linkNovoTrabalho = document.getElementById('link-novo-trabalho');
        if (linkNovoTrabalho) {
            linkNovoTrabalho.style.display = 'none';
        }
    }

    // Verifica se o usuário é membro da equipe
    if (equipe) {
        const ehMembro = equipe.membros.some(m => m.usuarioId === usuarioLogado.id);
        if (!ehMembro) {
            alert('❌ Você não faz parte desta equipe!');
            window.location.href = 'Entrar_Equipes.html';
            return;
        }
    }
}

// ===== MODAL DE GERENCIAR MEMBROS =====
function abrirModalMembros() {
    const modal = document.getElementById('modal-membros');
    if (modal) {
        modal.style.display = 'flex';
        carregarMembrosParaModal();
        carregarConvitesPendentes();
    }
}

function fecharModalMembros() {
    const modal = document.getElementById('modal-membros');
    if (modal) {
        modal.style.display = 'none';
    }
}

function carregarMembrosParaModal() {
    const membros = storage.getMembrosEquipe(equipeAtual);
    const container = document.getElementById('lista-membros-equipe');
    const usuarioLogado = storage.getUsuarioLogado();

    if (!container) return;

    container.innerHTML = '';

    if (membros.length === 0) {
        container.innerHTML = '<p style="color: #999;">Nenhum membro ainda</p>';
        return;
    }

    membros.forEach(membro => {
        const ehLider = membro.papel === 'lider';
        const ehEu = membro.id === usuarioLogado.id;

        const div = document.createElement('div');
        div.style.cssText = 'background: #f9f9f9; padding: 12px; margin: 8px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
        div.innerHTML = `
            <div>
                <p style="margin: 0; font-weight: bold;">${ehLider ? '👑 ' : ''}${membro.nome} ${ehEu ? '(Você)' : ''}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${membro.email}</p>
                <p style="margin: 3px 0 0 0; font-size: 11px; color: #999;">${membro.profissao || 'Sem profissão'}</p>
            </div>
            ${!ehLider && !ehEu ? `
                <button onclick="removerMembroEquipe('${membro.id}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    Remover
                </button>
            ` : ''}
        `;
        container.appendChild(div);
    });
}

function carregarConvitesPendentes() {
    const convites = storage.getConvites().filter(c =>
        c.equipeId === equipeAtual && c.status === 'pendente'
    );
    const container = document.getElementById('lista-convites-pendentes');

    if (!container) return;

    container.innerHTML = '';

    if (convites.length === 0) {
        container.innerHTML = '<p style="color: #999;">Nenhum convite pendente</p>';
        return;
    }

    convites.forEach(convite => {
        const destinatario = storage.getUsuarioPorId(convite.destinatarioId);

        if (destinatario) {
            const div = document.createElement('div');
            div.style.cssText = 'background: #fff3cd; padding: 12px; margin: 8px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;';
            div.innerHTML = `
                <div>
                    <p style="margin: 0; font-weight: bold;">${destinatario.nome}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${destinatario.email}</p>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: #999;">Enviado: ${new Date(convite.dataCriacao).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onclick="cancelarConvite('${convite.id}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    Cancelar
                </button>
            `;
            container.appendChild(div);
        }
    });
}

function enviarConviteEquipe() {
    const input = document.getElementById('email-novo-membro');
    const email = input.value.trim();

    if (!email) {
        alert('❌ Digite um email!');
        return;
    }

    if (!email.includes('@')) {
        alert('❌ Email inválido!');
        return;
    }

    try {
        const usuarioLogado = storage.getUsuarioLogado();
        storage.criarConvite(equipeAtual, usuarioLogado.id, email);

        alert('✅ Convite enviado com sucesso!');
        input.value = '';
        carregarConvitesPendentes();

    } catch (error) {
        alert('❌ ' + error.message);
    }
}

function removerMembroEquipe(membroId) {
    if (!confirm('Deseja realmente remover este membro da equipe?')) {
        return;
    }

    try {
        storage.removerMembroEquipe(equipeAtual, membroId);
        alert('✅ Membro removido com sucesso!');
        carregarMembrosParaModal();

    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

function cancelarConvite(conviteId) {
    if (!confirm('Deseja cancelar este convite?')) {
        return;
    }

    try {
        storage.recusarConvite(conviteId);
        alert('✅ Convite cancelado!');
        carregarConvitesPendentes();

    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ===== CARREGAR TRABALHOS =====
function carregarTrabalhos() {
    try {
        const trabalhos = storage.getTrabalhosEquipe(equipeAtual);
        const container = document.getElementById('lista-trabalhos');
        const equipe = storage.getEquipePorId(equipeAtual);

        if (!container || !equipe) return;

        // Atualiza título
        const tituloSecao = document.querySelector('#titulo-secao h2');
        if (tituloSecao) {
            tituloSecao.textContent = `Trabalhos: ${equipe.nome}`;
        }

        container.innerHTML = '';

        if (trabalhos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #999;">
                    <p style="font-size: 18px;">Nenhum trabalho lançado ainda</p>
                    <p style="font-size: 14px;">Clique em "Enviar Novo Trabalho" para começar</p>
                </div>
            `;
            return;
        }

        trabalhos.forEach(trabalho => {
            renderizarTrabalhoCard(trabalho, container);
        });

    } catch (error) {
        console.error('Erro ao carregar trabalhos:', error);
        alert('❌ Erro ao carregar trabalhos: ' + error.message);
    }
}

// ===== RENDERIZAR CARD DE TRABALHO =====
function renderizarTrabalhoCard(trabalho, container) {
    const responsavel = storage.getUsuarioPorId(trabalho.responsavelId);
    const criador = storage.getUsuarioPorId(trabalho.criadoPorId);
    const usuarioLogado = storage.getUsuarioLogado();
    const equipe = storage.getEquipePorId(equipeAtual);

    const ehResponsavel = trabalho.responsavelId === usuarioLogado.id;
    const ehLider = equipe && equipe.liderId === usuarioLogado.id;

    // Calcula percentual atual
    const progressos = storage.getProgressosTrabalho(trabalho.id);
    const ultimoProgresso = progressos.length > 0 ? progressos[progressos.length - 1] : null;
    const percentualAtual = ultimoProgresso ? ultimoProgresso.percentual : 0;

    const div = document.createElement('div');
    div.className = 'trabalho-card';

    // Calcula cor do círculo baseado no progresso
    const corProgresso = percentualAtual < 30 ? '#dc3545' : percentualAtual < 70 ? '#ffc107' : percentualAtual === 100 ? '#28a745' : '#007bff';

    // Calcula o círculo SVG
    const raio = 45;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (percentualAtual / 100) * circunferencia;

    div.innerHTML = `
        <div class="trabalho-header">
            <h3>${trabalho.titulo}</h3>
            <span class="status ${trabalho.status}">${formatarStatus(trabalho.status)}</span>
        </div>

        <!-- LAYOUT EM DUAS COLUNAS -->
        <div style="display: flex; gap: 20px; margin: 15px 0;">

            <!-- COLUNA ESQUERDA: Informações -->
            <div class="trabalho-info" style="flex: 1;">
                <p><strong>Responsável:</strong> ${responsavel ? responsavel.nome : 'Desconhecido'} ${ehResponsavel ? '(Você)' : ''}</p>
                <p><strong>Criado por:</strong> ${criador ? criador.nome : 'Desconhecido'}</p>
                <p><strong>Data de Entrega:</strong> ${new Date(trabalho.dataEntrega).toLocaleDateString('pt-BR')}</p>
                <p><strong>Prioridade:</strong> ${formatarPrioridade(trabalho.prioridade)}</p>
                <p><strong>Categoria:</strong> ${trabalho.categoria || 'Sem categoria'}</p>
                <p><strong>Descrição:</strong> ${trabalho.descricao.substring(0, 80)}${trabalho.descricao.length > 80 ? '...' : ''}</p>
                ${progressos.length > 0 ? `
                    <p style="margin-top: 10px; font-size: 11px; color: #666;">
                        📅 Última atualização: ${new Date(progressos[progressos.length - 1].dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                ` : `
                    <p style="margin-top: 10px; font-size: 11px; color: #999;">📊 Nenhum progresso registrado</p>
                `}
            </div>

            <!-- COLUNA DIREITA: Gráfico Circular -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 140px;">
                <div style="position: relative; width: 120px; height: 120px;">
                    <!-- SVG Círculo de Progresso -->
                    <svg width="120" height="120" style="transform: rotate(-90deg);">
                        <!-- Círculo de fundo -->
                        <circle
                            cx="60"
                            cy="60"
                            r="${raio}"
                            fill="none"
                            stroke="#e0e0e0"
                            stroke-width="10"
                        />
                        <!-- Círculo de progresso -->
                        <circle
                            cx="60"
                            cy="60"
                            r="${raio}"
                            fill="none"
                            stroke="${corProgresso}"
                            stroke-width="10"
                            stroke-dasharray="${circunferencia}"
                            stroke-dashoffset="${offset}"
                            stroke-linecap="round"
                            style="transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;"
                        />
                    </svg>

                    <!-- Percentual no centro -->
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        text-align: center;
                    ">
                        <div style="font-size: 28px; font-weight: bold; color: ${corProgresso}; line-height: 1;">
                            ${percentualAtual}%
                        </div>
                        <div style="font-size: 10px; color: #999; margin-top: 2px;">
                            concluído
                        </div>
                    </div>
                </div>

                <!-- Legenda do progresso -->
                ${progressos.length > 0 ? `
                    <div style="margin-top: 10px; text-align: center;">
                        <div style="font-size: 11px; color: #666; font-weight: bold;">
                            ${progressos.length} ${progressos.length === 1 ? 'atualização' : 'atualizações'}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="trabalho-acoes">
            <button class="btn-detalhes" onclick="abrirDetalhes('${trabalho.id}')">Ver Detalhes</button>
            ${ehResponsavel ? `
                <button class="btn-status" onclick="atualizarStatus('${trabalho.id}')" style="background: #28a745;">Atualizar Status</button>
                <button class="btn-progresso" onclick="adicionarProgresso('${trabalho.id}')" style="background: #17a2b8;">Adicionar Progresso</button>
            ` : ''}
            ${ehLider ? `
                <button class="btn-editar" onclick="editarTrabalho('${trabalho.id}')">Editar</button>
                <button class="btn-deletar" onclick="deletarTrabalho('${trabalho.id}')" style="background: #dc3545; color: white;">🗑️ Deletar</button>
            ` : ''}
        </div>
    `;
    container.appendChild(div);
}

function formatarStatus(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'em_andamento': 'Em Andamento',
        'concluido': 'Concluído',
        'atrasado': 'Atrasado'
    };
    return statusMap[status] || status;
}

function formatarPrioridade(prioridade) {
    const prioridadeMap = {
        'baixa': '🟢 Baixa',
        'media': '🟡 Média',
        'alta': '🟠 Alta',
        'urgente': '🔴 Urgente'
    };
    return prioridadeMap[prioridade] || prioridade;
}

// ===== FILTROS =====
function configurarFiltros() {
    const filtroStatus = document.getElementById('filtro-status');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', function() {
            filtrarTrabalhos(this.value);
        });
    }
}

function filtrarTrabalhos(status) {
    const cards = document.querySelectorAll('.trabalho-card');

    cards.forEach(card => {
        const statusSpan = card.querySelector('.status');
        if (status === 'todos') {
            card.style.display = 'block';
        } else {
            if (statusSpan && statusSpan.classList.contains(status)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ===== ABRIR DETALHES =====
function abrirDetalhes(trabalhoId) {
    trabalhoSelecionado = trabalhoId;
    const trabalho = storage.getTrabalhoPorId(trabalhoId);

    if (!trabalho) return;

    const responsavel = storage.getUsuarioPorId(trabalho.responsavelId);
    const criador = storage.getUsuarioPorId(trabalho.criadoPorId);
    const progressos = storage.getProgressosTrabalho(trabalhoId);
    const mensagens = storage.getMensagensTrabalho(trabalhoId);

    // Calcula o progresso atual
    const ultimoProgresso = progressos.length > 0 ? progressos[progressos.length - 1] : null;
    const percentualAtual = ultimoProgresso ? ultimoProgresso.percentual : 0;

    const modal = document.getElementById('modal-detalhes');
    const conteudo = document.getElementById('detalhes-conteudo');

    if (!modal || !conteudo) return;

    conteudo.innerHTML = `
        <p><strong>Título:</strong> ${trabalho.titulo}</p>
        <p><strong>Responsável:</strong> ${responsavel ? responsavel.nome : 'Desconhecido'}</p>
        <p><strong>Criado por:</strong> ${criador ? criador.nome : 'Desconhecido'}</p>
        <p><strong>Data de Entrega:</strong> ${new Date(trabalho.dataEntrega).toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> <span class="status ${trabalho.status}">${formatarStatus(trabalho.status)}</span></p>
        <p><strong>Prioridade:</strong> ${formatarPrioridade(trabalho.prioridade)}</p>
        <p><strong>Categoria:</strong> ${trabalho.categoria || 'Sem categoria'}</p>
        <p><strong>Tags:</strong> ${trabalho.tags.length > 0 ? trabalho.tags.join(', ') : 'Nenhuma'}</p>
        <p><strong>Descrição Completa:</strong></p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${trabalho.descricao}</p>

        <hr style="margin: 20px 0;">

        <!-- GRÁFICO DE PROGRESSO -->
        <h3>📊 Progresso Atual: ${percentualAtual}%</h3>
        <div style="margin: 20px 0;">
            <div style="position: relative; width: 100%; height: 150px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                <svg width="100%" height="150" style="position: absolute; top: 0; left: 0;">
                    <!-- Grid de fundo -->
                    ${[0, 25, 50, 75, 100].map(val => `
                        <line x1="0" y1="${150 - (val * 1.5)}" x2="100%" y2="${150 - (val * 1.5)}"
                              stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>
                        <text x="5" y="${150 - (val * 1.5) - 3}" font-size="10" fill="#999">${val}%</text>
                    `).join('')}

                    <!-- Linha de progresso -->
                    ${progressos.length > 1 ? `
                        <polyline
                            points="${progressos.map((p, i) => {
                                const x = (i / (progressos.length - 1)) * 95 + 5;
                                const y = 150 - (p.percentual * 1.5);
                                return `${x}%,${y}`;
                            }).join(' ')}"
                            fill="none"
                            stroke="#007bff"
                            stroke-width="3"
                        />

                        <!-- Área preenchida -->
                        <polygon
                            points="5%,150 ${progressos.map((p, i) => {
                                const x = (i / (progressos.length - 1)) * 95 + 5;
                                const y = 150 - (p.percentual * 1.5);
                                return `${x}%,${y}`;
                            }).join(' ')} ${95 + 5}%,150"
                            fill="rgba(0, 123, 255, 0.2)"
                        />

                        <!-- Pontos de progresso -->
                        ${progressos.map((p, i) => {
                            const x = (i / (progressos.length - 1)) * 95 + 5;
                            const y = 150 - (p.percentual * 1.5);
                            return `
                                <circle cx="${x}%" cy="${y}" r="5" fill="#007bff" stroke="white" stroke-width="2">
                                    <title>${p.percentual}% - ${new Date(p.dataCriacao).toLocaleDateString('pt-BR')}</title>
                                </circle>
                            `;
                        }).join('')}
                    ` : progressos.length === 1 ? `
                        <!-- Uma única medição -->
                        <circle cx="50%" cy="${150 - (percentualAtual * 1.5)}" r="8" fill="#007bff" stroke="white" stroke-width="2"/>
                        <text x="50%" y="${150 - (percentualAtual * 1.5) - 15}" text-anchor="middle" font-size="14" fill="#007bff" font-weight="bold">${percentualAtual}%</text>
                    ` : `
                        <!-- Nenhum progresso ainda -->
                        <text x="50%" y="75" text-anchor="middle" font-size="14" fill="#999">Nenhum progresso registrado</text>
                    `}
                </svg>
            </div>

            <!-- Barra de progresso alternativa -->
            <div style="margin-top: 15px; background: #e0e0e0; border-radius: 10px; height: 30px; overflow: hidden; position: relative;">
                <div style="background: linear-gradient(90deg, #28a745 0%, #007bff ${percentualAtual}%, #007bff 100%); width: ${percentualAtual}%; height: 100%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: center;">
                    ${percentualAtual > 10 ? `<span style="color: white; font-weight: bold; font-size: 14px;">${percentualAtual}%</span>` : ''}
                </div>
                ${percentualAtual <= 10 && percentualAtual > 0 ? `<span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 14px; color: #666;">${percentualAtual}%</span>` : ''}
                ${percentualAtual === 0 ? `<span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 14px; color: #999;">0%</span>` : ''}
            </div>
        </div>

        <hr style="margin: 20px 0;">

        <h3>📈 Histórico de Progresso</h3>
        ${progressos.length === 0 ? '<p style="color: #999;">Nenhum progresso registrado ainda</p>' : ''}
        ${progressos.map(p => {
            const usuario = storage.getUsuarioPorId(p.usuarioId);
            return `
                <div style="background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff;">
                    <p style="margin: 0;"><strong>${usuario ? usuario.nome : 'Desconhecido'}</strong> - ${new Date(p.dataCriacao).toLocaleString('pt-BR')}</p>
                    <p style="margin: 5px 0; font-size: 16px; color: #007bff;"><strong>Percentual: ${p.percentual}%</strong></p>
                    <p style="margin: 5px 0;">${p.descricao}</p>
                    ${p.arquivos.length > 0 ? `<p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>📎 Arquivos:</strong> ${p.arquivos.join(', ')}</p>` : ''}
                </div>
            `;
        }).join('')}

        <hr style="margin: 20px 0;">

        <h3>💬 Mensagens</h3>
        <div id="mensagens-lista" style="max-height: 300px; overflow-y: auto;">
            ${mensagens.length === 0 ? '<p style="color: #999;">Nenhuma mensagem ainda</p>' : ''}
            ${mensagens.map(m => {
                const usuario = storage.getUsuarioPorId(m.usuarioId);
                return `
                    <div style="background: ${m.tipo === 'progresso' ? '#e3f2fd' : '#f9f9f9'}; padding: 10px; margin: 10px 0; border-radius: 5px;">
                        <p style="margin: 0;"><strong>${usuario ? usuario.nome : 'Desconhecido'}</strong> - ${new Date(m.dataCriacao).toLocaleString('pt-BR')}</p>
                        <p style="margin: 5px 0;">${m.conteudo}</p>
                        ${m.tipo === 'progresso' ? '<span style="font-size: 11px; color: #007bff;">📊 Atualização de Progresso</span>' : ''}
                    </div>
                `;
            }).join('')}
        </div>

        ${trabalho.permitirComentarios ? `
            <div style="margin-top: 15px;">
                <textarea id="nova-mensagem" rows="3" placeholder="Digite sua mensagem..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;"></textarea>
                <button onclick="enviarMensagem()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Enviar Mensagem</button>
            </div>
        ` : '<p style="color: #999; font-size: 12px;">Comentários desabilitados neste trabalho</p>'}
    `;

    modal.style.display = 'flex';
}

// ===== ENVIAR MENSAGEM =====
function enviarMensagem() {
    const textarea = document.getElementById('nova-mensagem');
    const conteudo = textarea.value.trim();

    if (!conteudo) {
        alert('❌ Digite uma mensagem!');
        return;
    }

    try {
        const usuarioLogado = storage.getUsuarioLogado();
        storage.adicionarMensagem(trabalhoSelecionado, usuarioLogado.id, conteudo);

        alert('✅ Mensagem enviada!');
        abrirDetalhes(trabalhoSelecionado);

    } catch (error) {
        alert('❌ Erro ao enviar mensagem: ' + error.message);
    }
}

// ===== ATUALIZAR STATUS =====
function atualizarStatus(trabalhoId) {
    const trabalho = storage.getTrabalhoPorId(trabalhoId);
    if (!trabalho) return;

    const opcoes = `
        <select id="novo-status" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
            <option value="pendente" ${trabalho.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="em_andamento" ${trabalho.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
            <option value="concluido" ${trabalho.status === 'concluido' ? 'selected' : ''}>Concluído</option>
            <option value="atrasado" ${trabalho.status === 'atrasado' ? 'selected' : ''}>Atrasado</option>
        </select>
    `;

    const container = document.createElement('div');
    container.innerHTML = opcoes;

    const novoStatus = prompt('Status atual: ' + formatarStatus(trabalho.status) + '\n\nDigite o novo status:\n1 - Pendente\n2 - Em Andamento\n3 - Concluído\n4 - Atrasado');

    if (!novoStatus) return;

    const statusMap = {
        '1': 'pendente',
        '2': 'em_andamento',
        '3': 'concluido',
        '4': 'atrasado'
    };

    const statusEscolhido = statusMap[novoStatus];
    if (!statusEscolhido) {
        alert('❌ Opção inválida!');
        return;
    }

    try {
        storage.atualizarStatusTrabalho(trabalhoId, statusEscolhido);

        // Adiciona mensagem automática
        const usuarioLogado = storage.getUsuarioLogado();
        storage.adicionarMensagem(
            trabalhoId,
            usuarioLogado.id,
            `Status atualizado para: ${formatarStatus(statusEscolhido)}`
        );

        alert('✅ Status atualizado com sucesso!');
        carregarTrabalhos();

    } catch (error) {
        alert('❌ Erro ao atualizar status: ' + error.message);
    }
}

// ===== ADICIONAR PROGRESSO =====
function adicionarProgresso(trabalhoId) {
    const percentual = prompt('Digite o percentual de progresso (0-100):');

    if (percentual === null) return;

    const percentualNum = parseInt(percentual);
    if (isNaN(percentualNum) || percentualNum < 0 || percentualNum > 100) {
        alert('❌ Digite um número válido entre 0 e 100!');
        return;
    }

    const descricao = prompt('Descreva o progresso realizado:');

    if (!descricao || descricao.trim() === '') {
        alert('❌ A descrição é obrigatória!');
        return;
    }

    try {
        const usuarioLogado = storage.getUsuarioLogado();
        storage.adicionarProgresso(trabalhoId, usuarioLogado.id, descricao.trim(), percentualNum);

        // Atualiza status automaticamente baseado no percentual
        if (percentualNum === 100) {
            storage.atualizarStatusTrabalho(trabalhoId, 'concluido');
        } else if (percentualNum > 0) {
            const trabalho = storage.getTrabalhoPorId(trabalhoId);
            if (trabalho.status === 'pendente') {
                storage.atualizarStatusTrabalho(trabalhoId, 'em_andamento');
            }
        }

        alert('✅ Progresso registrado com sucesso!');
        carregarTrabalhos();

    } catch (error) {
        alert('❌ Erro ao adicionar progresso: ' + error.message);
    }
}

// ===== EDITAR TRABALHO =====
function editarTrabalho(trabalhoId) {
    alert('🚧 Funcionalidade de edição em desenvolvimento!\n\nPor enquanto, você pode alterar o status e adicionar progresso.');
}

// ===== DELETAR TRABALHO =====
function deletarTrabalho(trabalhoId) {
    const trabalho = storage.getTrabalhoPorId(trabalhoId);

    if (!trabalho) {
        alert('❌ Trabalho não encontrado!');
        return;
    }

    // Confirmação com detalhes
    const confirmacao = confirm(
        `⚠️ ATENÇÃO: Deseja realmente deletar este trabalho?\n\n` +
        `📋 Título: ${trabalho.titulo}\n` +
        `📅 Data de Entrega: ${new Date(trabalho.dataEntrega).toLocaleDateString('pt-BR')}\n` +
        `📊 Status: ${formatarStatus(trabalho.status)}\n\n` +
        `Esta ação NÃO pode ser desfeita!\n` +
        `Todos os progressos e mensagens também serão deletados.`
    );

    if (!confirmacao) {
        return;
    }

    // Segunda confirmação para segurança
    const confirmacao2 = confirm(
        `🔴 ÚLTIMA CONFIRMAÇÃO\n\n` +
        `Tem CERTEZA ABSOLUTA que deseja deletar "${trabalho.titulo}"?\n\n` +
        `Clique em OK para DELETAR PERMANENTEMENTE.`
    );

    if (!confirmacao2) {
        alert('✅ Operação cancelada. O trabalho foi preservado.');
        return;
    }

    try {
        // Deleta o trabalho
        storage.deletarTrabalho(trabalhoId);

        alert('✅ Trabalho deletado com sucesso!\n\nTodos os dados relacionados foram removidos.');

        // Recarrega a lista de trabalhos
        carregarTrabalhos();

    } catch (error) {
        alert('❌ Erro ao deletar trabalho: ' + error.message);
        console.error('Erro:', error);
    }
}

// ===== FECHAR MODAL =====
document.querySelector('.fechar-modal')?.addEventListener('click', function() {
    document.getElementById('modal-detalhes').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-detalhes');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Torna funções globais
window.abrirDetalhes = abrirDetalhes;
window.atualizarStatus = atualizarStatus;
window.adicionarProgresso = adicionarProgresso;
window.editarTrabalho = editarTrabalho;
window.deletarTrabalho = deletarTrabalho;
window.enviarMensagem = enviarMensagem;
window.fecharModalMembros = fecharModalMembros;
window.enviarConviteEquipe = enviarConviteEquipe;
window.removerMembroEquipe = removerMembroEquipe;
window.cancelarConvite = cancelarConvite;
