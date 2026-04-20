```jsx
import { useEffect, useState } from "react";

const STORAGE_KEY = "sabit-tracker";

// ✅ FIXED API URL
const RANDOM_AYAH_URL =
  "https://api.quran.com/api/v4/verses/random?translations=131&fields=text_uthmani,chapter_id,verse_key";

// ===== Helpers =====
function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  // ✅ NO TEMPLATE STRING (fixes Vercel error)
  return year + "-" + month + "-" + day;
}

function parseDateKey(dateKey) {
  const parts = dateKey.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function getDaysBetween(startDateKey, endDateKey) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = parseDateKey(startDateKey);
  const end = parseDateKey(endDateKey);
  return Math.round((end - start) / msPerDay);
}

function cleanTranslation(text = "") {
  const withoutFootnotes = text.replace(/<sup[^>]*>.*?<\/sup>/gi, "");
  const container = document.createElement("div");
  container.innerHTML = withoutFootnotes;
  return container.textContent ? container.textContent.trim() : "";
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

// ===== App =====
function App() {
  const [ayah, setAyah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastReadDate, setLastReadDate] = useState("");

  // Load streak
  useEffect(() => {
    const saved = getStoredProgress();
    setStreak(saved.streak);
    setLastReadDate(saved.lastReadDate);
  }, []);

  // Fetch ayah
  useEffect(() => {
    async function fetchAyah() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(RANDOM_AYAH_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch ayah");
        }

        const data = await response.json();
        const verse = data && data.verse ? data.verse : null;

        if (!verse) {
          throw new Error("No ayah data received");
        }

        setAyah({
          arabicText: verse.text_uthmani || "No Arabic text",

          translation: cleanTranslation(
            verse.translations && verse.translations[0]
              ? verse.translations[0].text
              : "Translation not available"
          ),

          surahName:
            verse.chapter && verse.chapter.name_simple
              ? verse.chapter.name_simple
              : "Unknown Surah",

          ayahNumber:
            verse.verse_number ||
            (verse.verse_key ? verse.verse_key.split(":")[1] : "?"),
        });
      } catch (err) {
        setAyah(null);
        setError(err.message || "Error loading ayah");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAyah();
  }, []);

  const todayKey = getTodayKey();
  const hasReadToday = lastReadDate === todayKey;
  const hasMissedDay =
    lastReadDate && getDaysBetween(lastReadDate, todayKey) > 1;

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

    const next = streak + 1;
    setStreak(next);
    setLastReadDate(todayKey);
    saveProgress(next, todayKey);
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
            <p className="text-2xl">{ayah && ayah.arabicText}</p>
            <p className="mt-3">{ayah && ayah.translation}</p>
            <p className="mt-2 text-sm text-gray-500">
              {ayah && ayah.surahName} • Ayah {ayah && ayah.ayahNumber}
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
```
