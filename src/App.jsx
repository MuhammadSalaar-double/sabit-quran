import { useEffect, useState } from "react"; import { motion, AnimatePresence } from "framer-motion"; import { CheckCircle, BookOpen } from "lucide-react";

const STORAGE_KEY = "sabit-tracker";

// Saheeh International translation (20) - Authentic Sunni source const RANDOM_AYAH_URL = "https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani,chapter_id,verse_key";

// ===== Helpers ===== function getTodayKey() { const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, "0"); const day = String(today.getDate()).padStart(2, "0");

return year + "-" + month + "-" + day; }

function parseDateKey(dateKey) { const parts = dateKey.split("-"); return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])); }

function getDaysBetween(startDateKey, endDateKey) { const msPerDay = 1000 * 60 * 60 * 24; const start = parseDateKey(startDateKey); const end = parseDateKey(endDateKey); return Math.round((end - start) / msPerDay); }

function cleanTranslation(text = "") { const withoutFootnotes = text.replace(/<sup[^>]>.?</sup>/gi, ""); const container = document.createElement("div"); container.innerHTML = withoutFootnotes; return container.textContent ? container.textContent.trim() : ""; }

function getStoredProgress() { const saved = localStorage.getItem(STORAGE_KEY);

if (!saved) { return { streak: 0, lastReadDate: "" }; }

try { const parsed = JSON.parse(saved); return { streak: Number(parsed.streak) || 0, lastReadDate: parsed.lastReadDate || "", }; } catch { return { streak: 0, lastReadDate: "" }; } }

// ===== App ===== function App() { const [ayah, setAyah] = useState(null); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState(""); const [streak, setStreak] = useState(0); const [lastReadDate, setLastReadDate] = useState("");

// Load streak useEffect(() => { const saved = getStoredProgress(); setStreak(saved.streak); setLastReadDate(saved.lastReadDate); }, []);

// Fetch ayah useEffect(() => { async function fetchAyah() { try { setIsLoading(true); setError("");

    const response = await fetch(RANDOM_AYAH_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch ayah");
    }

    const data = await response.json();
    const verse = data && data.verse ? data.verse : null;

    if (!verse) {
      throw new Error("No ayah data received");
    }

    // Fetch Surah name
    let surahName = "Unknown Surah";
    if (verse.chapter_id) {
      try {
        const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${verse.chapter_id}`);
        if (chapterRes.ok) {
          const chapterData = await chapterRes.json();
          if (chapterData?.chapter?.name_simple) {
            surahName = chapterData.chapter.name_simple;
          }
        }
      } catch (e) {
        console.error("Failed to fetch surah name", e);
      }
    }

    setAyah({
      arabicText: verse.text_uthmani || "No Arabic text",

      translation: cleanTranslation(
        verse.translations && verse.translations[0]
          ? verse.translations[0].text
          : "Translation not available"
      ),

      surahName: surahName,

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

const todayKey = getTodayKey(); const hasReadToday = lastReadDate === todayKey; const hasMissedDay = lastReadDate && getDaysBetween(lastReadDate, todayKey) > 1;

function saveProgress(nextStreak, nextDate) { localStorage.setItem( STORAGE_KEY, JSON.stringify({ streak: nextStreak, lastReadDate: nextDate, }) ); }

function markAsReadToday() { if (hasReadToday) return;

// Reset streak if a day was missed, otherwise increment
const next = hasMissedDay ? 1 : streak + 1;
setStreak(next);
setLastReadDate(todayKey);
saveProgress(next, todayKey);
}

const statusText = hasReadToday ? "Today's reading is already counted. Your streak is safe." : hasMissedDay ? "You missed a day, so your streak has reset, but keep going!" : "One ayah today is enough to keep the habit alive.";

return (

<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center w-full max-w-2xl" >
Stay connected daily

<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-neutral-400 font-medium" > {statusText} </motion.p>
    <div className="mt-8 relative w-full bg-white shadow-xl shadow-neutral-200/50 p-8 rounded-3xl border border-neutral-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 py-10"
          >
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-400 animate-pulse">Fetching daily ayah...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-red-500 flex flex-col items-center"
          >
            <p className="text-lg font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm underline text-red-400 hover:text-red-600"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="ayah"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <p className="text-3xl md:text-4xl text-neutral-800 leading-loose font-arabic text-center mb-6" dir="rtl" style={{ lineHeight: '2' }}>
              {ayah && ayah.arabicText}
            </p>
            <div className="w-16 h-[2px] bg-emerald-100 mb-6"></div>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-6 font-serif">
              "{ayah && ayah.translation}"
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-full text-sm font-medium text-emerald-700">
              {ayah && ayah.surahName} • Ayah {ayah && ayah.ayahNumber}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="mt-10 flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-neutral-100">
        <span className="text-xl">🔥</span>
        <span className="text-lg font-bold text-neutral-800">{streak} Day Streak</span>
      </div>

      <button
        onClick={markAsReadToday}
        disabled={hasReadToday || isLoading || !!error}
        className={`
          group relative flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
          ${hasReadToday 
            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-lg shadow-emerald-600/30 active:scale-95'
          }
        `}
      >
        {hasReadToday ? (
          <>
            <CheckCircle className="w-6 h-6 text-neutral-400" />
            Read Today
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            I Read Today
          </>
        )}
      </button>
    </motion.div>
  </motion.div>
</main>
); }
