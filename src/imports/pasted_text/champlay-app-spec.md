Crie um web app completo, moderno e responsivo chamado ChamPlay, uma plataforma de assinatura para serviços de TV por streaming.

O sistema deve possuir duas áreas:

Landing page pública, apresentando a empresa, compatibilidade, benefícios e planos.
Área autenticada do cliente, onde o usuário poderá visualizar planos, acompanhar sua assinatura, solicitar teste gratuito e conversar com o suporte.

Toda a interface deve estar em português do Brasil.

1. Identidade visual

Crie uma identidade visual moderna, tecnológica e confiável, inspirada em plataformas premium de streaming, sem copiar o design de nenhuma empresa existente.

Utilize:

Azul ou roxo como cor principal.
Tons escuros e gradientes suaves nas áreas de destaque.
Opção de tema claro e escuro.
Tipografia moderna e de fácil leitura.
Cards com cantos arredondados.
Sombras suaves.
Ícones modernos e consistentes.
Animações discretas ao rolar a página.
Efeitos de hover em botões, cards e links.
Layout limpo, sem excesso de elementos.
Design mobile-first e totalmente responsivo.

O logotipo deverá aparecer como “ChamPlay”, acompanhado de um ícone relacionado a reprodução, televisão ou streaming.

Não utilizar imagens, logos, personagens, pôsteres ou marcas protegidas de filmes, séries, canais ou plataformas de terceiros. Utilizar apenas elementos visuais genéricos e conteúdo devidamente licenciado.

2. Tecnologias e estrutura

Crie o projeto utilizando:

React.
TypeScript.
Tailwind CSS.
Componentes reutilizáveis.
React Router para navegação.
Banco de dados integrado ao ambiente disponível.
Autenticação segura por e-mail e senha.
Estrutura preparada para integração posterior com gateway de pagamento.
Validação dos formulários no frontend e backend.
Feedback visual para carregamento, sucesso e erro.
Proteção das rotas da área do cliente.
Persistência do tema escolhido pelo usuário.
Código organizado por páginas, componentes, serviços, hooks e tipos.

Se o Emergent oferecer integração nativa com Supabase, utilize:

Supabase Auth para autenticação.
Supabase Database para usuários, planos, assinaturas, solicitações de teste e mensagens.
Row Level Security para impedir que um cliente veja dados de outro cliente.
Supabase Realtime para atualização do chat.

Caso o Supabase não esteja disponível, utilize a solução equivalente oferecida pelo ambiente.

3. Cabeçalho da landing page

Crie um cabeçalho fixo com:

Logo ChamPlay.
Link “Home”.
Link “Compatibilidade”.
Link “Planos”.
Link “Dúvidas”.
Botão de alternância entre tema claro e escuro.
Botão “Entrar”.
Botão principal “Cadastre-se”.

Os links devem navegar suavemente para suas respectivas seções.

Em dispositivos móveis, utilizar menu recolhível.

O botão “Entrar” deve abrir a tela ou modal de login.

O botão “Cadastre-se” deve abrir a tela ou modal de cadastro.

4. Seção principal

Criar uma seção Hero impactante com a identificação:

Streaming 100% seguro e estável

Título principal:

Todo o entretenimento em um só lugar

Descrição:

“A ChamPlay conecta você aos seus conteúdos favoritos por meio de uma plataforma de streaming completa, moderna, segura e estável. Desfrute de uma navegação simples e intuitiva, com qualidade, praticidade e toda a tranquilidade necessária para transformar cada momento em uma nova experiência.”

Adicionar os botões:

“Teste grátis por 4 horas”
“Conhecer os planos”

Incluir uma composição visual moderna com televisão, dispositivos conectados, ícone de reprodução e elementos abstratos relacionados a streaming. Não utilizar marcas ou conteúdos protegidos de terceiros.

Abaixo dos botões, exibir três benefícios resumidos:

Configuração simplificada.
Compatibilidade com vários dispositivos.
Suporte especializado.
5. Seção de benefícios

Criar uma seção com o título:

