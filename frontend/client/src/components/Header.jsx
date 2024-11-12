
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/Header.css';
import { useLocation } from 'react-router-dom';

const pageNameMapping = {
  '/': 'Meus Projetos',
  '/calendar': 'Calendário',
  '/history': 'Histórico',
  '/settings': 'Configurações da Conta',
};

const Header = ({ toggleNavbar, isNavbarVisible }) => {
  const location = useLocation();

  const [projectNames, setProjectNames] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setProjectNames(['Projeto Exemplo 1', 'Projeto Exemplo 2']);
    setUserName('Cadastre-se');
  }, []);

  let currentPageName = pageNameMapping[location.pathname];

  if (!currentPageName && location.pathname !== '/') {
    const projectName = decodeURIComponent(location.pathname.substring(1));
    if (projectNames.includes(projectName)) {
      currentPageName = `${projectName}`;
    } else {
      currentPageName = 'Projeto Inválido';
    }
  }

  return (
    <header className={`header ${isNavbarVisible ? '' : 'full-width'}`}>
      <span className="menu-button">
        <FontAwesomeIcon icon={faBars} onClick={toggleNavbar} />
      </span>

      <ul className="current-page">
        <li>{currentPageName}</li>
      </ul>

      <div className="user-details">
        <ul className="user-info-list">
        </ul>
      </div>
    </header>
  );
};

export default Header;
