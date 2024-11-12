import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(cookieParser());

//Criando Conexão com o DB
export const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2004',
    database: 'projetoscrum'
});

// Verifica a conexão com o banco de dados
conexao.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conectado ao banco de dados MySQL.");
});

// #region USUARIOS
function verificarToken(req, res, next) {
    const token = req.cookies.auth_token; //Ler o token

    if(!token) {
        return res.status(403).send('Token não encontrado, acesso negado!');
    }

    try {
        const decoded = jwt.verify(token, 'segredo'); //Decodificar o token
        req.user = decoded; // Passar infos pro proximo middleware
        next();
    } catch (err) {
        return res.status(401).send('Token inválido');
    }
}

//Rota para cadastro de Usuario
app.post("/cadastrarUser", function(req, res){
    
    //Criptografando a senha
    bcrypt.hash (req.body.senha, 10, (errBcrypt, hash) =>{
        if (errBcrypt) {
            return res.status(500).json({ error: 'Erro ao criptografar a senha'});
        }

        //Obter dados
        let nome = req.body.nome;
        let email = req.body.email;
        let senha = hash;

        // Verificar se o email já existe
        let sqlCheckEmail = "SELECT * FROM usuarios WHERE email = ?";
        conexao.query(sqlCheckEmail, [email], function(errCheck, resultCheck) {
            if (errCheck) {
                return res.status(500).json({ error: 'Erro ao verificar o email' });
            }

            if (resultCheck.length > 0) {
                // Se já existir um usuário com o mesmo email
                return res.status(400).json({ error: 'Dados já cadastrados em outro usuário.' });
            }

            let sqlInsert = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
            conexao.query(sqlInsert, [nome, email, senha], function(erro, retorno) {
                if (erro) {
                    if (erro.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Dados já cadastrados em outro usuário.' });
                    } else {
                        return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
                    }
                }

                // Sucesso
                res.status(200).json({ message: 'Cadastro realizado com sucesso!' });
            });
        });
    })
});

//Rota para login de usuario
app.post('/logar', function(req, res) {
    const sqlLogin = 'SELECT * FROM usuarios WHERE email = ?';

    conexao.query(sqlLogin, [req.body.email], (error, results) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        if (results.length < 1) {
            return res.status(401).send({ mensagem: 'Usuário ou senha incorretos' });
        }

        bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
            if (err) {
                return res.status(401).send({ mensagem: 'Usuário ou senha incorretos' });
            }
            if (result) {
                let token = jwt.sign({
                    codigoUser: results[0].codigoUser,
                    email: results[0].email,
                    nome: results[0].nome
                }, 'segredo', { expiresIn: "24h" });

                // Definindo o cookie com o token
                res.cookie('auth_token', token, {
                    httpOnly: true, // Não acessível via JavaScript
                    secure: false, // true se estiver usando HTTPS
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    sameSite: 'None', // Importante para cookies em requests cross-origin
                });
                
                // Resposta de sucesso para o frontend
                return res.status(200).send({ mensagem: 'Autenticação bem-sucedida', token });
                
            }

            return res.status(401).send({ mensagem: 'Falha na autenticação' });
        });
    });
});

