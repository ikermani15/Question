# Question

Trivia diaria generada por IA: cada día se genera automáticamente una pregunta
de cultura general, y los usuarios compiten en solitario o en grupo para
acertarla antes de que se acabe el tiempo.

🔗 Demo en vivo: https://question-zeta-lilac.vercel.app/

## Cómo funciona
Cada noche a las 23:00, un cron job en el backend genera una nueva pregunta
llamando a la API de Gemini/Claude, la guarda en PostgreSQL vía Supabase, y a
medianoche queda disponible para todos los usuarios.

## Funcionalidades
- Pregunta diaria de cultura general generada por IA
- Modo grupo: crea o únete a un grupo, responde con límite de tiempo y compite en un leaderboard
- Racha (streak) de días acertados
- Interfaz bilingüe (ES/EN)
- Countdown hasta la siguiente pregunta

## Stack técnico
**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express, PostgreSQL, Supabase, node-cron
**IA:** Google Gemini API / Anthropic API para generación de preguntas
