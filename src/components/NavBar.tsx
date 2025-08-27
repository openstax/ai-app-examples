import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import './NavBar.css';

const navElement = document.createElement('nav');
navElement.classList.add('main-nav');

export const NavBar = () => {
  const auth = useAuth();
  const navRef = React.useRef<HTMLElement>(navElement);

  React.useEffect(() => {
    document.body.insertBefore(navRef.current, document.body.firstChild);

    return () => {
      if (navRef.current) {
        document.body.removeChild(navRef.current);
      }
    };
  }, []);

  return ReactDOM.createPortal(
    <ul>
      <li><Link to="/">Home</Link></li>
      {auth.userInfo ? <li><button type="button">Logout</button></li> : null}
    </ul>,
    navRef.current
  );
}