app.get('/logout', function(req, res) {
    try {
        res.clearCookie('auth_token');
        res.status(200).send('Logout realizado com sucesso');
    } catch (error) {
        console.error('Erro ao processar logout:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

app.get('/usuarioLogado', verificarToken, (req, res) => {
    const token = req.cookies.auth_token; // Recupera o token do cookie
    if (!token) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    jwt.verify(token, 'segredo', (err, decoded) => {
        if (err) {
            console.error('Erro ao verificar token:', err);
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Busca os dados do usuário com base no email ou ID
        const sqlUserData = 'SELECT codigoUser, nome, email FROM usuarios WHERE email = ?';
        conexao.query(sqlUserData, [decoded.email], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar os dados do usuário' });
            }
            if (results.length < 1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.status(200).json(results[0]); // Retorna os dados do usuário
        });
    });
});

app.put('/alterarUsuario', function(req, res) {
    const selecSenha = 'SELECT senha FROM usuarios WHERE codigoUser = ?';
    const updateUser = "UPDATE usuarios SET `nome` = ?, `email` = ? WHERE `codigoUser` = ?";

    const values = [
        req.body.nome,
        req.body.email,
        req.body.codigoUser
    ];

    console.log('Senha fornecida:', req.body.senha);  // Verificação da senha enviada

    // Se a senha não for fornecida, retornamos erro
    if (!req.body.senha) {
        return res.status(400).send({ mensagem: 'Senha não fornecida.' });
    }

    // Consulta para buscar a senha no banco de dados
    conexao.query(selecSenha, [req.body.codigoUser], (error, results) => {
        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).send({ mensagem: 'Erro interno ao consultar o banco de dados' });
        }

        // Verifica se o usuário foi encontrado
        if (results.length < 1) {
            return res.status(404).send({ mensagem: 'Usuário não encontrado' });
        }

        // Verificando o hash da senha no banco e a senha fornecida
        console.log('Hash de senha no banco:', results[0].senha);

        bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
            if (err) {
                console.error('Erro ao comparar a senha:', err);
                return res.status(500).send({ mensagem: 'Erro ao verificar a senha' });
            }

            // Se a senha não coincidir
            if (!result) {
                return res.status(401).send({ mensagem: 'Usuário ou senha incorretos' });
            }

            // Se as senhas coincidem, continua a atualização
            conexao.query(updateUser, [...values, req.body.codigoUser], (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar usuário:', err);
                    return res.status(500).json(err);
                }

                // Gerar novo token após a atualização
                const tokenPayload = {
                    codigoUser: req.body.codigoUser,
                    nome: req.body.nome,
                    email: req.body.email,
                };

                const newToken = jwt.sign(tokenPayload, 'segredo', { expiresIn: '24h' });

                // Definir o novo cookie com o token gerado
                res.cookie('auth_token', newToken, { 
                    httpOnly: true, 
                    secure: false, // Para produção, altere para true
                    maxAge: 24 * 60 * 60 * 1000, 
                    sameSite: 'None' 
                });

                return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
            });
        });
    });
});

app.delete('/deletarUsuario', function(req, res) {
    const selecSenha = 'SELECT senha FROM usuarios WHERE codigoUser = ?';
    const deletarUser = "DELETE FROM usuarios WHERE `codigoUser` = ?";

    console.log('Senha fornecida:', req.body.senha);  // Verificação da senha enviada

    // Se a senha não for fornecida, retornamos erro
    if (!req.body.senha) {
        return res.status(400).send({ mensagem: 'Senha não fornecida.' });
    }
// Consulta para buscar a senha no banco de dados
conexao.query(selecSenha, [req.body.codigoUser], (error, results) => {
    if (error) {
        console.error('Erro ao consultar o banco de dados:', error);
        return res.status(500).send({ mensagem: 'Erro interno ao consultar o banco de dados' });
    }

    // Verifica se o usuário foi encontrado
    if (results.length < 1) {
        return res.status(404).send({ mensagem: 'Usuário não encontrado' });
    }

    // Verificando o hash da senha no banco e a senha fornecida
    console.log('Hash de senha no banco:', results[0].senha);

    bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
        if (err) {
            console.error('Erro ao comparar a senha:', err);
            return res.status(500).send({ mensagem: 'Erro ao verificar a senha' });
        }

        // Se a senha não coincidir
        if (!result) {
            return res.status(401).send({ mensagem: 'Usuário ou senha incorretos' });
        }

        // Se as senhas coincidem, continua a atualização

        // Acessando o codigoUser do corpo da requisição
        const codigoUser = req.body.codigoUser;

        if (!codigoUser) {
            return res.status(400).json({ mensagem: "Código de usuário não fornecido" });
        }

            // Executando a query com o valor de codigoUser
            conexao.query(deletarUser, [codigoUser], (err) => {
                if (err) {
                    return res.status(500).json(err); // Erro no banco de dados
                }

                return res.status(200).json("Usuário deletado com sucesso.");
            });
        });
    });
});
// #endregion


// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000.");
});

