# Prueba: Sistema de Votación — Piloto

Este documento describe los pasos para verificar el correcto funcionamiento del sistema de votación y la página de resultados.

---

## Participantes

- **Tester A** — usuario registrado (con cuenta)
- **Tester B** — usuario anónimo (sin cuenta)
- **Admin** — quien activa/desactiva la votación entre fases

---

## Fase 1 — Votación abierta

> El admin activa la votación antes de comenzar esta fase.

### 1.1 — El menú no muestra "AWARD"

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Abrir la app (cualquier usuario) | El menú solo muestra `HOME · GAMES`, sin enlace `AWARD` |

### 1.2 — Usuario registrado puede votar

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Tester A → abrir la página de cualquier juego | Se ven 5 estrellas interactivas |
| 2 | Pasar el cursor sobre la estrella 3 | Las estrellas 1 a 3 se iluminan en amarillo |
| 3 | Hacer clic en la estrella 4 | Las estrellas 1 a 4 quedan marcadas |
| 4 | Recargar la página | El voto sigue guardado (estrella 4 marcada) |
| 5 | Hacer clic en la estrella 4 de nuevo | Las estrellas se limpian (el voto se elimina) |
| 6 | Votar distintos juegos con diferentes puntuaciones | Cada voto se guarda correctamente |

### 1.3 — Usuario anónimo no puede votar

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Tester B → abrir cualquier juego | Las estrellas se muestran pero no reaccionan al cursor ni al clic |
| 2 | Revisar el texto bajo las estrellas | Muestra "Iniciar sesión para votar" |

### 1.4 — La página de resultados está bloqueada

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Cualquier usuario → navegar a `/audience-award` | Se muestra el mensaje "Votación abierta — los resultados se revelarán al cerrar la votación" |
| 2 | Hacer clic en "Ir a votar" | Redirige a `/games` |

---

## Fase 2 — Votación cerrada

> El admin desactiva la votación antes de comenzar esta fase.

### 2.1 — El menú muestra "AWARD"

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Abrir o recargar la app | El menú muestra `HOME · GAMES · AWARD` |

### 2.2 — Usuario registrado no puede votar

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Tester A → abrir un juego en el que votó antes | Las estrellas muestran su voto anterior en amarillo pero no son clicables |
| 2 | Intentar hacer clic en las estrellas | Sin reacción |
| 3 | Revisar el texto bajo las estrellas | Muestra "Votación cerrada" |

### 2.3 — Usuario anónimo no puede votar

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Tester B → abrir cualquier juego | Las estrellas reflejan el promedio global (solo lectura) |
| 2 | Revisar el texto bajo las estrellas | Muestra la puntuación promedio e "Iniciar sesión para votar" |

### 2.4 — Página de resultados muestra el ranking

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Hacer clic en `AWARD` en el menú | Se carga la lista de juegos ordenada por puntuación |
| 2 | Revisar los primeros lugares | Los 3 primeros con votos muestran 🥇 🥈 🥉 |
| 3 | Revisar juegos con votos | Cada uno muestra su puntuación (ej. `3.84`), cantidad de votos y estrellas |
| 4 | Revisar juegos sin votos | Aparecen al final, visualmente atenuados, con "Sin votos aún" |
| 5 | Hacer clic en cualquier juego del ranking | Navega a la página de ese juego |

### 2.5 — Las tarjetas de juego muestran la puntuación

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Navegar a `/games` | Las tarjetas de juegos con votos muestran una etiqueta ★ con su puntuación |

---

## Criterios de aprobación

Todos los pasos producen el resultado esperado. No se muestran errores en pantalla durante ninguna de las acciones listadas.
