

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
  "https://api.quran.com/api/v4/verses/random?translations=131";

function getTodayKey() {
  const today = new Date();
        const response = await fetch(RANDOM_AYAH_URL);

        if (!response.ok) {
          throw new Error("Unable to load today's ayah.");
          throw new Error("Failed to load ayah");
        }

        const data = await response.json();
        const verse = data?.verse;
        const chapterNumber =
          verse?.chapter_id || Number(verse?.verse_key?.split(":")[0]);
        const translationText = verse?.translations?.[0]?.text || "";

        if (!verse) {
          throw new Error("Failed to load ayah");
        }

        setAyah({
          arabicText: verse?.text_uthmani || "Arabic text is not available right now.",
          translation:
            cleanTranslation(translationText) ||
            "Translation is not available right now.",
          surahName: SURAH_NAMES[chapterNumber - 1] || "Unknown Surah",
          ayahNumber: verse?.verse_number || verse?.verse_key?.split(":")[1] || "-",
          arabicText: verse.text_uthmani || "",
          translation: cleanTranslation(verse.translations?.[0]?.text || ""),
          surahName: verse.surah?.name_simple || "",
          ayahNumber: verse.verse_number || "",
        });
      } catch (fetchError) {
        setError(fetchError.message || "Something went wrong while loading the ayah.");
      } catch {
        setAyah(null);
        setError("Failed to load ayah");
      } finally {
        setIsLoading(false);
      }
    );
  }

  // One shared action keeps the habit simple:
  // reading today always adds one day unless today is already counted.
  // Reading today adds one day only once, and missed days never reset progress.
  function markAsReadToday() {
    if (hasReadToday) {
      return;
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
                <p className="text-lg font-medium text-slate-700">{error}</p>
              ) : (
                <div className="space-y-5">
                  <p className="arabic-ayah text-3xl leading-loose text-slate-900 sm:text-4xl">
