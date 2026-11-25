(() => {
  const byId = (id) => document.getElementById(id);
  const chat = byId("chat-body");
  const welcome = chat.firstElementChild.cloneNode(true);
  const input = byId("question");
  const composer = byId("composer");
  const submit = composer.querySelector('[type="submit"]');
  const mic = byId("microphone");
  const sound = byId("sound");
  const shortcuts = [...document.querySelectorAll("[data-question]")];
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synthesis = window.speechSynthesis;
  const voiceSample = "Olá! Eu sou o Darcyzinho, seu assistente escolar. Como posso ajudar você hoje?";
  const defaultNotice = "As mensagens ficam apenas nesta conversa.";

  const fairAnswers = {
    course: "Em Desenvolvimento de Sistemas, você aprende a transformar um problema em um site, aplicativo ou programa. A lógica organiza os passos, a programação faz o sistema funcionar, o banco de dados guarda as informações e os testes ajudam a encontrar erros.",
    beginner: "Você pode começar do zero. Um bom primeiro exercício é descrever em passos como calcular a média de duas notas. Depois, você transforma esses passos em código e testa com valores diferentes.",
    firstYear: "Para começar, experimente exercícios de lógica, escreva pequenos programas e planeje como guardar os dados de um projeto. Para saber a grade oficial do primeiro ano, consulte a coordenação do CETI Professor Darcy Araújo.",
    subjects: "Entre os conteúdos típicos do curso estão lógica e programação, banco de dados, desenvolvimento de interfaces e testes. Você usa esses conhecimentos em conjunto ao criar um sistema. Para consultar a grade oficial do CETI por série, fale com a coordenação.",
    tools: "Para desenvolver um site, você pode usar HTML para a estrutura, CSS para o visual e JavaScript para a interação. Python é outra opção para praticar lógica e criar programas. As linguagens usadas nas aulas dependem do planejamento do curso.",
    officialCourse: "Para confirmar duração, requisitos de ingresso, matrícula, vagas ou informações oficiais do curso, consulte a secretaria ou a coordenação do CETI Professor Darcy Araújo.",
    careers: "Quem estuda Desenvolvimento de Sistemas pode seguir áreas como desenvolvimento front-end, que cuida das telas, back-end, que implementa as regras do sistema, ou testes de software, que verificam se tudo funciona como esperado.",
    project: "Em um sistema de biblioteca, a tela mostra os livros, o programa verifica se cada exemplar está disponível e o banco de dados registra os empréstimos. Abra a demonstração para emprestar um livro, tentar emprestá-lo de novo e depois devolvê-lo.",
    challenge: "São oito perguntas rápidas com situações do dia a dia. Você pode participar sem saber programar e recebe uma explicação depois de cada resposta."
  };

  const fairFollowups = {
    course: ["Preciso saber programar?", "Quais matérias tem?", "Qual a diferença entre DS e Jogos Digitais?"],
    beginner: ["Ver um projeto de exemplo"],
    firstYear: ["Ver um projeto de exemplo"],
    careers: ["Ver um projeto de exemplo"]
  };

  const fairBasics = [
    {
      id: "comparison",
      match: /\b(jogos? digitais|criacao de jogos|desenvolvimento de jogos)\b/,
      answer: "Desenvolvimento de Sistemas cria soluções como sites, aplicativos e sistemas escolares. Jogos Digitais envolve criar jogos, combinando programação, regras, arte e testes. Os dois usam lógica. Em um app, você pode programar uma lista de tarefas. Em um jogo, pode programar a pontuação."
    },
    {
      id: "algorithm",
      match: /\b(algoritmos?|logica de programacao|o que e logica)\b/,
      answer: "Um algoritmo é uma sequência de instruções para resolver um problema. Uma receita de suco funciona como exemplo: escolher a fruta, adicionar água, bater e servir. Na programação, você descreve os passos de um jeito que o computador consiga seguir."
    },
    {
      id: "database",
      match: /\b(banco de dados|base de dados)\b/,
      answer: "Um banco de dados guarda informações de forma organizada. Em um catálogo de jogos, ele pode guardar o título, o gênero e a plataforma de cada jogo. Assim, o sistema consegue buscar todos os jogos de corrida sem revisar a lista inteira manualmente."
    },
    {
      id: "web",
      match: /\b(diferenca entre (site|aplicativo)|sites? e (apps?|aplicativos?)|o que e (um )?site|como (criar|fazer) (um )?site)\b/,
      answer: "Um site abre pelo navegador, como este aqui. Muitos aplicativos são instalados no celular e podem usar recursos do aparelho, como a câmera. Uma página de apresentação da turma é um bom primeiro site."
    },
    {
      id: "programming",
      match: /\b(o que e programacao|o que e programar|para que serve programar|o que significa programar)\b/,
      answer: "Programar é escrever instruções para que um computador faça algo. Num jogo, por exemplo, você pode escrever uma regra que soma um ponto quando o jogador pega uma moeda."
    },
    {
      id: "apps",
      match: /\b(criar|fazer|desenvolver|montar|faco|crio|cria|faz)\b.*\b(apps?|aplicativos?|jogos?)\b|\b(apps?|aplicativos?|jogos?)\b.*\b(criar|fazer|desenvolver)\b/,
      answer: "Dá para começar com um app de lista de tarefas ou um jogo de perguntas. Primeiro escolha o que a pessoa vai fazer na tela. Depois desenhe a interface, escreva as regras e teste com um colega."
    },
    {
      id: "highSchool",
      match: /\b(ensino medio (integrado|tecnico)|tecnico integrado|integrado ao ensino medio|curso junto com o ensino medio)\b/,
      answer: "No ensino médio integrado, você cursa as matérias do ensino médio junto com as disciplinas técnicas. Para saber como funciona a oferta e a matrícula no CETI, consulte a coordenação."
    },
    {
      id: "equipment",
      match: /\b(precis[oa]|tem que|obrigatorio)\b.*\b(notebook|computador|pc)\b|\b(sem (um )?(notebook|computador)|computador em casa)\b/,
      answer: "Você já pode praticar lógica no papel, por exemplo, escrevendo os passos para um personagem encontrar uma saída. Para saber se é necessário levar equipamento e como funcionam as práticas no laboratório, consulte a coordenação."
    },
    {
      id: "design",
      match: /\b(front end e back end|frontend e backend|o que e (front end|back end|frontend|backend)|quem (faz|cria|desenha) as telas)\b/,
      answer: "Front-end é a parte com que você interage, como o botão de enviar uma mensagem. Back-end é a parte que processa pedidos e aplica regras, como verificar se uma conta tem permissão para entrar."
    },
    {
      id: "ai",
      match: /\b(inteligencia artificial|ia|chatgpt|gemini)\b/,
      answer: "Inteligência artificial pode ajudar a identificar padrões, sugerir textos ou explicar ideias. Um exemplo é um app que recomenda músicas. Vale conferir as respostas, porque uma ferramenta de IA também pode errar."
    }
  ];

  const logicQuestions = [
    {
      prompt: "Receita. Para fazer suco de laranja, qual sequência faz sentido?",
      options: ["Servir, cortar a laranja e espremer.", "Cortar a laranja, espremer e servir.", "Espremer, servir e cortar a laranja."],
      correct: 1,
      explanation: "As instruções têm uma ordem. Primeiro você prepara a fruta e depois serve."
    },
    {
      prompt: "Jogo. Você ganha uma rodada se fizer pelo menos 10 pontos. Fez exatamente 10. O que acontece?",
      options: ["Você ganha a rodada.", "Você perde a rodada.", "Você precisa fazer mais um ponto."],
      correct: 0,
      explanation: "Pelo menos 10 inclui o próprio 10. Essa é a condição para ganhar."
    },
    {
      prompt: "Playlist. Você quer adicionar quatro músicas, uma de cada vez. Quantas vezes repete a ação de adicionar uma música?",
      options: ["Uma vez.", "Duas vezes.", "Quatro vezes."],
      correct: 2,
      explanation: "A mesma ação precisa acontecer uma vez para cada música. Isso é repetição."
    },
    {
      prompt: "Placar. Seu time tem 3 pontos e marca mais 2. Que valor o placar deve mostrar?",
      options: ["3 pontos.", "5 pontos.", "2 pontos."],
      correct: 1,
      explanation: "O placar guarda a pontuação atual. Ao somar 2 ao valor 3, passa a guardar 5."
    },
    {
      prompt: "Robô. Ele precisa chegar a um quadrado que está dois passos à frente. Qual comando chega ao lugar certo?",
      options: ["Avance dois passos.", "Avance um passo.", "Recue dois passos."],
      correct: 0,
      explanation: "O comando precisa indicar tanto a direção quanto a quantidade de passos."
    },
    {
      prompt: "Cantina. Um aplicativo mostra o preço total da compra. Como testar se ele soma corretamente?",
      options: ["Trocar a cor da tela.", "Abrir e fechar o aplicativo sem comprar.", "Escolher dois itens com preços conhecidos e comparar o total com a soma feita à mão."],
      correct: 2,
      explanation: "Um bom teste usa um resultado que você já consegue calcular para comparar com o resultado do aplicativo."
    },
    {
      prompt: "Semáforo. Para pedestres, a regra do exercício é atravessar somente com o sinal verde. O sinal está vermelho. O que fazer?",
      options: ["Atravessar logo.", "Esperar o sinal verde.", "Atravessar se o sinal continuar vermelho."],
      correct: 1,
      explanation: "A ação só acontece quando a condição é verdadeira. Com o sinal vermelho, é preciso esperar."
    },
    {
      prompt: "Biblioteca. O catálogo mostra que um livro já está emprestado. O que o sistema deve fazer se alguém tentar emprestar o mesmo exemplar?",
      options: ["Avisar que o exemplar está indisponível.", "Registrar um segundo empréstimo.", "Apagar o primeiro empréstimo."],
      correct: 0,
      explanation: "A regra evita que o mesmo exemplar fique registrado com duas pessoas ao mesmo tempo."
    }
  ];

  const questionsDialog = byId("questions-dialog");
  const moreQuestions = byId("more-questions");
  const projectDialog = byId("project-dialog");
  const projectForm = byId("project-form");
  const projectBook = byId("project-book");
  const projectStatus = byId("project-book-status");
  const projectFeedback = byId("project-feedback");
  const borrowedBooks = new Set();
  const logicDialog = byId("logic-dialog");
  const logicForm = byId("logic-form");
  const logicFeedback = byId("logic-feedback");
  const logicOptions = [...logicForm.querySelectorAll(".logic-options label")];
  const logicCheck = byId("logic-check");
  const logicNext = byId("logic-next");
  const logicQuestion = byId("logic-question");
  let logicIndex = 0;
  let logicScore = 0;
  let lastFairTopic = null;

  const topics = [
    {
      match: /\b(dados pessoais|privacidade|historico|grava\w*|salv\w*)\b/,
      answer: "O site mantém a conversa apenas na página aberta. Se você usar o microfone, o navegador pode enviar o áudio ao serviço de reconhecimento de voz. Evite compartilhar nome completo, matrícula, notas ou outros dados pessoais."
    },
    {
      match: /\b(matricula\w*|vaga\w*|inscri[cç]\w*|calendario|feriado\w*|horario\w*|endereco|telefone|whatsapp|contato|secretaria|uniforme|boletim)\b|\b(qual|quais|quando|onde|consultar|ver)\b.*\b(prova\w*|nota\w*|aula\w*)\b|\bonde fica\b.*\b(ceti|escola|colegio)\b/,
      answer: "Para informações atualizadas da escola, como matrículas, vagas, datas de provas, horários ou contatos, consulte a secretaria, a coordenação ou os comunicados oficiais do CETI Professor Darcy Araújo."
    },
    {
      match: /\b(voz|microfone|ditar|ditado|audio|transcri\w*|som|falar|escutar|ouvir)\b/,
      answer: "Para ditar, clique no microfone ao lado do campo de mensagem, permita o acesso e fale. Revise o texto que aparecer no campo e clique em Enviar. Se o ditado estiver indisponível, você pode digitar. Para ouvir as respostas, ative o som no topo da página."
    },
    {
      match: /\b(html|css|javascript|programa\w*|codigo\w*|python|algoritmo\w*|banco de dados)\b/,
      answer: "Um jeito de começar a programar é escolher um problema pequeno e dividi-lo em passos. Para criar um site, experimente fazer uma página de apresentação com HTML, estilizar com CSS e adicionar um botão interativo com JavaScript. Teste cada etapa antes de avançar."
    },
    {
      match: /\b(projeto\w*|trabalho\w*|apresenta\w*|feira)\b/,
      answer: "Comece com uma pergunta clara. Por exemplo, como podemos ajudar os colegas a organizar os estudos? Defina o que você quer entregar, divida as tarefas da equipe e monte uma primeira versão simples. Peça a um colega para testar e use o retorno para melhorar."
    },
    {
      match: /\b(curso\w*|desenvolvimento de sistemas|tecnico)\b/,
      answer: "Em Desenvolvimento de Sistemas, você aprende a transformar um problema em um programa, site ou aplicativo. Entre os temas comuns estão lógica de programação, banco de dados, interfaces e testes. Para saber quais disciplinas o CETI oferece neste ano, consulte a coordenação."
    },
    {
      match: /\b(estud\w*|revis\w*|memoriza\w*)\b/,
      answer: "Escolha um assunto por vez. Depois de estudar, tente explicá-lo com suas próprias palavras e resolva um exercício sem olhar a resposta. Anote as dúvidas para revisar no dia seguinte ou conversar com o professor."
    },
    {
      match: /\b(ceti|escola|colegio|darcy araujo)\b/,
      answer: "O Darcyzinho foi criado para o CETI Professor Darcy Araújo. CETI significa Centro Estadual de Tempo Integral. Posso explicar o que se aprende em Desenvolvimento de Sistemas e ajudar você a dar os primeiros passos em um projeto escolar."
    },
    {
      match: /^(oi|ola|bom dia|boa tarde|boa noite|e ai|darcyzinho)( darcyzinho)?$/,
      answer: "Olá! Sou o Darcyzinho, assistente escolar do Centro Estadual de Tempo Integral Professor Darcy Araújo. Posso orientar você sobre a escola, o curso de Desenvolvimento de Sistemas e projetos escolares. Como posso ajudar?"
    },
    {
      match: /^(obrigad[oa]|valeu|agrade[cç]o)( darcyzinho)?$/,
      answer: "De nada! Estou à disposição se você tiver outra dúvida."
    }
  ];

  const voiceErrors = {
    "not-allowed": "O navegador bloqueou o microfone. Verifique a permissão ou digite sua pergunta.",
    "service-not-allowed": "O serviço de ditado está bloqueado. Você pode digitar sua pergunta.",
    "audio-capture": "O navegador não encontrou um microfone. Você pode digitar sua pergunta.",
    "no-speech": "Não detectei fala. Tente ditar novamente ou digite sua pergunta.",
    network: "O serviço de ditado está indisponível. Você pode digitar sua pergunta.",
    "language-not-supported": "O navegador não oferece ditado em português do Brasil. Você pode digitar sua pergunta."
  };

  let recording = null;
  let responseTimer = 0;
  let utterance = null;
  let speakingTimer = 0;
  let soundEnabled = false;

  function setNotice(message = defaultNotice) {
    byId("notice").textContent = message;
  }

  function setFace(state) {
    byId("face").dataset.state = state;
    byId("mascot-status").textContent = {
      idle: "Pronto para conversar",
      listening: "Microfone ativo",
      thinking: "Preparando resposta",
      speaking: "Lendo a resposta"
    }[state];
  }

  function setRecording(isRecording) {
    mic.setAttribute("aria-pressed", String(isRecording));
    mic.setAttribute("aria-label", isRecording ? "Parar ditado" : "Ditar pergunta");
    mic.title = isRecording ? "Parar ditado" : "Ditar pergunta";
    byId("mic-icon").setAttribute("href", isRecording ? "#i-stop" : "#i-mic");
    setFace(isRecording ? "listening" : "idle");
  }

  function detachRecording(session) {
    if (recording !== session) return false;
    clearTimeout(session.timeout);
    recording = null;
    setRecording(false);
    return true;
  }

  function cancelRecording() {
    if (!recording) return;
    const session = recording;
    if (detachRecording(session)) {
      try { session.recognition.abort(); } catch {}
      setNotice();
    }
  }

  function finishRecording(session, message) {
    if (!detachRecording(session)) return;
    setNotice(message || (session.hasTranscript
      ? "Revise a transcrição e envie quando estiver pronta."
      : voiceErrors["no-speech"]));
  }

  function stopRecording(session) {
    if (recording !== session || session.stopping) return;
    session.stopping = true;
    clearTimeout(session.timeout);
    setNotice("Finalizando a transcrição…");
    try {
      session.recognition.stop();
      if (recording === session) {
        session.timeout = setTimeout(() => {
          finishRecording(session);
          try { session.recognition.abort(); } catch {}
        }, 2000);
      }
    } catch {
      finishRecording(session);
      try { session.recognition.abort(); } catch {}
    }
  }

  function toggleMicrophone() {
    if (!Recognition) {
      setNotice("Este navegador não oferece ditado. Você pode digitar sua pergunta.");
      return;
    }
    if (recording) {
      stopRecording(recording);
      return;
    }

    stopSpeaking();
    const recognition = new Recognition();
    const session = { recognition, draft: input.value.trim(), hasTranscript: false, stopping: false, timeout: 0 };
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (recording !== session || session.stopping) return;
      setNotice("Pode falar. O navegador pode processar o áudio em um serviço externo.");
    };
    recognition.onresult = (event) => {
      if (recording !== session) return;
      const transcript = Array.from(event.results, (result) => result[0].transcript.trim()).join(" ").trim();
      if (!transcript) return;
      session.hasTranscript = true;
      input.value = [session.draft, transcript].filter(Boolean).join(" ").slice(0, input.maxLength);
    };
    recognition.onerror = (event) => finishRecording(session, voiceErrors[event.error] || "O ditado foi interrompido. Você pode digitar sua pergunta.");
    recognition.onend = () => finishRecording(session);

    recording = session;
    setRecording(true);
    setNotice("Aguardando a permissão do microfone…");
    session.timeout = setTimeout(() => stopRecording(session), 20000);
    try {
      recognition.start();
    } catch {
      finishRecording(session, "Não consegui abrir o microfone. Você pode digitar sua pergunta.");
    }
  }

  function stopSpeaking() {
    clearTimeout(speakingTimer);
    if (!utterance) return;
    utterance = null;
    synthesis.cancel();
    setFace("idle");
  }

  function preferredVoice() {
    const voices = synthesis.getVoices().filter(
      (voice) => voice.lang.toLowerCase().replace("_", "-") === "pt-br"
    );
    return voices.find((voice) => /natural|neural/i.test(voice.name))
      || voices.find((voice) => /premium|enhanced|aprimorada/i.test(voice.name))
      || voices.find((voice) => voice.default)
      || voices.find((voice) => voice.localService)
      || voices[0]
      || null;
  }

  function speak(answer, manual = false) {
    if ((!soundEnabled && !manual) || !synthesis || !window.SpeechSynthesisUtterance) return;
    stopSpeaking();
    const spokenAnswer = answer.replace(/\bCETI\b/g, "Céti");
    const piece = new SpeechSynthesisUtterance(spokenAnswer);
    piece.lang = "pt-BR";
    piece.voice = preferredVoice();
    piece.rate = 0.92;
    utterance = piece;

    function finish() {
      if (utterance !== piece) return;
      utterance = null;
      clearTimeout(speakingTimer);
      setFace("idle");
    }

    piece.onstart = () => {
      if (utterance === piece) setFace("speaking");
    };
    piece.onend = finish;
    piece.onerror = () => {
      if (utterance !== piece) return;
      finish();
      setNotice("O navegador não conseguiu ler a resposta em voz alta. Ela está disponível na conversa.");
    };
    speakingTimer = setTimeout(stopSpeaking, 8000 + answer.length * 110);
    try {
      synthesis.speak(piece);
    } catch {
      piece.onerror();
    }
  }

  function replyTo(question) {
    const normalized = question.toLocaleLowerCase("pt-BR")
      .normalize("NFD").replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, " ").trim();

    const mentionsCourse = /\b(curso|desenvolvimento de sistemas|tecnico em ds|ds)\b/.test(normalized);
    const aboutCourse = mentionsCourse || Boolean(lastFairTopic);
    let topic;
    const basic = fairBasics.find(({ match }) => match.test(normalized));
    if (/\b(desafios?|quiz)\b/.test(normalized)) topic = "challenge";
    else if (mentionsCourse && /\b(matricula\w*|vagas?|inscri\w*|duracao|quanto tempo|quantos (anos|semestres)|quanto dura|carga horaria|horarios?|pre requisitos|como (entrar|ingressar)|certificad[oa]\w*)\b/.test(normalized)) topic = "officialCourse";
    else if (basic && !/\b(matricula\w*|vagas?|inscri\w*|horarios?|notas?|telefone|endereco|privacidade)\b/.test(normalized)) {
      lastFairTopic = basic.id;
      return { text: basic.answer, topic: basic.id };
    }
    else if (/\b(profissoes|profissao|carreira\w*|mercado de trabalho|onde (posso|da para) trabalhar|em que areas|areas de atuacao|o que posso ser)\b/.test(normalized) ||
      (aboutCourse && /\b(emprego|trabalhar|depois de (terminar|concluir))\b/.test(normalized))) topic = "careers";
    else if (/\b(projeto de exemplo|exemplo de projeto|biblioteca|emprestimo de livros|quais projetos|que projetos)\b/.test(normalized) ||
      (aboutCourse && /\b(projetos?|exemplo)\b/.test(normalized))) topic = "project";
    else if (/\b(comeca do zero|comecar do zero|iniciante\w*|nunca (fiz codigo|programei)|preciso saber (programar|codigo|programacao)|tem que saber programar)\b/.test(normalized) ||
      (aboutCourse && /\b(dificil|do zero|experiencia|sem saber programar)\b/.test(normalized))) topic = "beginner";
    else if (aboutCourse && /\b(1o|1|primeiro|1a|primeira) (ano|serie)\b/.test(normalized)) topic = "firstYear";
    else if (/\b(quais linguagens|que linguagens|linguagens de programacao)\b/.test(normalized) ||
      (aboutCourse && /\b(linguagens?|ferramentas?|python|javascript)\b/.test(normalized))) topic = "tools";
    else if (/\b(quais (sao as )?(materias|disciplinas)|que (materias|disciplinas)|grade curricular)\b/.test(normalized) ||
      (aboutCourse && /\b(materias|disciplinas|conteudos|grade)\b/.test(normalized))) topic = "subjects";
    else if (mentionsCourse || /\b(o que (se aprende|aprendo|vou aprender)|o que voces (fazem|estudam|aprendem))\b/.test(normalized)) topic = "course";

    if (topic) {
      lastFairTopic = topic;
      return { text: fairAnswers[topic], topic };
    }

    const answer = topics.find(({ match }) => match.test(normalized))?.answer;
    lastFairTopic = null;
    return {
      text: answer || "Ainda não tenho uma resposta para essa pergunta. Toque em Mais perguntas para ver exemplos sobre o curso, jogos e programação. Para dúvidas específicas da escola, procure a coordenação ou a secretaria."
    };
  }

  function renderLogicQuestion() {
    const question = logicQuestions[logicIndex];
    logicForm.reset();
    logicForm.hidden = false;
    byId("logic-summary").hidden = true;
    byId("logic-progress").textContent = `Questão ${logicIndex + 1} de ${logicQuestions.length}`;
    logicQuestion.textContent = question.prompt;
    logicOptions.forEach((label, index) => {
      label.querySelector("input").disabled = false;
      label.querySelector("span").textContent = question.options[index];
    });
    logicCheck.hidden = false;
    logicNext.hidden = true;
    logicFeedback.textContent = "";
  }

  function startLogic() {
    logicIndex = 0;
    logicScore = 0;
    renderLogicQuestion();
  }

  function updateProjectStatus() {
    const borrowed = borrowedBooks.has(projectBook.value);
    projectStatus.textContent = borrowed ? "Emprestado" : "Disponível";
  }

  function openProject() {
    cancelRecording();
    stopSpeaking();
    projectFeedback.textContent = "";
    updateProjectStatus();
    projectDialog.showModal();
  }

  projectBook.addEventListener("change", () => {
    projectFeedback.textContent = "";
    updateProjectStatus();
  });

  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const book = projectBook.value;
    const borrowed = borrowedBooks.has(book);
    if (event.submitter?.value === "return") {
      if (borrowed) borrowedBooks.delete(book);
      projectFeedback.textContent = borrowed
        ? "Devolução registrada. O exemplar está disponível para outro visitante."
        : "Este exemplar já está disponível.";
    } else {
      if (!borrowed) borrowedBooks.add(book);
      projectFeedback.textContent = borrowed
        ? "Empréstimo bloqueado. Este exemplar já está emprestado."
        : "Empréstimo registrado. Tente emprestar o mesmo exemplar outra vez.";
    }
    updateProjectStatus();
  });

  function openChallenge() {
    if (logicDialog.open) return;
    cancelRecording();
    stopSpeaking();
    startLogic();
    logicDialog.showModal();
    logicQuestion.focus();
  }

  function addAction(container, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-secondary";
    button.textContent = label;
    button.addEventListener("click", onClick);
    container.append(button);
  }

  function addMessage(text, isUser = false, topic) {
    const article = document.createElement("article");
    article.className = isUser ? "message user" : "message assistant";
    if (!isUser) article.append(welcome.querySelector("img").cloneNode());
    const content = document.createElement("div");
    content.className = "message-content";
    const author = document.createElement("strong");
    author.textContent = isUser ? "Você" : "Darcyzinho";
    const body = document.createElement("p");
    body.textContent = text;
    content.append(author, body);
    if (!isUser) {
      const actions = document.createElement("div");
      actions.className = "message-actions";
      if (synthesis && window.SpeechSynthesisUtterance) {
        addAction(actions, "Ouvir resposta", () => {
          cancelRecording();
          speak(text, true);
        });
      }
      for (const question of fairFollowups[topic] || []) {
        addAction(actions, question, () => ask(question));
      }
      if (topic === "project") {
        addAction(actions, "Experimentar a biblioteca", openProject);
      }
      if (topic === "challenge") {
        addAction(actions, "Abrir desafio de lógica", openChallenge);
      }
      if (actions.childElementCount) content.append(actions);
    }
    article.append(content);
    chat.append(article);
    chat.scrollTop = chat.scrollHeight;
  }

  function allowQuestions(allowed) {
    for (const button of [submit, mic, challengeButton, moreQuestions, ...shortcuts]) button.disabled = !allowed;
  }

  function ask(question) {
    if (!question || responseTimer) return false;
    cancelRecording();
    stopSpeaking();
    setNotice();
    addMessage(question, true);
    setFace("thinking");
    allowQuestions(false);
    responseTimer = setTimeout(() => {
      responseTimer = 0;
      const { text, topic } = replyTo(question);
      addMessage(text, false, topic);
      allowQuestions(true);
      setFace("idle");
      speak(text);
    }, 220);
    return true;
  }

  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    if (ask(input.value.trim())) input.value = "";
  });
  input.addEventListener("input", () => {
    if (recording) cancelRecording();
  });
  moreQuestions.addEventListener("click", () => {
    cancelRecording();
    stopSpeaking();
    questionsDialog.showModal();
  });
  for (const button of shortcuts) {
    button.addEventListener("click", () => {
      if (questionsDialog.open) questionsDialog.close();
      ask(button.dataset.question);
    });
  }
  const challengeButton = document.querySelector("[data-challenge]");
  challengeButton.addEventListener("click", openChallenge);
  logicForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = new FormData(logicForm).get("answer");
    if (logicCheck.hidden || answer === null) return;
    const question = logicQuestions[logicIndex];
    const correct = Number(answer) === question.correct;
    if (correct) logicScore++;
    logicFeedback.textContent = correct
      ? `Correto! ${question.explanation}`
      : `Resposta correta: ${question.options[question.correct]} ${question.explanation}`;
    for (const label of logicOptions) label.querySelector("input").disabled = true;
    logicCheck.hidden = true;
    logicNext.hidden = false;
    logicNext.textContent = logicIndex === logicQuestions.length - 1 ? "Ver resultado" : "Próxima questão";
    logicNext.focus();
  });

  logicNext.addEventListener("click", () => {
    logicIndex++;
    if (logicIndex < logicQuestions.length) {
      renderLogicQuestion();
      logicQuestion.focus();
      return;
    }
    logicForm.hidden = true;
    byId("logic-progress").textContent = "Desafio concluído";
    byId("logic-summary").hidden = false;
    const result = byId("logic-result");
    result.textContent = `Você acertou ${logicScore} de ${logicQuestions.length} questões.`;
    result.focus();
  });

  byId("logic-restart").addEventListener("click", () => {
    startLogic();
    logicQuestion.focus();
  });
  mic.addEventListener("click", toggleMicrophone);

  sound.addEventListener("click", () => {
    if (!synthesis || !window.SpeechSynthesisUtterance) {
      setNotice("Este navegador não oferece leitura em voz alta. As respostas ficam na conversa.");
      return;
    }
    soundEnabled = !soundEnabled;
    sound.setAttribute("aria-pressed", String(soundEnabled));
    byId("sound-label").textContent = soundEnabled ? "Som ligado" : "Som desligado";
    byId("sound-icon").setAttribute("href", soundEnabled ? "#i-sound" : "#i-mute");
    if (!soundEnabled) stopSpeaking();
    if (recording || responseTimer) return;
    setNotice(soundEnabled ? "As próximas respostas serão lidas em voz alta." : "Leitura em voz alta desligada.");
    if (soundEnabled) speak(voiceSample);
  });

  byId("reset").addEventListener("click", () => {
    clearTimeout(responseTimer);
    responseTimer = 0;
    cancelRecording();
    stopSpeaking();
    allowQuestions(true);
    setFace("idle");
    lastFairTopic = null;
    borrowedBooks.clear();
    projectForm.reset();
    chat.replaceChildren(welcome.cloneNode(true));
    input.value = "";
    setNotice("Uma nova conversa está pronta.");
    input.focus();
  });
  byId("about").addEventListener("click", () => byId("about-dialog").showModal());
  window.addEventListener("pagehide", () => {
    cancelRecording();
    stopSpeaking();
  });
})();
