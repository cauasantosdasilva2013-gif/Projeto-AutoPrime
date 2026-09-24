# AutoPrime — versão Angular

Projeto original migrado para **Angular**, mantendo a estrutura visual e as funcionalidades existentes.

## O que foi corrigido para o projeto voltar a funcionar

- **`angular.json` estava incompleto**: faltavam as propriedades obrigatórias `outputPath` e `index` na configuração de build. Sem elas, `ng serve` e `ng build` falhavam de cara. Foram adicionadas.
- **Formulário de login sem estilo**: na migração para Angular, o formulário perdeu o `id="formLogin"` que o CSS original usava para estilizar campos e botão. Foi trocado por uma classe reutilizável `.form-auth`, aplicada também no novo formulário de cadastro.

## Funcionalidades

- Migração das telas para Angular com componentes standalone.
- Rotas Angular para Login, Cadastro, Dashboard, Agendamento, Veículos e Relatórios.
- **Route Guard**: páginas internas (`authGuard`) exigem uma sessão; usuário não autenticado é enviado para `/login`. As telas de `/login` e `/cadastro` usam `loginGuard`, que redireciona para `/dashboard` quem já está logado.
- **Cadastro de novo usuário** em `/cadastro`: nome, e-mail, senha e confirmação de senha, com validação de e-mail já existente, senha mínima de 4 caracteres e senhas coincidentes. Ao cadastrar, o usuário já entra logado.
- O login agora **só autentica usuários existentes** (antes, qualquer e-mail/senha era aceito e criava uma conta silenciosamente — isso foi substituído pela tela de cadastro explícita).
- Acesso de demonstração mantido:
  - E-mail: `admin@autoprime.com`
  - Senha: `123456`
- Logo textual `AutoPrime` substituída pela logo enviada no arquivo `src/assets/img/logo-autoprime.jpeg` (usada na tela de login e no menu lateral).
- Carrossel aumentado e centralizado na tela de login, mantendo as mesmas imagens, setas, pontos e troca automática. A lógica do carrossel agora vive em um componente compartilhado (`AuthLayoutComponent`), reaproveitado por Login e Cadastro.
- Layout responsivo para desktop, notebook, tablet e celular.
- Menu lateral se transforma em menu recolhível em telas pequenas.
- Projeto original HTML/CSS/JS foi preservado integralmente em `legacy-original/` para não perder o código anterior.

## Como executar

Abra um terminal dentro desta pasta e execute:

```bash
npm install
npm start
```

Depois abra o endereço mostrado pelo Angular CLI, normalmente `http://localhost:4200/`.

Também é possível executar:

```bash
npx ng serve
```

## Como gerar a versão de produção

```bash
npm run build
```

Os arquivos de produção serão gerados em `dist/`.

## Rotas

- `/login`
- `/cadastro`
- `/dashboard` 🔒
- `/agendamento` 🔒
- `/veiculos` 🔒
- `/relatorios` 🔒

## Observação sobre segurança

O `authGuard` protege a navegação do aplicativo Angular, mas o projeto continua sendo uma aplicação sem back-end, assim como a versão original. A autenticação baseada em `localStorage` não substitui autenticação real de servidor para um sistema em produção.
