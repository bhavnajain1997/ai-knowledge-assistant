import { useState } from "react";
import { Loader2, HelpCircle, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { fetchQuiz } from "../services/api.js";

export default function QuizPanel({ activeDoc }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!activeDoc) return;
    setLoading(true);
    setError("");
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await fetchQuiz(activeDoc.id, 8);
      setQuiz(res.quiz);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't generate a quiz.");
    } finally {
      setLoading(false);
    }
  }

  if (!activeDoc) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <HelpCircle size={28} className="mb-3 text-parchment-300/30" />
        <p className="max-w-xs text-sm text-parchment-300/60">
          Select a document from the library to generate a quiz.
        </p>
      </div>
    );
  }

  const score = quiz
    ? quiz.questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
        0
      )
    : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-brass-400" />
          <h2 className="font-display text-xl text-parchment-100">
            Quiz · {activeDoc.name}
          </h2>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1.5 text-xs text-parchment-200 hover:border-brass-500 hover:text-brass-400 disabled:opacity-40"
        >
          <RefreshCcw size={12} /> {quiz ? "New quiz" : "Generate quiz"}
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-parchment-300/60">
            <Loader2 className="animate-spin" size={16} /> Writing questions from your document…
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !quiz && !error && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="max-w-xs text-sm text-parchment-300/60">
              Generate a multiple-choice quiz from this document to test your understanding.
            </p>
            <button
              onClick={generate}
              className="mt-4 rounded-md bg-brass-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-brass-400"
            >
              Generate quiz
            </button>
          </div>
        )}

        {quiz && (
          <div className="space-y-4">
            {submitted && (
              <div className="card-surface flex items-center justify-between px-4 py-3">
                <span className="font-display text-lg">Score</span>
                <span className="font-mono text-lg text-moss-600">
                  {score} / {quiz.questions.length}
                </span>
              </div>
            )}

            {quiz.questions.map((q, qi) => {
              const selected = answers[qi];
              return (
                <div key={qi} className="card-surface p-4">
                  <p className="mb-3 text-sm font-medium text-ink-900">
                    <span className="font-mono text-brass-600">Q{qi + 1}.</span> {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isCorrect = q.correctIndex === oi;
                      let style =
                        "border-ink-300 hover:border-moss-500 hover:bg-moss-400/5";
                      if (submitted) {
                        if (isCorrect) style = "border-moss-500 bg-moss-400/15";
                        else if (isSelected && !isCorrect)
                          style = "border-red-400 bg-red-400/10";
                      } else if (isSelected) {
                        style = "border-brass-500 bg-brass-500/10";
                      }
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm text-ink-800 transition-colors ${style}`}
                        >
                          <span>{opt}</span>
                          {submitted && isCorrect && (
                            <CheckCircle2 size={15} className="text-moss-600 shrink-0" />
                          )}
                          {submitted && isSelected && !isCorrect && (
                            <XCircle size={15} className="text-red-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <p className="mt-2.5 rounded-md bg-ink-950/5 px-3 py-2 text-xs text-ink-700">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}

            {!submitted && (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="w-full rounded-md bg-brass-500 py-2.5 text-sm font-medium text-ink-950 hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit answers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