Uma experiência feita para você

Adicionar cards com os benefícios:

Streaming estável

Experiência desenvolvida para oferecer qualidade, praticidade e estabilidade durante a utilização.

Fácil de usar

Interface simples e intuitiva para acessar seus conteúdos com poucos passos.

Vários dispositivos

Utilize a plataforma em diferentes dispositivos compatíveis, de acordo com o seu plano.

Suporte especializado

Conte com atendimento para auxiliar na instalação, configuração e utilização da plataforma.

Atualizações frequentes

Receba melhorias contínuas de desempenho, compatibilidade e experiência.

Navegação segura

Acesso protegido, gerenciamento de conta e boas práticas de segurança.

Evitar promessas absolutas de disponibilidade. Utilizar palavras como “desenvolvida para oferecer estabilidade” em vez de “nunca trava”.

6. Seção de compatibilidade

Utilizar o identificador de seção “compatibilidade”.

Título:

Compatibilidade

Subtítulo:

Assista onde quiser, no seu dispositivo favorito

Descrição:

“A ChamPlay oferece uma experiência de streaming prática, segura e estável em diferentes dispositivos. Escolha sua plataforma compatível, conecte sua conta e aproveite seus conteúdos favoritos com qualidade e tranquilidade.”

Criar uma grade responsiva de cards para:

Android TV

“Aproveite a ChamPlay diretamente em televisores e aparelhos equipados com Android TV, com navegação simples, rápida e preparada para sua experiência de entretenimento.”

Android TV Stick

“Transforme uma televisão compatível em uma central de entretenimento utilizando dispositivos TV Stick com sistema Android e acesso rápido à plataforma ChamPlay.”

Smart TVs Samsung

“Assista aos seus conteúdos favoritos em modelos compatíveis de Smart TVs Samsung, com uma experiência moderna, prática e adaptada para telas maiores.”

Smart TVs LG

“Tenha acesso à ChamPlay em modelos compatíveis de Smart TVs LG e desfrute de uma navegação intuitiva, estável e confortável diretamente pela sua televisão.”

Roku TV e Roku Express

“Utilize a ChamPlay em dispositivos Roku compatíveis e acesse seu entretenimento com facilidade, organização e uma experiência desenvolvida especialmente para sua televisão.”

Navegador Web

“Acesse a ChamPlay em diferentes dispositivos compatíveis e tenha mais liberdade para aproveitar seus conteúdos favoritos no ambiente que preferir, com praticidade e estabilidade.”

Cada card deve possuir:

Ícone representativo.
Nome do dispositivo.
Descrição.
Indicador visual “Compatível”.
Efeito de hover.

Adicionar um aviso abaixo da seção:

“A disponibilidade pode variar conforme o modelo, sistema operacional, região e versão do aplicativo. Consulte o suporte antes de contratar caso tenha dúvidas sobre seu dispositivo.”

7. Seção de planos

Título:

Planos e preços

Subtítulo:

Escolha o período e economize mais

Descrição:

“Todos os planos oferecem os mesmos recursos e benefícios. A diferença está no período contratado: quanto maior o tempo da sua assinatura, maior será a sua economia.”

Criar cinco cards de planos.

Plano Teste grátis
Nome: Teste grátis.
Período: 4 horas de acesso.
Preço: R$ 0,00.
Equivalente mensal: R$ 0,00.
Botão: “Solicitar teste”.
Não exigir pagamento.
Informar que o teste está sujeito à aprovação e disponível uma única vez por cliente.
Plano Mensal
Nome: Mensal.
Período: 30 dias de acesso.
Desconto: 13%.
Preço anterior: R$ 40,00.
Preço atual: R$ 35,00.
Equivalente a R$ 35,00 por mês.
Economia total: R$ 5,00.
Botão: “Escolher mensal”.
Plano Trimestral
Nome: Trimestral.
Período: 3 meses de acesso.
Identificação: “Mais escolhido”.
Desconto: 25%.
Preço anterior: R$ 120,00.
Preço atual: R$ 90,00.
Equivalente a R$ 30,00 por mês.
Economia total: R$ 30,00.
Botão: “Escolher trimestral”.
Destacar visualmente este card.
Plano Semestral
Nome: Semestral.
Período: 6 meses de acesso.
Desconto: 29%.
Preço anterior: R$ 240,00.
Preço atual: R$ 170,00.
Equivalente a R$ 28,33 por mês.
Economia total: R$ 70,00.
Botão: “Escolher semestral”.
Plano Anual
Nome: Anual.
Período: 12 meses de acesso.
Desconto: 40%.
Preço anterior: R$ 480,00.
Preço atual: R$ 290,00.
Equivalente a R$ 24,17 por mês.
Economia total: R$ 190,00.
Botão: “Escolher anual”.

