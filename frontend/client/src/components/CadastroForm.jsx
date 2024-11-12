import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import '../assets/styles/CadastroForm.css';
import { toast } from "react-toastify";
import axios from 'axios';

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;

  .cadastro-background {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: white;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

const CadastroForm = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();

  //Validar se o que foi colocado no campo "email" segue a estrutura de uma email
  const validarEmail = (email) => {
    const usuario = email.substring(0, email.indexOf("@"));
    const dominio = email.substring(email.indexOf("@") + 1, email.length);
    return (
      usuario.length >= 1 &&
      dominio.length >= 3 &&
      usuario.indexOf("@") === -1 &&
      dominio.indexOf("@") === -1 &&
      usuario.indexOf(" ") === -1 &&
      dominio.indexOf(" ") === -1 &&
      dominio.indexOf(".") !== -1 &&
      dominio.indexOf(".") >= 1 &&
      dominio.lastIndexOf(".") < dominio.length - 1
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = formRef.current;

    if (!validarEmail(user.email.value)) {
      alert("E-mail inválido.");
      user.email.value = "";
      return;
    }

    if (user.senha.value !== user.confirmaSenha.value) {
      alert("As senhas não coincidem.");
      return;
    }

    const formData = {
      nome: user.nome.value,
      email: user.email.value,
      senha: user.senha.value,
    };

    try {
      const response = await axios.post("http://localhost:3000/cadastrarUser", {
        nome: user.nome.value,
        email: user.email.value,
        senha: user.senha.value,
        confirmaSenha: user.confirmaSenha.value,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      alert("Cadastro realizado com sucesso!");
      navigate('/login')
    } catch (error) {
      alert("Erro ao realizar o cadastro.");
    }
  };

  return (
    <FormContainer>
      <div className='cadastro-background'>
        <div className='cadastro-forms'>
          <div className='have-account'>
            <h1>Já possui uma conta?</h1>
            <Link to='/login' className='link-login'>
              <button type="button">Fazer Login</button>
            </Link>
          </div>
          <div className='cadastro-area'>
            <h1>Cadastro</h1>
            <form ref={formRef} onSubmit={handleSubmit} className='cadastro-inputs'>
              <ul>
                <li>
                  <p>Nome</p>
                  <input type='text' name='nome' placeholder='Nome completo' required />
                </li>
                <li>
                  <p>Email</p>
                  <input type='text' name='email' placeholder='Email' required />
                </li>
                <li>
                  <p>Senha</p>
                  <input type='password' name='senha' placeholder='Senha' required />
                </li>
                <li>
                  <p>Confirmar Senha</p>
                  <input type='password' name='confirmaSenha' placeholder='Confirmar Senha' required />
                </li>
              </ul>
              <button className='cadastro-button' type='submit'>Cadastrar-se</button>
            </form>
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default CadastroForm;
