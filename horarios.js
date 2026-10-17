const HORARIOS = {
  Ezequiel: {
    "Lunes": [
      ["entra", "16:00", "Facultad UTN", false],
      ["sale", "22:00", "Facultad UTN"],
    ],
    "Martes": [
      ["entra", "07:30", "Facultad UTN"],
      ["sale", "13:30", "Facultad UTN", false],
      ["entra", "16:00", "Facultad UTN", false],
      ["sale", "22:00", "Facultad UTN"],
    ],
    "Miércoles": [
      ["entra", "10:00", "Inglés"],
      ["sale", "11:00", "Inglés"],
      ["entra", "14:00", "Facultad UTN", false],
      ["sale", "16:00", "Facultad UTN", false],
      ["entra", "18:30", "Facultad UTN", false],
      ["sale", "22:00", "Facultad UTN"],
    ],
    "Jueves": [
      ["entra", "19:00", "Facultad UTN"],
      ["sale", "22:00", "Facultad UTN"],
    ],
    "Viernes": [
      ["entra", "10:00", "Facultad UTN", false],
      ["sale", "13:00", "Facultad UTN", false],
      ["entra", "17:00", "Facultad UTN", false],
      ["sale", "18:30", "Facultad UTN", false],
    ],
  },
  Matteo: {
    "Lunes": [
      ["entra", "07:30", "Colegio del Carmen"],
      ["sale", "13:30", "Colegio del Carmen", false],
      ["entra", "19:00", "Pre universitario"],
      ["sale", "22:00", "Pre universitario"],
    ],
    "Martes": [
      ["entra", "07:30", "Colegio del Carmen"],
      ["sale", "13:30", "Colegio del Carmen", false],
      ["entra", "17:30", "Educación física"],
      ["cambio", "18:30 → 19:00", "Sale de Educación física, entra al Pre universitario"],
      ["sale", "22:00", "Pre universitario"],
    ],
    "Miércoles": [
      ["entra", "07:30", "Colegio del Carmen"],
      ["sale", "13:30", "Colegio del Carmen", false],
      ["entra", "18:30", "Clases de Chino", false],
      ["sale", "20:00", "Clases de Chino", false],
    ],
    "Jueves": [
      ["entra", "07:30", "Colegio del Carmen"],
      ["sale", "13:30", "Colegio del Carmen", false],
      ["entra", "17:00", "Educación física"],
      ["sale", "18:00", "Educación física"],
      ["entra", "19:00", "Pre universitario"],
      ["sale", "22:00", "Pre universitario"],
    ],
    "Viernes": [
      ["entra", "07:30", "Colegio del Carmen"],
      ["sale", "13:30", "Colegio del Carmen", false],
    ],
  },
};
