import React, { useState, useRef } from 'react';
import '../assets/styles/LoginForm.css';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Cookies from 'js-cookie'; // Importando js-cookie

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

const LoginForm = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  
  // Declarando o estado para autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = formRef.current;

    const formData = {
      email: user.email.value,
      senha: user.senha.value,
    };

    try {
      const response = await fetch("http://localhost:3000/logar", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Essencial para cookies
      });

      const result = await response.json();

      if (response.ok) {
        // Armazena o token no cookie
        Cookies.set('auth_token', result.token, { expires: 1 }); // O token expira em 1 dia
        setIsAuthenticated(true); // Atualiza o estado para refletir a autenticação
        navigate('/'); // Redireciona para a página inicial
      } else {
        alert("Usuário ou senha incorretos!");
      }
    } catch (error) {
      alert("Erro ao processar o login!");
      console.error("Erro:", error);
    }
  };

  return (
    <FormContainer>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className='login-background'>
          <div className='login-forms'>
            <h1>Login</h1>
            <ul className='login-inputs'>
              <li>
                <p>Email</p>
                <input type='text' name='email' placeholder='Email' />
              </li>
              <li>
                <p className='forgot-password'>Esqueci Minha Senha</p>
                <p>Senha</p>
                <input type='password' name='senha' placeholder='Senha' />
              </li>
            </ul>
            <button className='login-button' type='submit'>
              Entrar
            </button>
            <p className='create-account-link'>
              Não possui uma conta?
              <span>
                <Link to='/cadastro' className='link-cadastro'>
                  Cadastrar-se
                </Link>
              </span>
            </p>
          </div>
        </div>
      </form>
    </FormContainer>
  );
};

export default LoginForm;
