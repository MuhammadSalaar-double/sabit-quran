import { useEffect, useState } from "react";

const STORAGE_KEY = "sabit-tracker";
const RANDOM_AYAH_URL =
  "https://api.quran.com/api/v4/verses/random?translations=131";

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDaysBetween(startDateKey, endDateKey) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const start = parseDateKey(startDateKey);
  const end = parseDateKey(endDateKey);
  return Math.round((end - start) / millisecondsPerDay);
}

function cleanTranslation(text = "") {
  const withoutFootnotes = text.replace(/<sup[^>]*>.*?<\/sup>/gi, "");
  const container = document.createElement("div");
  container.innerHTML = withoutFootnotes;
  return container.textContent?.trim() || "";
}

function getStoredProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return { streak: 0, lastReadDate: "" };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      streak: Number(parsed.streak) || 0,
      lastReadDate: parsed.lastReadDate || "",
    };
  } catch {
    return { streak: 0, lastReadDate: "" };
  }
}

function App() {
  const [ayah, setAyah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastReadDate, setLastReadDate] = useState("");

  useEffect(() => {
    const savedProgress = getStoredProgress();
    setStreak(savedProgress.streak);
    setLastReadDate(savedProgress.lastReadDate);
  }, []);

  useEffect(() => {
    async function fetchRandomAyah() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(RANDOM_AYAH_URL);

        if (!response.ok) {
          throw new Error("Failed to load ayah");
        }

        const data = await response.json();
        const verse = data?.verse;

        if (!verse) {
          throw new Error("No ayah data received");
        }

        setAyah({
          arabicText: verse.text_uthmani || verse.text_imlaei || "No Arabic text",
          translation:
            verse.translations?.[0]?.text
              ? cleanTranslation(verse.translations[0].text)
              : "Translation not available",
          surahName:
            verse.surah?.name_simple || `Surah ${verse.chapter_id}`,
          ayahNumber:
            verse.verse_number ||
            verse.verse_key?.split(":")[1] ||
            "?",
        });
      } catch (err) {
        setAyah(null);
        setError(err.message || "Failed to load ayah");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRandomAyah();
  }, []);

  const todayKey = getTodayKey();
  const hasReadToday = lastReadDate === todayKey;
  const hasMissedDay =
    Boolean(lastReadDate) && getDaysBetween(lastReadDate, todayKey) > 1;

  function saveProgress(nextStreak, nextDate) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        streak: nextStreak,
        lastReadDate: nextDate,
      })
    );
  }

  function markAsReadToday() {
    if (hasReadToday) return;

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setLastReadDate(todayKey);
    saveProgress(nextStreak, todayKey);
  }

  const statusText = hasReadToday
    ? "Today's ayah is already counted. Your streak is safe."
    : hasMissedDay
    ? "You missed a day, but your progress is still with you."
    : "One ayah today is enough to keep the habit alive.";

  return (
    <main className="min-h-screen px-4 py-10 text-center">
      <h1 className="text-3xl font-bold">SABIT</h1>
      <p className="text-gray-500">Stay connected daily</p>
      <p className="text-sm mt-2">{statusText}</p>

      <div className="mt-6 p-6 border rounded-xl">
        {isLoading ? (
          <p>Loading your ayah...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <p className="text-2xl">{ayah?.arabicText}</p>
            <p className="mt-3">{ayah?.translation}</p>
            <p className="mt-2 text-sm text-gray-500">
              {ayah?.surahName} • Ayah {ayah?.ayahNumber}
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <p>🔥 Streak: {streak} days</p>
      </div>

      <button
        onClick={markAsReadToday}
        disabled={hasReadToday}
        className="mt-4 px-6 py-3 bg-black text-white rounded-xl disabled:bg-gray-400"
      >
        {hasReadToday ? "Already Marked Today" : "I Read Today ✅"}
      </button>
    </main>
  );
}

export default App;
