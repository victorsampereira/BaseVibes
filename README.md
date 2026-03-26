# VotoChain / BaseVibes Hackathon

BaseVibes e um projeto de hackathon para criar experiencias sociais onchain: um usuario cria uma sala, amigos entram nessa sala em tempo real e, ao final, o criador faz o mint de um NFT/POAP para todos os participantes.

O repositorio esta organizado como um monorepo simples com tres partes:

- `1-smart-contract`: contrato Solidity e scripts de deploy com Hardhat.
- `2-frontend-miniapp`: miniapp React para criar e entrar em uma vibe.
- `3-lobby-server`: servidor WebSocket usado para sincronizar salas e participantes em tempo real.

## Visao Geral

Fluxo esperado do produto:

1. O criador conecta a carteira no frontend.
2. O frontend abre uma conexao WebSocket com o lobby server.
3. O criador gera uma sala e recebe um codigo/QR code.
4. Outros participantes entram na sala usando o QR code.
5. O criador executa o mint onchain para todos os enderecos presentes na sala.
6. Cada participante recebe o NFT comemorativo da experiencia.

## Estrutura do Projeto

```text
BaseVibes-Hackathon/
|-- 1-smart-contract/
|   |-- contracts/BaseVibe.sol
|   |-- scripts/deploy.js
|   |-- hardhat.config.js
|-- 2-frontend-miniapp/
|   |-- src/
|   |   |-- pages/HomePage.jsx
|   |   |-- pages/CreateVibePage.jsx
|   |   |-- pages/JoinVibePage.jsx
|   |-- package.json
|-- 3-lobby-server/
|   |-- index.js
|   |-- package.json
|-- README.md
```

## Tecnologias Utilizadas

- Solidity `0.8.20`
- Hardhat
- OpenZeppelin Contracts
- React
- React Router
- Wagmi
- RainbowKit
- TanStack Query
- WebSocket (`ws`)
- Tailwind CSS

## Como Cada Modulo Funciona

### 1. Smart Contract

O contrato `BaseVibe.sol` herda de `ERC721Enumerable` e expoe a funcao `mintVibe(address[] participants, string tokenURI)`, que percorre a lista de participantes e tenta mintar um NFT para cada endereco.

Responsabilidades desse modulo:

- definir o NFT da experiencia;
- fazer o mint em lote para os participantes;
- permitir deploy na rede Base Sepolia.

Arquivos principais:

- `contracts/BaseVibe.sol`
- `scripts/deploy.js`
- `hardhat.config.js`

### 2. Frontend Miniapp

O frontend oferece tres telas:

- `HomePage`: tela inicial com opcao de criar ou entrar em uma vibe;
- `CreateVibePage`: cria a sala, exibe QR code, lista participantes e dispara o mint;
- `JoinVibePage`: tenta ler um QR code para entrar em uma sala.

O frontend usa:

- `RainbowKit` para conectar carteira;
- `wagmi` para enviar a transacao de mint;
- `@tanstack/react-query` como dependencia de suporte do ecossistema wagmi/rainbowkit;
- WebSocket para sincronizar participantes;
- QR code para onboarding rapido dos convidados.

### 3. Lobby Server

O servidor WebSocket roda na porta `8080` e mantem salas em memoria.

Acoes implementadas:

- `CREATE_ROOM`
- `JOIN_ROOM`
- `ROOM_CREATED`
- `PARTICIPANTS_UPDATED`
- `ERROR`

Caracteristicas atuais:

- gera codigos de sala com 4 letras;
- armazena clientes e participantes em memoria;
- remove participantes ao fechar a conexao;
- apaga a sala quando nao ha mais clientes conectados.

## Requisitos

Antes de rodar o projeto, tenha instalado:

- Node.js 18+ recomendado
- npm
- uma wallet EVM compativel
- saldo de teste na Base Sepolia, se quiser testar o mint onchain

## Instalacao

Como os modulos sao independentes, a instalacao deve ser feita em cada pasta.

### Smart Contract

```bash
cd 1-smart-contract
npm install
```

### Frontend

```bash
cd 2-frontend-miniapp
npm install
```

### Lobby Server

```bash
cd 3-lobby-server
npm install
```

## Configuracao

### Variaveis de ambiente do contrato

Crie um arquivo `.env` em `1-smart-contract/`:

```env
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
BASESCAN_API_KEY=SUA_API_KEY
```

Observacoes:

