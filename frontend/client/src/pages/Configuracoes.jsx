import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ConfiguracoesMainContent from '../components/ConfiguracoesMainContent';

function Configuracoes({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <ConfiguracoesMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Configuracoes;
