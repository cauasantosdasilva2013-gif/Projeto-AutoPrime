/* =========================================================
   AUTOPRIME - LOGIN
   ========================================================= */

const CAMINHO_RAIZ = "./";

document.addEventListener("DOMContentLoaded", () => {

    // já logado? vai direto pro dashboard
    if (localStorage.getItem(LS_SESSAO)) {
        window.location.href = "html/dashboard.html";
        return;
    }

    const form = document.getElementById("formLogin");
    const caixaErro = document.getElementById("loginErro");

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const email = document.getElementById("e-mail").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        caixaErro.style.display = "none";

        if (senha.length < 4) {
            caixaErro.textContent = "A senha deve ter pelo menos 4 caracteres.";
            caixaErro.style.display = "block";
            return;
        }

        const usuarios = obterLista(LS_USUARIOS);
        let usuario = usuarios.find(u => u.email === email);

        if (usuario) {
            if (usuario.senha !== senha) {
                caixaErro.textContent = "E-mail ou senha incorretos.";
                caixaErro.style.display = "block";
                return;
            }
        } else {
            // primeira vez com esse e-mail: cria conta automaticamente (demo sem servidor)
            usuario = {
                id: gerarId(usuarios),
                nome: email.split("@")[0].replace(/[._]/g, " "),
                email: email,
                senha: senha
            };
            usuarios.push(usuario);
            salvarLista(LS_USUARIOS, usuarios);
        }

        localStorage.setItem(LS_SESSAO, JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email }));
        window.location.href = "html/dashboard.html";
    });
});
