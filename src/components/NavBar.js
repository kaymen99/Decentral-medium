import React from 'react';
import Account from "./Account";
import logo from "../assets/img/logo.png"

import { Navbar, Container, Nav } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css';

function NavBar() {
    return (
        <>
            <Navbar bg="white" variant="light" expand="lg">
                <Container>
                    <Navbar.Brand href="/" style={{ fontFamily: "Cursive", color: "#E18715", fontWeight: "700" }}>
                        <img src={logo} alt="" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav activeKey={window.location.pathname}
                            className="me-auto"
                            style={{ maxHeight: '100px' }}
                            navbarScroll>
                        </Nav>
                        <Account />
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default NavBar;


