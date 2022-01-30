import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const NavLink = ({to, children}) => {
    var active = false
    const location = useLocation();
    if (to === location.pathname)
        active = true
    return (
        <Nav.Link active={active} as={Link} to={to}>{children}</Nav.Link>
    )
}

const Header = () => {
    return (
        <header className="d-flex bg-dark text-white">
            <Container className="d-flex flex-wrap justify-content-center py-3 mb-4 align-items-center ">
                <div className="d-flex mb-lg-0 mb-3 mb-md-1 me-md-auto text-decoration-none">
                    <span className="fs-4">TempestCo</span>
                </div>
                <Nav variant="pills">
                    <NavLink  to="/" active="true">Home</NavLink>
                </Nav>
            </Container>
        </header>
    )
}


export default Header