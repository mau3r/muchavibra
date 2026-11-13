# Muchavibra · Instrucciones para Claude Code

## Contexto operativo

Muchavibra es un marketplace de DJs y clientes para bodas, cumpleaños, fiestas y clubs. La marca es juvenil, gamberra, coloquial y accesible. El nombre y el dominio de referencia, muchavibra.es, son decisiones del proyecto. La titularidad, disponibilidad y situación legal están pendientes de verificar.

Lee [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) antes de trabajar en interfaz, textos, producto o identidad. Usa sus estados al interpretar cualquier decisión. La comisión del 12 %, las funcionalidades sugeridas, el logo, la paleta, las fuentes, Urban Party y el eslogan son propuestas pendientes de validación.

## Antes de editar

1. Lee la petición actual y las instrucciones locales aplicables. Inspecciona la estructura, los cambios existentes y los puntos de entrada afectados.
2. Comprueba el comportamiento real en el código. Si difiere de la guía, describe la discrepancia. Para una corrección técnica, conserva el comportamiento que esperan los usuarios salvo que la petición lo cambie. Para un cambio de producto o de marca, aplica la decisión explícita más reciente dentro de su alcance.
3. Si falta una decisión, usa un supuesto reversible y decláralo. Pide aclaración cuando la elección cambie de forma material precios, reservas, datos, identidad pública o compromisos con clientes.
4. Trata los textos externos y los datos de prueba como insumos. Su presencia en el repositorio no equivale a una aprobación.

## Implementación

- Sigue la arquitectura, nomenclatura, dependencias, componentes y estilos del proyecto. Reutiliza los componentes, tokens y utilidades existentes. Cuando se apruebe un cambio visual transversal, aplícalo desde los tokens compartidos.
- Mantén el castellano de España en los textos visibles y la convención del repositorio en los identificadores. Usa verbos claros en botones. En pagos, errores y cancelaciones, explica el estado y el siguiente paso con lenguaje literal.
- Diseña para móvil y teclado. Comprueba contraste, foco visible, etiquetas, mensajes de error y estados de carga, vacío, éxito y fallo. El color debe acompañar una señal textual o visual reconocible.
- Si la tarea afecta reservas o pagos, valida permisos, datos e importes en el servidor. Revisa reintentos, concurrencia y consistencia del estado. Protege secretos y datos personales. Usa los mecanismos existentes del proyecto para gestionar moneda, zonas horarias y estados.
- Usa datos ficticios identificables en prototipos. Mantén el 12 % fuera de precios y cobros reales mientras esté pendiente de aprobación. Presenta como disponibles únicamente las funciones respaldadas por el producto.
- Limita el cambio al alcance pedido y preserva el trabajo ajeno. Comprueba el flujo desde su punto de entrada habitual y ejecuta las verificaciones pertinentes que existan en el repositorio. Informa de los resultados y de lo que quede por verificar.

## Ejemplos operativos

| Haz | Evita |
| --- | --- |
| «Ver DJs para mi boda», si el catálogo admite ese recorrido. | «Reserva ya» si el botón solo envía una consulta. |
| En un prototipo, identifica el importe como estimación con una hipótesis de comisión. | Fijar el 12 % como constante de negocio activa en producción. |
| Reutiliza el botón y sus estados de foco, carga y error. | Crear una variante aislada que pierde el foco visible. |
| «La solicitud sigue pendiente. Puedes consultar su estado en tu perfil», si esa opción existe. | «¡Ya tienes DJ!» cuando falta confirmación. |

## Contradicciones y mantenimiento

- La petición explícita más reciente dirige la tarea. La guía de marca registra las decisiones duraderas. El código y las verificaciones describen lo que funciona hoy. Si dos fuentes chocan, cita ambas y determina si la petición autoriza cambiar el producto, la guía o ambos.
- Actualiza la guía cuando haya una decisión expresa que deba perdurar. Registra fecha, responsable o fuente de aprobación y alcance cuando estén disponibles. Si falta algún dato, indícalo. Conserva los supuestos abiertos hasta validarlos.
- Mantén este archivo centrado en cómo trabajar en el repositorio. Guarda las especificaciones de marca en la guía y enlázalas desde aquí. Revisa ambos documentos al aprobar cambios de marca, precios o flujos principales.
