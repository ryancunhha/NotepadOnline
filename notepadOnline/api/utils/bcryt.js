import bcrypt from "bcrypt";

const SALT = 10;

// Gera o hash da senha antes de salvar
export async function gerarHash(senha) {
    if (!senha) return "";
    return await bcrypt.hash(senha, SALT);
}

// Compara a senha digitada pelo usuário com o hash salvo no JSON
export async function verificarSenha(senhaDigitada, hashSalvo) {
    // Se a nota não tinha senha e o usuário não enviou senha, está liberado
    if (!hashSalvo && !senhaDigitada) return true;

    // Se tem hash mas não enviou senha (ou vice-versa), bloqueia
    if (!senhaDigitada || !hashSalvo) return false;

    // Compara a senha em texto limpo com o hash
    return await bcrypt.compare(senhaDigitada, hashSalvo);
}