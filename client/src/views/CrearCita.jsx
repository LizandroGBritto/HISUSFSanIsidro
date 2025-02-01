import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const CrearCita = () => {
  const { pacienteId } = useParams(); // El ID del paciente viene en la URL
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [pacienteData, setPacienteData] = useState(null);
  const [medicos, setMedicos] = useState([]);

  // Obtener los datos del paciente (opcional, para mostrar en el formulario)
  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/pacientes/${pacienteId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPacienteData(response.data);
      } catch (error) {
        console.error("Error al obtener el paciente:", error);
      }
    };

    if (pacienteId) {
      fetchPaciente();
    }
  }, [pacienteId]);

  // Obtener la lista de médicos
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/medicos", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Se asume que el backend hace un populate en el campo "usuario" para obtener nombre y apellido.
        setMedicos(response.data);
      } catch (error) {
        console.error("Error al obtener médicos:", error);
      }
    };

    fetchMedicos();
  }, []);

  const validationSchema = Yup.object().shape({
    fecha: Yup.date().required("Fecha es requerida"),
    hora: Yup.string().required("Hora es requerida"),
    paciente: Yup.string().required("Paciente es requerido"),
    medico: Yup.string().required("Médico es requerido"),
    estado: Yup.string()
      .oneOf(["pendiente", "confirmada", "cancelada"])
      .default("pendiente"),
    presionArterial: Yup.number().optional(),
    temperatura: Yup.number().optional(),
    estudios: Yup.string().optional(),
    observaciones: Yup.string().optional(),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/citas/new",
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
         Swal.fire({
                  title: "Cita creada exitosamente",
                  icon: "success",
                  draggable: true
                });
        resetForm();
        navigate("/dashboard");
      }
    } catch (error) {
     Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.response.data.error,
            });
    }
  };

  if (user?.rol !== "enfermero" && user?.rol !== "medico") {
    return (
      <div className="p-4">
        <p className="text-red-500">Acceso restringido</p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        fecha: "",
        hora: "",
        // Prellenamos el campo paciente con el ID recibido en la URL
        paciente: pacienteId || "",
        // El campo médico se seleccionará mediante el <select>
        medico: "",
        estado: "pendiente",
        presionArterial: "",
        temperatura: "",
        estudios: "",
        observaciones: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Crear Nueva Cita</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-1">Fecha</label>
              <Field
                type="date"
                name="fecha"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="fecha"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Hora</label>
              <Field
                type="time"
                name="hora"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="hora"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Mostrar datos del paciente en campo de solo lectura */}
            <div>
              <label className="block mb-1">Paciente</label>
              <Field
                type="text"
                name="pacienteDisplay"
                className="w-full p-2 border rounded"
                value={
                  pacienteData
                    ? `${pacienteData.nombre} ${pacienteData.apellido}`
                    : "Cargando..."
                }
                disabled
              />
              {/* Campo oculto para enviar el ID real del paciente */}
              <Field type="hidden" name="paciente" value={pacienteId} />
              <ErrorMessage
                name="paciente"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Campo select para médicos */}
            <div>
              <label className="block mb-1">Médico</label>
              <Field
                as="select"
                name="medico"
                className="w-full p-2 border rounded"
              >
                <option value="">Selecciona un médico</option>
                {medicos.map((medico) => (
                  <option key={medico._id} value={medico._id}>
                    {medico.usuario.nombre} {medico.usuario.apellido} -{" "}
                    {medico.especialidad}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="medico"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block mb-1">Estado</label>
              <Field
                as="select"
                name="estado"
                className="w-full p-2 border rounded"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </Field>
              <ErrorMessage
                name="estado"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Presión Arterial</label>
              <Field
                type="number"
                name="presionArterial"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="presionArterial"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Temperatura</label>
              <Field
                type="number"
                name="temperatura"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="temperatura"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Estudios</label>
              <Field
                type="text"
                name="estudios"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="estudios"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Observaciones</label>
              <Field
                type="text"
                name="observaciones"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="observaciones"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Crear Cita
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CrearCita;
