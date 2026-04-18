import { useEffect, useState } from "react";

const STORAGE_KEY = "sabit-tracker";
const RANDOM_AYAH_URL =
  "https://api.quran.com/api/v4/verses/random?translations=131&fields=text_uthmani";

const SURAH_NAMES = [
  "Al-Fatihah",
  "Al-Baqarah",
  "Ali 'Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara",
  "An-Naml",
  "Al-Qasas",
  "Al-'Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shuraa",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadila",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saff",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Nazi'at",
  "'Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duhaa",
  "Ash-Sharh",
  "At-Tin",
  "Al-'Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-'Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-'Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

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
          throw new Error("Unable to load today's ayah.");
        }

        const data = await response.json();
        const verse = data?.verse;
        const chapterNumber =
          verse?.chapter_id || Number(verse?.verse_key?.split(":")[0]);
        const translationText = verse?.translations?.[0]?.text || "";

        setAyah({
          arabicText: verse?.text_uthmani || "Arabic text is not available right now.",
          translation:
            cleanTranslation(translationText) ||
            "Translation is not available right now.",
          surahName: SURAH_NAMES[chapterNumber - 1] || "Unknown Surah",
          ayahNumber: verse?.verse_number || verse?.verse_key?.split(":")[1] || "-",
        });
      } catch (fetchError) {
        setError(fetchError.message || "Something went wrong while loading the ayah.");
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

  // One shared action keeps the habit simple:
  // reading today always adds one day unless today is already counted.
  function markAsReadToday() {
    if (hasReadToday) {
      return;
    }

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f7f4ee_45%,_#ede7dc)] px-4 py-10 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-2xl border border-white/80 bg-white/90 p-8 shadow-calm backdrop-blur sm:p-10">
          <div className="space-y-8">
            <header className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-olive">
                Quran Habit Tracker
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">SABIT</h1>
              <p className="text-base text-slate-500">Stay connected daily</p>
              <p className="text-sm text-slate-500">{statusText}</p>
            </header>

            <div className="rounded-2xl bg-sand px-5 py-7 text-center">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="mx-auto h-2 w-24 rounded-full bg-stone-200" />
                  <p className="text-sm text-slate-500">Loading your ayah...</p>
                </div>
              ) : error ? (
                <div className="space-y-3">
                  <p className="text-lg font-medium text-slate-700">
                    Today&apos;s ayah could not be loaded.
                  </p>
                  <p className="text-sm text-slate-500">
                    {error} Please refresh and try again.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="arabic-ayah text-3xl leading-loose text-slate-900 sm:text-4xl">
                    {ayah?.arabicText}
                  </p>
                  <p className="text-sm leading-7 text-slate-600 sm:text-base">
                    {ayah?.translation}
                  </p>
                  <p className="text-sm font-medium text-olive">
                    {ayah?.surahName} • Ayah {ayah?.ayahNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 px-5 py-4 text-center">
              <p className="text-xl font-semibold text-slate-900">🔥 Streak: {streak} days</p>
            </div>

            <button
              type="button"
              onClick={markAsReadToday}
              disabled={hasReadToday}
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {hasReadToday ? "Already Marked Today" : "I Read Today ✅"}
            </button>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-5 text-center">
              <p className="text-sm font-medium text-emerald-900">
                Missed yesterday? You paused — not broken.
              </p>
              <button
                type="button"
                onClick={markAsReadToday}
                disabled={hasReadToday}
                className="mt-4 w-full rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with 1 Ayah (10 sec)
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
