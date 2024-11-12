import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles/ConfiguracoesMainContent.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ConfiguracoesMainContent = ({ isNavbarVisible }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    codigoUser: '',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

    // Declarando o estado para autenticação
    const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para buscar os dados do usuário logado
  const fetchUserData = async () => {
    try {
      // Recuperando o token do cookie
      const token = Cookies.get('auth_token');

      // Fazendo a requisição com o token
      const response = await axios.get('http://localhost:3000/usuarioLogado', {
        headers: {
          Authorization: `Bearer ${token}`, // Enviando o token no header
        },
        withCredentials: true,
      });

      // Atualiza os campos com os dados do usuário logado
      setFormData({
        ...formData,
        codigoUser: response.data.codigoUser || '',
        nome: response.data.nome || '',
        email: response.data.email || '',
      });
    } catch (error) {
      alert('Usuário não está logado.');
    }
  };

  useEffect(() => {
    fetchUserData(); // Chama a função para buscar os dados quando o componente for montado
  }, []);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      const dataToSend = {
        codigoUser: formData.codigoUser,
        senha: formData.senha
      };

      const response = await fetch('http://localhost:3000/deletarUsuario', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include', // Inclui cookies na requisição
      });

      const result = await response.json();

      if (response.ok) {
        Cookies.remove('auth_token');
        setIsAuthenticated(false);
        navigate('/');
        alert('Usuário deletado com sucesso.')
      } else {
        alert('Erro ao deletar o usuario.');
      }
    } catch (error) {
      console.error('Erro ao deletar o usuario:', error);
      alert('Erro ao deletar o usuario.');
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      // Configuração dos dados para envio
      const dataToSend = {
        nome: formData.nome,
        email: formData.email,
        codigoUser: formData.codigoUser,
        senha: formData.senha
      };

      const response = await fetch('http://localhost:3000/alterarUsuario', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include', // Inclui cookies na requisição
      });

      const result = await response.json();

      if (response.ok) {
        // Atualiza o token nos cookies
        if (result.token) {
          Cookies.set('auth_token', result.token, { expires: 1 }); // Define o novo token com 1 dia de validade
        }

        // Atualiza os cookies com novas informações do usuário
        Cookies.set('nome', result.nome, { expires: 1 });
        Cookies.set('email', result.email, { expires: 1 });

        // Recarrega a página para refletir as alterações
        window.location.reload();
      } else {
        alert('Erro ao salvar os dados. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao tentar salvar os dados:', error);
      alert('Erro ao salvar os dados.');
    }
  };

  const getInputColor = (fieldName) => {
    return formData[fieldName] && document.activeElement.name !== fieldName ? 'grey' : 'black';
  };

  return (
    <div className={`settings-main-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='account-settings'>
        <ul className='settings-list'>
          <li>
            <p>Nome</p>
            <input
              type='text'
              name='nome'
              id='nome'
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              onFocus={(e) => e.target.select()}
              placeholder='Nome'
              style={{ color: getInputColor('nome') }}
            />
          </li>
          <li>
            <p>Email</p>
            <input
              type='text'
              name='email'
              id='email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={(e) => e.target.select()}
              placeholder='Email'
              style={{ color: getInputColor('email') }}
            />
          </li>
          <li>
            <p>Senha</p>
            <input
              type='password'
              name='senha'
              id='senha'
              placeholder='Senha'
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            />
          </li>
          <li>
            <p>Confirmar Senha</p>
            <input
              type='password'
              name='confirmarSenha'
              id='confirmarSenha'
              placeholder='Confirmar Senha'
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
            />
          </li>
        </ul>
        <button className='form-button' onClick={handleSave}>Salvar</button>
        <button className='form-button' onClick={handleDelete}>Excluir Dados</button>
      </div>
    </div>
  );
};

export default ConfiguracoesMainContent;
