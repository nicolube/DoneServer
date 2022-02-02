import React, { useEffect, useState } from 'react';
import { Button, Container, Image, Nav, Ratio } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api/api';


const NavLink = ({ to, children }) => {
    var variant = "secondary"
    const navigator = useNavigate()
    const location = useLocation();

    const handleClick = () => {
        navigator(to);
    };

    if (to === location.pathname)
        variant = "primary"
    return (
        <Button className="mx-2" variant={variant} onClick={handleClick}>{children}</Button>
    )
}

const Header = () => {
    const [login, setLogin] = useState(false)
    useEffect(() => {
        const inverval = setInterval(() => setLogin(api.settings.login), 100);
        return () => clearInterval(inverval);
    });


    return (
        <header className="d-flex bg-dark text-white">
            <Container className="d-flex flex-wrap justify-content-center py-3 mb-4 align-items-center ">
                <div className="d-flex mb-lg-0 mb-3 mb-md-1 me-md-auto text-decoration-none">
                    <span className="fs-4">TempestCo</span>
                </div>
                <Nav variant="pills">
                    <NavLink to="/" active="true">Home</NavLink>
                    {!login ? <NavLink to="/login" active="true">Login</NavLink> :
                        <>
                            <div className="mx-2">
                                <Image fluid={true} roundedCircle={true} src={`https://cravatar.eu/helmavatar/${api.settings.username}/38.png`} />
                            </div>
                            <Button className="mx-2" onClick={api.logout}>Logout</Button>
                        </>}
                </Nav>
            </Container>
        </header>
    )
}


export default Header