import React, { useEffect, useState } from 'react';
import { Container, Image, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMobile } from "react-device-detect";
import * as api from '../api/api';


const NavLink = ({ to, children }) => {
    var active = false
    const navigator = useNavigate()
    const location = useLocation();

    const handleClick = () => {
        navigator(to);
    };

    if (to === location.pathname)
        active = true
    return (
        <Nav.Link className="mx-2" active={active} onClick={handleClick}>{children}</Nav.Link>
    )
}
const NavItems = () => {
    const [login, setLogin] = useState(false)
    useEffect(() => {
        const inverval = setInterval(() => setLogin(api.settings.login), 100);
        return () => clearInterval(inverval);
    });

    return <>
        <NavLink to="/" active="true">Home</NavLink>
        {
            !login ? <NavLink to="/login" active="true">Login</NavLink> :
                <>
                    <NavDropdown className="mx-2" title={
                        <>
                            <Image roundedCircle="true h-100" className="thumbnail-image me-2" src={`https://cravatar.eu/helmavatar/${api.settings.username}/28.png`} />
                            {api.settings.username}
                        </>
                    }>
                        <NavDropdown.Item onClick={api.logout}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </>
        };
    </>
};


const Header = () => {

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand={isMobile ? "lg": true}>
                <Container>
                    <Navbar.Brand>
                        TempestCo {isMobile ? "Yes" : "no"}
                    </Navbar.Brand>
                    {isMobile ? <>

                        <Navbar.Toggle aria-controls="navbar-nav" />
                        <Navbar.Collapse id="navbar-nav" >
                                <Nav>
                                    <NavItems />
                                </Nav>
                            </Navbar.Collapse>

                    </> :
                        <Nav variant="pills">
                            <NavItems />
                        </Nav>}
                </Container>
            </Navbar>
        </header>
    )
}


export default Header