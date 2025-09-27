# מדריך אינטראקטיביה - אפליקציית Monday

## סקירה כללית
אפליקציית מדריך אינטראקטיבי שנבנתה על פלטפורמת Monday.com. האפליקציה מאפשרת יצירה, עריכה וניהול של תוכן מדריכים עם שמירה מתמדת באחסון של Monday.

## תכונות עיקריות
- 📖 **הצגת מדריך אינטראקטיבי** עם פרקים וסעיפים
- ✏️ **מצב עריכה** לעריכת תוכן בזמן אמת
- 💾 **שמירה אוטומטית** ל-Monday Storage
- 🔄 **סינכרון נתונים** בין מכונות וסשנים שונים
- 📁 **גיבוי אוטומטי** של הנתונים
- 🔀 **סידור מחדש** של פרקים וסעיפים
- ➕ **הוספת תוכן חדש** (טקסט, תמונות, וידאו, קישורים)

## פתרון בעיית האחסון - המקרה שלנו

### 🚨 הבעיה המקורית
בתחילת הפיתוח נתקלנו במספר בעיות:

1. **שגיאת מבנה מעגלי ב-JSON**:
   ```
   TypeError: Converting circular structure to JSON
   --> starting at object with constructor 'HTMLButtonElement'
   ```

2. **נתונים לא נשמרים ב-Monday Storage**:
   - הנתונים נשלחו לאחסון אך לא נשמרו
   - אחרי רענון הדף הנתונים נעלמו
   - תמיד חזר `value: null` מהאחסון

3. **בעיות סינכרון**:
   - הממשק לא התעדכן אחרי שמירה
   - נתונים חדשים לא הופיעו ללא רענון ידני

### 🔧 פתרון השלב הראשון - מבנה מעגלי
הבעיה העיקרית הייתה שפונקציית `handleSave` קיבלה את `event` object במקום את נתוני המדריך:

**לפני:**
```javascript
const handleSave = async (guideToSave) => {
  const jsonString = JSON.stringify(guideToSave); // guideToSave = Event object!
}
```

**אחרי:**
```javascript
const handleSave = async () => {
  if (!localGuideData) return;
  const jsonString = JSON.stringify(localGuideData); // נתונים נקיים!
}
```

### 🛠️ פתרון השלב השני - מנגנון Retry חזק
יצרנו מנגנון שמירה עמיד עם ניסיונות חוזרים:

```javascript
const handleSave = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 500;
  let saveSuccessful = false;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 1. שמירה ל-Monday Storage
      const saveResponse = await monday.storage.instance.setItem('guideData', jsonString);
      
      // 2. המתנה לעיבוד בשרת
      await sleep(RETRY_DELAY_MS);
      
      // 3. וריפיקציה שהנתונים נשמרו
      const verifyResponse = await monday.storage.instance.getItem('guideData');
      if (verifyResponse.data.value) {
        saveSuccessful = true;
        break; // הצלחה - יציאה מהלולאה
      }
    } catch (error) {
      console.error(`Save attempt ${attempt} failed:`, error);
    }
  }
}
```

### 🔍 פתרון השלב השלישי - דיבוג מתקדם
הוספנו לוגים מפורטים לזיהוי בעיות:

```javascript
console.log("GET Response - Full object:", JSON.stringify(storageRes, null, 2));
console.log("SAVE Response - Full object:", JSON.stringify(saveResponse, null, 2));
console.log("VERIFY - value field exists:", verifyRes?.data?.value ? "YES" : "NO");
```

### 📊 פתרון השלב הרביעי - סינכרון אוטומטי
אחרי שמירה מוצלחת:

```javascript
if (saveSuccessful) {
  // 1. יציאה ממצב עריכה
  setIsEditMode(false);
  
  // 2. רענון הנתונים מהאחסון
  await refreshGuideData();
  
  // 3. הודעה למשתמש
  monday.execute('notice', {
    message: 'המדריך עודכן ונשמר בהצלחה!',
    type: 'success'
  });
}
```

## ארכיטקטורת השמירה הסופית

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Action   │───▶│   handleSave()   │───▶│ Monday Storage  │
│   (Save Click)  │    │                  │    │   setItem()     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auto Refresh  │◄───│   Verification   │◄───│  Sleep 500ms    │
│ refreshGuideData│    │   getItem()      │    │  (Server Time)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## התקנה והפעלה

### דרישות מוקדמות
- Node.js (גרסה 14 ומעלה)
- npm או yarn
- חשבון Monday.com עם הרשאות פיתוח

### התקנת תלויות
```bash
npm install
```

### הפעלה מקומית
```bash
npm start
```
כתובת הטסט תופיע בטרמינל: `https://xxxxx.apps-tunnel.monday.app`

### פריסה לייצור
```bash
npm run deploy
```

## הגדרת האפליקציה ב-Monday

1. כנס ל-monday.com והגדר חשבון פיתוח
2. צור אפליקציה חדשה מסוג "Board View"
3. בחר "External hosting" והזן את כתובת הטסט
4. הוסף את האפליקציה לבורד כ-View

## מבנה הפרויקט

```
src/
├── App.jsx              # קומפוננטה ראשית עם לוגיקת האחסון
├── components/
│   ├── Sidebar.jsx      # תפריט ניווט
│   ├── HomePage.jsx     # עמוד הבית
│   ├── ChapterPage.jsx  # עמוד פרק
│   ├── Section.jsx      # קומפוננטת סעיף
│   ├── ContentBlock.jsx # בלוק תוכן
│   └── EditForm.jsx     # טופס עריכה
├── defaultGuideTemplate.js # תבנית ברירת מחדל
└── App.css             # עיצובים
```

## API של Monday Storage

### שמירת נתונים
```javascript
await monday.storage.instance.setItem('guideData', jsonString);
```

### טעינת נתונים
```javascript
const response = await monday.storage.instance.getItem('guideData');
const data = JSON.parse(response.data.value);
```

### הצגת הודעות למשתמש
```javascript
monday.execute('notice', {
  message: 'הודעה למשתמש',
  type: 'success', // או 'error', 'warning'
  timeout: 5000
});
```

## הלמות שנלמדו

1. **תמיד לוודא את סוג הנתונים** לפני JSON.stringify
2. **להשתמש במנגנון retry** עבור פעולות רשת קריטיות
3. **לוודא שמירה על ידי קריאה חזרה** (verification)
4. **להוסיף לוגים מפורטים** לדיבוג בעיות אחסון
5. **לטפל באופן גרייספול בכשלים** ולספק משוב למשתמש

## תרומה לפרויקט

מוזמנים לשלוח Pull Requests או לדווח על בעיות ב-Issues.

---

**פותח על ידי:** צוות הפיתוח  
**תאריך עדכון אחרון:** ספטמבר 2025  
**גרסה:** 3.0.0