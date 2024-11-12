import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import '../assets/styles/Navbar.css';
import { ModalContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faSquarePollVertical, faCalendar, faClockRotateLeft, faUserPlus, faGear } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

const Navbar = ({ theme, setTheme, isVisible }) => {
  const { setOpenModal } = useContext(ModalContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o token está presente no cookie
    const token = Cookies.get('auth_token');
    setIsAuthenticated(!!token); // Atualiza o estado com base na presença do token
  }, []);

  const toggle_mode = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light');
  };

  const handleLogout = () => {
    // Remove o token do cookie
    Cookies.remove('auth_token');
    setIsAuthenticated(false); // Atualiza o estado
    navigate('/cadastro');
  };

  return (
    <nav className={`navbar ${isVisible ? '' : 'collapsed'}`}>
      {isVisible && (
        <div>
          <span className='button-to-dark-mode'>
            <FontAwesomeIcon
              icon={theme === 'light' ? faMoon : faSun}
              onClick={toggle_mode}
            />
          </span>

          <ul className='list-navbar'>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faSquarePollVertical} />
                </span>
                Projetos
              </Link>
            </li>
            <li className='navbar-items'>
              <Link to={'/calendar'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faCalendar} />
                </span>
                Calendário
              </Link>
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/history'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </span>
                Histórico
              </Link>
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/settings'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faGear} />
                </span>
                Configurações
              </Link>
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              {isAuthenticated ? (
                <span onClick={handleLogout} className='link'>
                  Logout
                </span>
              ) : (
                <Link to={'/cadastro'} className='link'>
                  Entrar
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
