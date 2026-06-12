# Presente Dia dos Namorados 💜

Site estático fofo, quiz com perguntas e revela fotos. Servido por nginx via Docker.

## Como rodar

```bash
cd D:\presente-namorados
docker compose up -d
```

Abrir no navegador: http://localhost:8080

Parar:
```bash
docker compose down
```

## Como personalizar

### 1. Trocar perguntas e textos
Editar `public/data.json`. Cada pergunta tem:
- `pergunta` — texto da pergunta
- `opcoes` — lista com 4 alternativas (ordem livre, todas levam à revelação)
- `resposta` — texto fofo que aparece junto da foto
- `foto` — caminho da imagem (ex: `photos/01.jpg`)
- `legenda` — frase curta acima do texto

Bloco `final` controla a tela de encerramento.

### 2. Trocar fotos
Colocar arquivos em `public/photos/` com os nomes referenciados no JSON (`01.jpg`, `02.jpg`, ...).

Recomendado: imagens horizontais, ~1200x900px, formato `.jpg` ou `.webp`.

### 3. Trocar cores
Editar variáveis CSS no topo de `public/styles.css` (`--lilac-*`, `--purple-*`).

## Estrutura

```
presente-namorados/
├── docker-compose.yml
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── data.json
│   └── photos/
└── README.md
```

Recarregar página = pegar mudanças (volume é montado direto, sem rebuild).
