import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// SafeLink renders a react-router <Link> when a Router is available,
// otherwise falls back to a plain <a> anchor for SSR/tests.
const SafeLink = ({ to, children, className, onClick }) => {
  try {
    // If useNavigate doesn't throw, a Router context exists and we can render <Link>
    useNavigate();
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  } catch (e) {
    return (
      <a href={to} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
};

export default SafeLink;
