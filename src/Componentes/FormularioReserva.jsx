import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import styled from "styled-components";

// -------------------- Styled Components --------------------
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
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

const BtnSalon = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid #ccc;
  background: ${({ $selected }) => ($selected ? "#007bff" : "white")};
  color: ${({ $selected }) => ($selected ? "white" : "#333")};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#0056b3" : "#f0f0f0")};
  }

  svg {
    width: 28px;
    height: 28px;
    fill: ${({ $selected }) => ($selected ? "white" : "#007bff")};
  }

  span {
    font-size: 14px;
  }
`;

const ErrorText = styled.p`
  color: red;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
`;

// -------------------- Helpers --------------------
const generarHorasInicio = () => {
  const horas = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 30) continue;
      horas.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return horas;
};

const generarHorasFin = () => {
  const horas = [];
  for (let h = 9; h <= 18; h++) {
    const minutosInicio = h === 9 ? 30 : 0;
    for (let m = minutosInicio; m < 60; m += 30) {
      if (h === 18 && m > 0) continue;
      horas.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return horas;
};

const agregarMinutos = (horaStr, minutosAgregar) => {
  const [h, m] = horaStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + minutosAgregar);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// -------------------- Component --------------------
const FormularioReserva = ({ onReservaCreada }) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const { setValue, register, handleSubmit, reset } = useForm();
  const [error, setError] = useState("");
  const [minHora, setMinHora] = useState("");
  const [reservas, setReservas] = useState([]);
  const [cliente, setCliente] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [fecha, setFecha] = useState("");
  const [salonId, setSalonId] = useState(null);

  // Reset hora fin al cambiar hora inicio
  useEffect(() => {
    if (horaInicio) setValue("horaFin", "");
  }, [horaInicio, setValue]);

  // Traer reservas por salón y fecha
  useEffect(() => {
    const fetchReservas = async () => {
      if (!salonId || !fecha) return;
      try {
        const { data } = await axios.get(
          `https://localhost:7211/api/reserva?fecha=${fecha}`
        );
        setReservas(data.filter((r) => r.salonId === salonId));
      } catch (err) {
        console.error("Error al traer reservas:", err);
      }
    };
    fetchReservas();
  }, [salonId, fecha]);

  // Actualizar minHora si la fecha es hoy
  useEffect(() => {
    if (fecha === today) {
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      setMinHora(`${currentHour}:${currentMinute}`);
    }
  }, [fecha, today]);

  // Filtrar horas disponibles
  const horasDisponiblesInicioFiltradas = generarHorasInicio().filter(hora => {
  // Si la fecha es hoy, no mostrar horas anteriores a la hora actual
  if (fecha === today && hora < minHora) return false;

  // Filtrado por reservas existentes
  return !reservas.some(reserva => {
    const inicioBloqueado = agregarMinutos(reserva.horaInicio, -30);
    const finBloqueado = agregarMinutos(reserva.horaFin, 30);
    return hora >= inicioBloqueado && hora < finBloqueado;
  });
});

  const horasDisponiblesFinFiltradas = generarHorasFin().filter(
    (hora) =>
      horaInicio &&
      !reservas.some((reserva) => {
        const inicioBloqueado = agregarMinutos(reserva.horaInicio, -30);
        const finBloqueado = agregarMinutos(reserva.horaFin, 30);
        return horaInicio < finBloqueado && hora > inicioBloqueado;
      }) &&
      hora > horaInicio
  );

  // Enviar formulario
  const onSubmit = async () => {
    if (!cliente || !fecha || !horaInicio || !horaFin || !salonId) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      const dataToSend = { cliente, fecha, horaInicio, horaFin, salonId };
      const { data } = await axios.post(
        "https://localhost:7211/api/reserva",
        dataToSend
      );
      setReservas((prev) => [...prev, data]);

      if (onReservaCreada) onReservaCreada(data);

      reset();
      setHoraInicio("");
      setHoraFin("");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al registrar la reserva. Inténtalo de nuevo."
      );
    }
  };

  return (
    <Container>
      <Title>Realizar una Reserva</Title>

      <Row>
        {["salon1", "salon2", "salon3"].map((salon) => (
          <BtnSalon
            key={salon}
            type="button"
            onClick={() => setSalonId(salon)}
            $selected={salonId === salon}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>{`Salon ${salon.slice(-1)}`}</span>
          </BtnSalon>
        ))}
      </Row>

      {error && <ErrorText>{error}</ErrorText>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <h5>Nombre y apellido:</h5>
        <Input
          placeholder="Ej: Juan Lopez"
          {...register("cliente", { required: "El nombre es obligatorio" })}
          onChange={(e) => setCliente(e.target.value)}
          onInput={(e) =>
            (e.target.value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              ""
            ))
          }
        />

        <h5>Día:</h5>
        <Input
          type="date"
          {...register("fecha", { required: true })}
          min={today}
          onChange={(e) => setFecha(e.target.value)}
        />

        <Row>
          <h5>Hora de inicio:</h5>
          <Select
            {...register("horaInicio", { required: true })}
            onChange={(e) => setHoraInicio(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled></option>
            {horasDisponiblesInicioFiltradas.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </Select>

          <h5>Hora de finalización:</h5>
          <Select
            {...register("horaFin", { required: true })}
            onChange={(e) => setHoraFin(e.target.value)}
            defaultValue=""
            disabled={!horaInicio}
          >
            <option value="" disabled></option>
            {horasDisponiblesFinFiltradas.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </Select>
        </Row>

        <Button
          type="submit"
          disabled={!cliente || !fecha || !horaInicio || !horaFin || !salonId}
        >
          Reservar
        </Button>
      </Form>
    </Container>
  );
};

export default FormularioReserva;
