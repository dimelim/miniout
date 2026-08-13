export type Novedad = {
  version: string;
  nombre: string;
  fecha: string;
  cambios: string[];
};

export const NOVEDADES: Novedad[] = [
  {
    version: '1.0.2',
    nombre: 'La mascota es tuya',
    fecha: '13 de agosto de 2026',
    cambios: [
      'Pestaña nueva: Mascota. Ponle nombre, elige su color y qué lleva puesto: casco, gafas o antena. El cambio se ve en toda la app.',
      'La bienvenida termina presentándote a la mascota, que se pasea y se va probando accesorios.',
      'Los cortes y evaluaciones se renombran tocando su nombre: llámalos como los llame tu profesor.',
      'La mascota te guía: en las materias vacías te explica cada sección con sus palabras.',
      'La nota es a pantalla completa, escribes sobre el papel rayado sin tarjeta de por medio.',
      'La materia se reorganizó: arriba cómo vas y tu próxima clase, y los campos de añadir solo aparecen cuando los pides.',
      'El diario de clase se llama así, y te dice para qué sirve.',
    ],
  },
  {
    version: '1.0.2',
    nombre: 'Pulido de la cuarta alpha',
    fecha: '13 de agosto de 2026',
    cambios: [
      'La mascota abre Inicio a lo grande, con tres tarjetas que se deslizan: el saludo, tus clases de hoy y la frase.',
      'MiniLock tapa la app desde el primer instante, también en el selector de apps.',
      'La negrita se activa sin seleccionar: tocas el botón y lo que escribes sale así hasta que lo quites.',
      'El indicador de formato activo es una línea fina, no un cuadro.',
      'Las hojas se ajustan a su contenido, sin espacio muerto abajo.',
      'El teclado ya no tapa lo que escribes en la nota.',
      'Cada imagen elige si va encima o debajo del texto.',
      'Las etiquetas ya no cortan las letras con rabo, como la g.',
      'Notas explica para qué sirve la primera vez, y el editor se enfoca tocando en cualquier parte del papel.',
    ],
  },
  {
    version: '1.0.2',
    nombre: 'Cuarta alpha',
    fecha: '13 de agosto de 2026',
    cambios: [
      'Las materias llevan su propia evaluación: eliges cómo te califican, apuntas cuánto vale cada nota y Miniout te dice qué necesitas en lo que falta para pasar.',
      'La calificación se fue de las notas, que vuelven a ser para escribir.',
      'Inicio abre con tu semana: las clases de cada día y lo que hay que entregar.',
      'Una clase se puede poner en varios días de golpe.',
      'Al dictar ves en gris lo que se está transcribiendo.',
      'Las imágenes aparecen arriba de la nota, sin salir del editor.',
      'Los avisos y las preguntas de confirmación usan el estilo de la librería, no uno propio.',
      'Las frases tienen autores, se puede elegir cada cuánto cambian y se ven todas.',
      'Miniout avisa cuando hay una versión nueva para descargar.',
      'El teclado ya no tapa el último campo.',
      'La negrita, la cursiva, el subrayado y los títulos se ven al momento, sin asteriscos ni signos raros.',
      'Las viñetas se ponen solas al pulsar Enter y se quitan si dejas la línea vacía.',
      'Botón para copiar la nota entera, desde el editor y desde el menú de tres puntos.',
      'Los filtros y el orden viven en una sola pantalla, con un botón que avisa de cuántos tienes puestos.',
      'El check del editor se cambió por una etiqueta de Hecha o Pendiente, que se entiende mejor.',
      'Los periodos guardan materias con horario, comentarios por día y trabajos asignados.',
      'Esta pantalla, para saber qué cambió en cada versión.',
    ],
  },
  {
    version: '1.0.1',
    nombre: 'Tercera alpha',
    fecha: '13 de agosto de 2026',
    cambios: [
      'Título propio en las notas.',
      'Imágenes de la galería o de la cámara, con mover, acercar, girar y borrar.',
      'Dictado: el micrófono escribe lo que dices.',
      'Calificaciones con tu escala y color según lo cerca que estés de pasar.',
      'Proyectos con icono y color, y notas que se mueven deslizando.',
      'Cuatro pestañas abajo y barra de formato de borde a borde.',
    ],
  },
  {
    version: '1.0.0',
    nombre: 'Segunda alpha',
    fecha: '12 de agosto de 2026',
    cambios: [
      'Primera versión instalable sin servidor de desarrollo.',
      'Alta en cinco pasos y semestres con materias.',
      'MiniLock: código de cuatro dígitos para abrir la app.',
      'Actualizaciones por aire.',
    ],
  },
];
