import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 12px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 8px;
  border-bottom: 1px solid #ddd;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #9aa9c1;
    cursor: not-allowed;
    opacity: 0.7;
    pointer-events: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorText = styled.p`
  color: red;
`;

const ListaReservas = ({ reservasGuardadas }) => {
  const [reservas, setReservas] = useState([]);
  const {
    register,
    reset,
    handleSubmit,
  } = useForm();
  const [error, setError] = useState("");
  const [fecha, setfecha] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await axios.get("http://localhost:5241/api/reserva", {
        params: { fecha: data.fecha },
      });
      setReservas(response.data);
      reset();
      setError("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error");
      }
    }
  };

  return (
    <Container>
      <Title>Reservas Realizadas</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input type="date" {...register("fecha", { required: true })} onChange={(e) => setfecha(e.target.value)}/>
        <Button type="submit" disabled={!fecha}>
          Consultar
        </Button>
      </Form>
      <List>
        {reservas.map((reserva, index) => (
          <ListItem key={index}>
            {reserva.cliente} - {reserva.salonId} - {reserva.fecha} -{" "}
            {reserva.horaInicio} - {reserva.horaFin}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ListaReservas;
