import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { fetchConfig } from "../../utils/fetchConfig";

export default function NavBar() {
  const [counter, setCounter] = useState(null);

  async function getCounter() {
    const backendURL = await fetchConfig();
    try {
      const response = await fetch(`${backendURL}/counter`).catch((error) => {
        console.log("Error fetching the page visit counter");
      });
      const data = await response.json();
      setCounter(data.counterNumber);
    } catch (error) {
      console.error("Error fetching counter:", error);
    }
  }

  useEffect(() => {
    getCounter();
  }, []);

  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">Moodify</Navbar.Brand>
        <Nav className="me-auto">
        </Nav>
        <Navbar.Brand>All-time Visits: {counter}</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