- `PRIVATE_KEY` e usada para o deploy na Base Sepolia;
- `BASESCAN_API_KEY` e usada para verificacao no BaseScan;
- nunca commite esse arquivo.

### Configuracao do frontend

Existem placeholders que precisam ser ajustados antes de um fluxo real de ponta a ponta:

- `src/index.js`
  - substituir `YOUR_PROJECT_ID` por um `projectId` valido do WalletConnect;
- `src/pages/CreateVibePage.jsx`
  - substituir `contractAddress` pelo endereco real do contrato deployado;
  - substituir o `tokenURI` placeholder por um URI real, idealmente hospedado em IPFS;
- `src/pages/JoinVibePage.jsx`
  - alinhar a leitura do QR code com o formato realmente gerado na tela de criacao.

## Como Rodar em Desenvolvimento

Abra tres terminais.

### 1. Subir o servidor WebSocket

```bash
cd 3-lobby-server
node index.js
```

Servidor esperado:

```text
WebSocket server started on port 8080
```

### 2. Rodar o frontend

```bash
cd 2-frontend-miniapp
npm start
```

O app deve abrir em `http://localhost:3000`.

### 3. Compilar ou fazer deploy do contrato

Para compilar:

```bash
cd 1-smart-contract
npx hardhat compile
```

Para deploy na Base Sepolia:

```bash
cd 1-smart-contract
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Fluxo de Uso Esperado

### Criar uma vibe

1. Conecte a carteira.
2. Entre na tela de criacao.
3. Clique em `Create a New Vibe`.
4. Compartilhe o codigo ou o QR code com os participantes.
5. Aguarde todos entrarem.
6. Clique em `Mint for X People`.

### Entrar em uma vibe

1. Conecte a carteira.
2. Entre na tela de participacao.
3. Escaneie o QR code.
4. Aguarde o criador fazer o mint.

## Estado Atual do Projeto

O repositorio representa um prototipo funcional em partes, mas ainda nao esta pronto como produto completo. Alguns pontos importantes do estado atual:

- o frontend referencia `@tanstack/react-query`, mas essa dependencia nao esta listada no `package.json` do frontend;
- o setup do Hardhat atual nao compila diretamente com a versao instalada, que exige projeto em ESM;
- o contrato usa `_setTokenURI`, mas a heranca atual via `ERC721Enumerable` nao fornece esse comportamento sozinha;
- o endereco do contrato no frontend e placeholder;
- o `tokenURI` usado no mint e placeholder;
- o `projectId` do WalletConnect esta como placeholder;
- o `JoinVibePage` trata o valor lido do QR como codigo puro da sala, enquanto a tela de criacao gera uma URL completa;
- o lobby server guarda estado apenas em memoria, sem persistencia.

## Limitacoes Conhecidas

- Sem persistencia de salas ou participantes.
- Sem autenticacao alem da carteira conectada.
- Sem validacao forte de entradas no servidor.
- Sem testes automatizados relevantes no estado atual.
- Sem pipeline de deploy integrado.
- Sem indexacao dos NFTs mintados.
- Sem backend para upload de metadata para IPFS.

## Melhorias Recomendadas

- corrigir o contrato para suportar metadata corretamente;
- alinhar o projeto Hardhat ao modo ESM ou fixar uma stack compativel;
- adicionar `@tanstack/react-query` ao frontend;
- mover configuracoes sensiveis e enderecos para `.env`;
- ajustar o parse do QR code na entrada da sala;
- adicionar persistencia para salas;
- criar testes para contrato, frontend e servidor;
- implementar upload real de metadata para IPFS/Pinata;
- adicionar validacao de rede para garantir uso em Base Sepolia.

## Scripts Disponiveis

### `1-smart-contract`

```bash
npm test
```

Atualmente esse script ainda e placeholder.

### `2-frontend-miniapp`

```bash
npm start
npm build
npm test
```

### `3-lobby-server`

```bash
npm test
```

Tambem esta como placeholder.

## Validacao Feita Neste Repositorio

Durante a revisao deste README, foi verificado que:

- `2-frontend-miniapp` nao gera build no estado atual por falta de dependencia;
- `1-smart-contract` nao compila no estado atual por incompatibilidade de configuracao do Hardhat;
- o servidor WebSocket possui codigo de inicializacao, mas nao foi mantido rodando como processo persistente nesta sessao.

## Licenca

O repositorio ainda nao define uma licenca explicita nos metadados do projeto raiz. Se for publicar o codigo, vale adicionar uma licenca formal, como MIT.
