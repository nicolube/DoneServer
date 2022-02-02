import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router';
import * as api from '../api/api';


function Login() {
    const [uOk, setUOk] = useState(false);
    const [pOk, setPOk] = useState(false);
    const [lOk, setlOk] = useState(true);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        const username = e.target.username.value;
        const password = e.target.password.value;
        e.preventDefault()
        const success = await api.login(username, password);
        setlOk(success)
        if (!success) return
        navigate("/")

    }

    const handleUsernameChange = (e) => {
        setUOk(api.verify.username(e.target.value));
    };
    const handlePasswordChange = (e) => {
        setPOk(api.verify.password(e.target.value));
    };

    const FormAlert = ({ active, children }) => {
        return active ? <Form.Text className="text-danger">{children}<br /></Form.Text> : null
    };


    return <Container>
        <h1>Login</h1>
        <Form onSubmit={handleLogin} className={!isMobile ? "w-50" : null } >
            <Form.Group className="mb-3" >
                <Form.Label>Username</Form.Label>
                <Form.Control onChange={handleUsernameChange} type="text" name="username" id="username" placeholder="Username"></Form.Control>
                <FormAlert active={!uOk}>Username invalid, lengnth: 4-24, allowed symbols: (a-z A-Z 0-9 -_).</FormAlert>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control onChange={handlePasswordChange} type="password" name="password" id="password" placeholder="Password"></Form.Control>
                <FormAlert active={!pOk}>Password invalid, lengnth: 8-32, allowed symbols: (a-z A-Z 0-9 -_?/!"'+*$§).</FormAlert>
                <FormAlert active={!lOk}>Username or password wrong!</FormAlert>
            </Form.Group>
            <Button variant="primary" disabled={!uOk || !pOk} type="submit">
                Submit
            </Button>
        </Form>
    </Container >;
}

export default Login;
