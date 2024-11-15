import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/ProjetosMainContent.css';
import Modal from './Modal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CustomPrevArrow, CustomNextArrow } from '../components/CustomArrows';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { IMaskInput } from "react-imask";


const ProjetosMainContent = ({ isNavbarVisible }) => {
  const [projetos, setProjetos] = useState([]); // Estado para armazenar os projetos
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null); // Estado de erro
  const [openModal, setOpenModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    codigoProj: '',
  });

  // Função para buscar projetos do usuário logado
  const fetchProjetos = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');

      const response = await axios.get('http://localhost:3000/getProjetos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,  // Garantir que os cookies sejam enviados
      });
      setProjetos(response.data); // Atualiza o estado com os projetos recebidos
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos(); // Busca os projetos ao carregar o componente
  }, []);

  const handleCreateProjectAndCloseModal = async (e) => {
    e.preventDefault();

    // Pega os valores do formulário
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const dataEntrega = document.getElementById('dataEntrega').value;

    const token = Cookies.get('auth_token');

    // Log dos valores para checagem
    console.log('Valores do formulário:', { nome, descricao, dataEntrega });
    console.log('Token de autenticação:', token);

    try {
      const response = await axios.post('http://localhost:3000/criarProj',
        { nome, descricao, dataEntrega }, // Dados sendo enviados
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true, // Garantir que os cookies sejam enviados
        });

      console.log('Resposta do servidor:', response.data);
      setOpenModal(false);
      window.location.reload();
      alert('Projeto criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar projeto:', error.response ? error.response.data : error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleTrashClick = () => {
    setDeleteMode((prevMode) => !prevMode);
  };

  const handleCardClick = (codigoProj) => {
    if (!codigoProj) {
      console.warn('Código do Projeto não fornecido.');
      return;
    }

    setFormData((prevData) => ({ ...prevData, codigoProj })); // Armazena o código do projeto no estado formData

    if (deleteMode) {
      setSelectedCard(codigoProj); // Armazena o código do projeto selecionado para exclusão
      setOpenDeleteModal(true); // Abre o modal de exclusão
    } else {
      console.log('Modo de exclusão não está ativo.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!formData.codigoProj) {
        alert('Código do projeto não encontrado.');
        return;
      }

      const dataToSend = {
        codigoProj: formData.codigoProj
      };

      const response = await fetch('http://localhost:3000/deletarProj', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Projeto deletado com sucesso');
        setOpenDeleteModal(false);
        setDeleteMode(false);
        setSelectedCard(null);
        window.location.reload();
      } else {
        alert(result.mensagem || 'Erro ao deletar o projeto');
        setOpenDeleteModal(false);
        setDeleteMode(false);
        setSelectedCard(null);
      }
    } catch (error) {
      console.error('Erro ao deletar o projeto: ', error);
      alert('Erro ao deletar o projeto.');
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
    setSelectedCard(null);
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <div className={`projects-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <span className={`trash-icon-project ${deleteMode ? 'active' : ''}`} onClick={handleTrashClick}>
        <FontAwesomeIcon icon={faTrashCan} />
      </span>

      <button className='create-button' onClick={() => setOpenModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Projeto
      </button>

      <Modal isOpen={openModal}>
        <div className='modal-project-inputs'>
          <ul className='project-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                id='nome'
                name='nome'
                placeholder='Nome do projeto'
              />
            </li>
            <li>
              <p>Descrição</p>
              <input
                type='text'
                id='descricao'
                name='descricao'
                placeholder='Descrição do projeto'
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <IMaskInput
                mask="00/00/0000"
                type='text'
                id='dataEntrega'
                name='dataEntrega' />
            </li>
            <li>
              <p>Adicionar membros</p>
              <input
                className='select-members'
                type='text'
                placeholder='Aperte enter para adicionar'
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Lógica para enviar membros ao backend
                    setMemberName('');
                  }
                }}
              />
            </li>
          </ul>
          <button
            className='create-project'
            onClick={handleCreateProjectAndCloseModal}
          >
            Criar
          </button>
          <button className='cancel-project' onClick={handleCloseModal}>
            Cancelar
          </button>
        </div>
      </Modal>

      {loading ? (
        <p>Carregando projetos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : projetos.length > 0 ? (
        <div className='project-cards-container'>
          <Slider {...settings}>
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className={`project-card ${deleteMode ? 'shake' : ''}`}
                onClick={() => handleCardClick(projeto.codigoProj)} // Passa `codigoProj` ao clicar
              >
                <Link className='link' to={`/projeto/${projeto.codigoProj}`}>
                  <div className='project-cards'>
                    <h1>{projeto.nome}</h1>
                    <h2>{projeto.descricao}</h2>
                    <h3>Data de entrega: {projeto.dataEntrega}</h3>
                  </div>
                </Link>
                {deleteMode && <FontAwesomeIcon icon={faCircleXmark} className='delete-icon' />}
              </div>
            ))}

          </Slider>
        </div>
      ) : (
        <p>Nenhum projeto encontrado.</p>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {openDeleteModal && (
        <Modal isOpen={openDeleteModal} onClose={handleDeleteCancel}>
          <div className='modal-delete-daily'>
            <p>Tem certeza que deseja excluir esse projeto?</p>
            <div className='buttons-container'>
              <button className='delete-confirm' onClick={handleDeleteConfirm}>
                Sim
              </button>
              <button className='delete-cancel' onClick={handleDeleteCancel}>
                Não
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjetosMainContent;