Todos os planos devem apresentar os benefícios:

Acesso a todos os conteúdos disponíveis e licenciados.
Transmissão desenvolvida para oferecer qualidade e estabilidade.
Compatibilidade com diversos dispositivos.
Atualizações frequentes.
Suporte especializado para instalação.

Os valores dos planos devem ser carregados do banco de dados ou de uma estrutura centralizada, evitando preços escritos diretamente em vários componentes.

Ao clicar em um plano:

Se o usuário não estiver autenticado, direcionar para cadastro ou login.
Se estiver autenticado, direcionar para a confirmação do plano.
Não processar pagamento real nesta primeira versão.
Criar uma tela de checkout demonstrativa preparada para integração futura.
8. Perguntas frequentes

Criar uma seção em formato de accordion com as perguntas:

Como funciona o teste grátis?
Quais dispositivos são compatíveis?
Como faço a instalação?
Posso trocar de plano?
Como funciona a renovação?
Como entro em contato com o suporte?
Posso usar em mais de um dispositivo?
Quais formas de pagamento serão aceitas?
Como cancelar uma assinatura?

Utilizar respostas objetivas e informar que algumas condições podem variar conforme o plano.

9. Rodapé

Criar um rodapé contendo:

Logo ChamPlay.
Breve descrição da empresa.
Links para Home, Compatibilidade, Planos e Suporte.
Termos de Uso.
Política de Privacidade.
Política de Cancelamento.
Política de Reembolso.
Direitos autorais.
Campo para contato.
Aviso de que nomes e marcas de dispositivos pertencem aos respectivos proprietários.
Aviso de que a ChamPlay deve distribuir somente conteúdos para os quais possua autorização ou licenciamento.

Não inventar CNPJ, endereço, telefone ou e-mail. Utilizar textos marcados como “Adicionar informação da empresa” quando esses dados forem necessários.

10. Login e cadastro

Criar telas ou modais separados para login e cadastro.

Formulário de login

Campos:

E-mail.
Senha.
Checkbox “Lembrar de mim”.
Link “Esqueci minha senha”.
Botão “Entrar”.
Link para criar uma conta.
Formulário de cadastro

Campos:

Nome completo.
E-mail.
WhatsApp com DDD.
Senha.
Confirmação da senha.
Checkbox de aceite dos Termos de Uso e Política de Privacidade.
Botão “Criar minha conta”.
Link para entrar em uma conta existente.

Requisitos:

Validar o formato do e-mail.
Aplicar máscara brasileira no WhatsApp.
Exigir senha com pelo menos oito caracteres.
Exigir confirmação da senha.
Exibir ou ocultar senha.
Não permitir cadastro sem aceite dos termos.
Exibir mensagens de erro abaixo dos campos.
Criar fluxo de recuperação de senha.
Após cadastro ou login, direcionar para /cliente.
11. Área do cliente

Criar uma área autenticada com menu lateral no desktop e menu adaptado para dispositivos móveis.

O menu deve conter:

Visão geral.
Meus planos.
Teste gratuito.
Suporte.
Meu perfil.
Sair.

No cabeçalho, mostrar:

Nome do cliente.
Avatar com iniciais.
Notificações.
Alternância de tema.
Botão para sair.
12. Dashboard do cliente

Na página inicial da área do cliente, exibir:

Card da assinatura
Nome do plano contratado.
Status da assinatura.
Data de início.
Data de vencimento.
Dias restantes.
Valor contratado.
Botão “Ver detalhes”.
Botão “Renovar plano”.

Os status possíveis devem ser:

Sem assinatura.
Aguardando pagamento.
Ativo.
Teste ativo.
Vencido.
Cancelado.
Suspenso.

Cada status deve ter uma cor e um ícone próprios.

Card de acesso

Exibir:

Status do acesso.
Dispositivo principal.
Data do último acesso.
Botão “Ver instruções de instalação”.

Não exibir senhas sensíveis diretamente. Caso existam credenciais de acesso, criar uma visualização protegida e registrar quando foram consultadas.

Card do teste gratuito

Exibir um dos estados:

Teste disponível.
Solicitação aguardando análise.
Teste aprovado.
Teste ativo.
Teste finalizado.
Teste indisponível.
Atalhos

Adicionar botões para:

Ver planos.
Solicitar teste.
Falar com o suporte.
Atualizar perfil.
13. Página de planos autenticada

Criar uma página onde o cliente possa:

Visualizar todos os planos.
Identificar o plano atual.
Comparar os períodos.
Solicitar contratação.
Renovar o mesmo plano.
Solicitar troca de plano.
Visualizar histórico básico de contratações.

Ao escolher um plano, abrir uma etapa de confirmação contendo:

Nome do plano.
Período.
Valor total.
Valor mensal equivalente.
Data estimada de início.
Checkbox de concordância.
Botão “Confirmar solicitação”.

Como não haverá pagamento real nesta primeira versão, a solicitação deve ficar com o status “Aguardando pagamento” ou “Aguardando confirmação”.

14. Solicitação de teste gratuito

Criar uma página específica para o teste gratuito.

Regras:

Cada usuário poderá solicitar apenas um teste.
O período do teste será de quatro horas.
O teste não deverá iniciar automaticamente no momento da solicitação.
O administrador deverá aprová-lo e definir o horário de início.
Após quatro horas, o status deverá mudar para “Teste finalizado”.
O cliente deverá visualizar o tempo restante durante o teste.
Depois de utilizar o teste, o botão não poderá ser disponibilizado novamente.

Formulário de solicitação:

Dispositivo que será utilizado.
Sistema operacional.
Modelo do dispositivo.
Melhor horário para ativação.
Observação opcional.
Botão “Solicitar teste gratuito”.
15. Chat de suporte

Criar um chat de suporte dentro da área do cliente.

Funcionalidades:

Lista de atendimentos.
Criação de novo atendimento.
Categorias: instalação, acesso, financeiro, plano e outros.
Campo para assunto.
Mensagens em tempo real.
Data e horário em cada mensagem.
Indicador de mensagem enviada, recebida e lida.
Campo de texto.
Botão para enviar.
Upload de imagem ou comprovante, se suportado pelo ambiente.
Status do atendimento: aberto, aguardando cliente, aguardando suporte e encerrado.
Histórico de conversas.
Layout responsivo semelhante a aplicativos modernos de mensagem.

Não criar respostas automáticas fingindo atendimento humano. Caso seja implementado um assistente virtual, ele deverá estar claramente identificado como “Assistente virtual”.

16. Perfil do cliente

Criar uma página onde o usuário poderá:

Alterar nome.
Alterar WhatsApp.
Alterar e-mail, com verificação.
Alterar senha.
Escolher o tema.
Visualizar data de cadastro.
Solicitar exclusão da conta.
Encerrar todas as sessões abertas.

Antes de alterar dados sensíveis, solicitar novamente a senha ou outra forma de confirmação.

17. Painel administrativo básico

Criar também uma rota protegida /admin, disponível somente para usuários com perfil de administrador.

O painel administrativo deve permitir:

