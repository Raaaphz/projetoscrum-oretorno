import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/CalendarioMainContent.css';
import Fullcalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import axios from 'axios';

const CalendarioMainContent = ({ isNavbarVisible }) => {
  const [calendario, setCalendario] = useState([]); // Estado para armazenar os projetos
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const calendarRef = useRef(null);
  const trashRef = useRef(null); // Referência para o ícone da lixeira
  
  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const dataInicio = document.getElementById('dataInicio').value;
    const dataTermino = document.getElementById('dataTermino').value;
  
    // Obtém o token JWT do cookie usando js-cookie
    const token = Cookies.get('auth_token');
  
    try {
      // Envia os dados ao backend usando axios
      const response = await axios.post('http://localhost:3000/addEvento', {
        titulo: titulo,
        descricao: descricao,
        dataInicio: dataInicio,
        dataTermino: dataTermino,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Inclui o token JWT no header
        },
        withCredentials: true, // Garante que os cookies sejam enviados
      });
  
      // Verifica se a resposta contém o código do evento salvo
      const { codigoCalendario } = response.data;
      
      // Criação do evento para adicionar ao calendário
      const newEvent = {
        id: codigoCalendario, 
        title: titulo,
        start: dataInicio,
        end: dataTermino,
        extendedProps: {
          description: descricao,
        },
      };
  
      // Adiciona o novo evento ao calendário
      calendarRef.current.getApi().addEvent(newEvent);
      
      setOpenModal(false);
      alert('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error.response ? error.response.data : error);
    }
  };
  
  const handleDeleteEvent = async (event) => {
    // Obtém o token JWT do cookie usando js-cookie
    const token = Cookies.get('auth_token');
  
    try {
      // Envia uma requisição DELETE para o backend para remover o evento com base no `event.id`
      const response = await axios.delete('http://localhost:3000/deletarEvento', {
        data: { codigoCalendario: event.id }, // Passa o id do evento a ser excluído
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Garante que os cookies sejam enviados
      });
  
      console.log('Resposta do servidor:', response.data);
  
      // Remove o evento do calendário imediatamente
      event.remove();
  
    } catch (error) {
      console.error('Erro ao excluir evento:', error.response ? error.response.data : error);
      alert('Erro ao excluir o evento. Por favor, tente novamente.');
    }
  };  
 
  const fetchCalendario = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
  
      // Faz a requisição para buscar os eventos
      const response = await axios.get('http://localhost:3000/getEventos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      // Atualiza o estado com os dados recebidos
      setCalendario(response.data);
  
      // Adiciona cada evento ao calendário
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        // Limpa eventos anteriores para evitar duplicações
        calendarApi.removeAllEvents();
        // Adiciona os eventos retornados do servidor
        response.data.forEach(event => {
          calendarApi.addEvent({
            id: event.codigoCalendario, 
            title: event.titulo,
            start: event.dataInicio,
            end: event.dataTermino,
            extendedProps: {
              description: event.descricao,
            },
          });
        });
      }
    } catch (error) {
      console.error('Erro ao buscar eventos: ', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCalendario();
  }, []);  
  
  const isOverTrash = (event) => {
    const trashRect = trashRef.current.getBoundingClientRect();
    const eventX = event.jsEvent.clientX;
    const eventY = event.jsEvent.clientY;

    return (
      eventX >= trashRect.left &&
      eventX <= trashRect.right &&
      eventY >= trashRect.top &&
      eventY <= trashRect.bottom
    );
  };

  return (
    <div className={`calendar-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='calendar-wrapper'>
        <div className='calendar-container'>
          <Fullcalendar
            eventDisplay='auto'
            dayMaxEvents={3}
            moreLinkClick={(arg) => {
              console.log(arg);
            }}
            moreLinkClassNames='more-link'
            inclusiveEnd={true}
            displayEventEnd={true}
            editable={true}
            eventDurationEditable={true}
            eventStartEditable={true}

            eventMouseEnter={(arg) => {
              console.log(arg);
            }}
            eventMouseLeave={(arg) => {
              console.log(arg);
            }}
            eventDragStart={() => {
              // Reseta o estado se necessário
            }}
            eventDragStop={(arg) => {
              if (isOverTrash(arg)) {
                handleDeleteEvent(arg.event); // Exclui o evento imediatamente
              }
            }}
            eventDrop={(arg) => {
              // Adicione a lógica para atualizar o evento no banco de dados com base nos valores modificados.
            }}
            eventResize={(arg) => {
              // Adicione a lógica para atualizar o evento no banco de dados com base nos valores redimensionados.
            }}
            ref={(calendar) => (calendarRef.current = calendar)}
            className='calendar'
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={'dayGridMonth'}
            headerToolbar={{
              start: 'today prev,next',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek,timeGridDay, addEventButton',
            }}
            width={'600px'}
            height={'600px'}
            customButtons={{
              addEventButton: {
                text: 'Adicionar evento',
                click: () => setOpenModal(true),
              },
            }}
          />
        </div>
        <span className='trash-icon-event' ref={trashRef}>
          <FontAwesomeIcon icon={faTrashCan} />
        </span>
      </div>
      <Modal isOpen={openModal}>
        <div className='modal-event-inputs'>
          <ul className='event-inputs'>
            <li>
              <p>Título:</p>
              <input type='text' 
              name='titulo'
              id='titulo'
              onChange={(e) => setTitle(e.target.value)} />
            </li>
            <li>
              <p>Descrição:</p>
              <input type='text' 
              name='descricao'
              id='descricao'
              onChange={(e) => setDescription(e.target.value)} />
            </li>
            <li>
              <p>Data de início:</p>
              <input type='date'
              name='dataInicio'
              id='dataInicio'
              onChange={(e) => setDate(e.target.value)} />
            </li>
            <li>
              <p>Data de término:</p>
              <input type='date' 
              name='dataTermino'
              id='dataTermino'
              onChange={(e) => setEndDate(e.target.value)} />
            </li>
          </ul>
          <button className='create-event' onClick={handleAddEvent}>
            Adicionar evento
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarioMainContent;
