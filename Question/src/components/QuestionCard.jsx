function QuestionCard({ question, onAnswer }) {
  return (
    <div className="w-full max-w-xl mx-auto">

      {/* Cabecera */}
      <p className="text-sm text-purple-400 font-semibold uppercase tracking-widest mb-3">
        Pregunta del día
      </p>

      {/* Texto de la pregunta */}
      <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
        {question.question}
      </h2>

      {/* Opciones */}
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option.id)}
            className="w-full text-left px-5 py-4 rounded-xl border border-gray-700
                       bg-gray-800 text-white font-medium
                       hover:border-purple-500 hover:bg-gray-700
                       transition-all duration-200"
          >
            <span className="text-purple-400 font-bold mr-3">
              {option.id.toUpperCase()}.
            </span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuestionCard