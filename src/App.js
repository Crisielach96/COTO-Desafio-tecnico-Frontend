import React, { useState } from "react";
import FormularioReserva from "./Componentes/FormularioReserva";
import ListaReservas from "./Componentes/ListaReservas";
import GlobalStyles from "./Componentes/GlobalStyles";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

function App() {
  const [nuevaReserva, setNuevaReserva] = useState(null);

  return (
    <>
      <GlobalStyles />
      <Container>
        <Title>Sistema de Reservas</Title>
        <FormularioReserva onReservaCreada={setNuevaReserva} />
        <ListaReservas nuevaReserva={nuevaReserva} />
      </Container>
    </>
  );
}

export default App;