Visualizar clientes cadastrados.
Pesquisar por nome, e-mail ou WhatsApp.
Visualizar assinaturas.
Criar e editar planos.
Ativar ou desativar um plano.
Alterar preços e períodos.
Aprovar ou rejeitar solicitações de teste.
Definir início e término do teste.
Alterar status da assinatura.
Visualizar e responder atendimentos.
Encerrar atendimentos.
Visualizar indicadores gerais.

Indicadores:

Total de clientes.
Assinaturas ativas.
Testes solicitados.
Testes ativos.
Assinaturas vencidas.
Atendimentos abertos.
Receita estimada do mês.

A receita deve ser identificada como “estimada” enquanto não houver integração com um gateway de pagamento.

18. Estrutura básica de dados

Criar as seguintes entidades:

Usuários
id.
nome.
email.
whatsapp.
tipo de usuário: cliente ou administrador.
avatar.
tema.
criado em.
atualizado em.
Planos
id.
nome.
descrição.
duração em dias.
preço original.
preço atual.
percentual de desconto.
destaque.
ativo.
ordem de exibição.
Assinaturas
id.
usuário.
plano.
status.
valor contratado.
data de início.
data de vencimento.
criado em.
atualizado em.
Solicitações de teste
id.
usuário.
dispositivo.
sistema operacional.
modelo.
horário desejado.
observação.
status.
data de início.
data de término.
analisado por.
criado em.
Atendimentos
id.
usuário.
categoria.
assunto.
status.
criado em.
encerrado em.
Mensagens
id.
atendimento.
remetente.
conteúdo.
anexo.
lida.
criada em.
Notificações
id.
usuário.
título.
mensagem.
lida.
tipo.
link.
criada em.
19. Segurança e privacidade

Implementar:

Senhas armazenadas somente pelo provedor de autenticação.
Proteção de rotas.
Controle de permissão entre cliente e administrador.
Validação de dados no servidor.
Limitação de tentativas de login.
Proteção contra acesso a dados de outros clientes.
Sanitização de mensagens do chat.
Restrição de tipo e tamanho de arquivos enviados.
Não expor chaves secretas no frontend.
Logs para mudanças importantes de status.
Consentimento para uso de dados pessoais.
Páginas iniciais de Termos de Uso e Política de Privacidade.

Preparar a aplicação para atender às boas práticas da LGPD, sem inventar textos jurídicos definitivos. Marcar os documentos legais como modelos que precisam ser revisados por profissional qualificado antes da publicação.

20. SEO e desempenho

Implementar:

Título e descrição adequados em cada página.
Open Graph.
Favicon.
HTML semântico.
Apenas um H1 por página.
Atributos alt nas imagens.
Navegação por teclado.
Foco visível.
Contraste adequado.
Labels nos formulários.
Estados de loading com skeleton.
Lazy loading de imagens.
Layout sem deslocamentos bruscos.
Página 404 personalizada.
Página de erro amigável.
Mensagens de toast para sucesso e erro.
21. Resultado esperado

Entregar uma aplicação funcional e visualmente completa, e não apenas um layout estático.

O projeto deve incluir:

Landing page.
Tema claro e escuro.
Navegação responsiva.
Login.
Cadastro.
Recuperação de senha.
Área do cliente.
Visualização de planos.
Assinatura atual.
Solicitação de teste.
Chat de suporte.
Perfil do cliente.
Painel administrativo básico.
Banco de dados.
Dados de demonstração.
Rotas protegidas.
Validações.
Estados vazios.
Estados de carregamento.
Mensagens de sucesso e erro.

Antes de encerrar a criação, verifique:

Se os preços e descontos estão corretos.
Se o plano trimestral está destacado como “Mais escolhido”.
Se o teste gratuito dura quatro horas.
Se o usuário só pode solicitar um teste.
Se clientes não acessam o painel administrativo.
Se cada cliente acessa somente os próprios dados.
Se o botão de tema altera toda a aplicação.
Se o tema permanece salvo após atualizar a página.
Se a aplicação funciona em celular, tablet e desktop.
Se não há textos genéricos como “Lorem ipsum”.
Se não há imagens ou marcas de conteúdo protegido.
Se todos os botões principais possuem uma ação funcional.