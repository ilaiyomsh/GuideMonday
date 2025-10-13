# 📚 מדריך אינטראקטיבי - Monday App

## 🎯 סקירה כללית
אפליקציית מדריך אינטראקטיבי מתקדמת שנבנתה על פלטפורמת Monday.com. האפליקציה מאפשרת יצירה, עריכה וניהול של מדריכים עם עיצוב מותאם אישית, העלאת מדיה, ושמירה אוטומטית.

## ✨ תכונות עיקריות

### 📖 ניהול תוכן
- **פרקים וסעיפים** - מבנה היררכי ברור
- **בלוקי תוכן** - טקסט עשיר, תמונות, וידאו, GIF, קישורים וטפסים
- **סידור מחדש** - גרור ושחרר פרקים וסעיפים
- **חיפוש מתקדם** - חיפוש בכל תוכן המדריך

### ✏️ מצב עריכה חכם
- **עריכה inline** - עריכה ישירה בממשק
- **פתיחה אוטומטית** - בלוקים חדשים נפתחים אוטומטית לעריכה
- **שמירה מתמדת** - כל שינוי נשמר ל-Monday Storage
- **בקרת גישה** - רק בעלי הבורד יכולים לערוך

### 🎨 עיצוב מותאם אישית (v4.0)
- **הפרדת עיצוב מתוכן** - עיצוב ותוכן נשמרים בנפרד
- **שינוי רקע** - בחירת צבע רקע למדריך
- **בחירת גופן** - 5 גופנים עבריים ואנגליים
- **העלאת לוגו** - לוגו מותאם עם חיתוך תמונה מובנה
- **ערכות נושא** - 5 ערכות צבעים מוכנות

### 📁 ניהול מדיה
- **לוח מדיה ייעודי** - כל תמונות ווידאו באחסון מרכזי
- **אתחול אוטומטי** - יצירת לוח מדיה בהתקנה ראשונה
- **תיוג חכם** - כל קובץ מתויג עם שם מדריך, פרק וסעיף
- **חיתוך תמונות** - עורך תמונות מובנה עם זום וסיבוב

### 🔄 מיגרציה אוטומטית
- **תאימות לאחור** - מדריכים ישנים ממוגררים אוטומטית
- **גיבוי** - גיבוי אוטומטי לפני מיגרציה
- **גרסאות** - מערכת ניהול גרסאות מובנית

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

## 🚀 התקנה והפעלה

### ⚙️ דרישות מוקדמות

לפני התחלת העבודה, וודא שיש לך:

- **Node.js** - גרסה 18.0.0 ומעלה ([הורד כאן](https://nodejs.org/))
- **npm** - מותקן אוטומטית עם Node.js (גרסה 9.0.0 ומעלה)
- **Git** - לשכפול הפרויקט ([הורד כאן](https://git-scm.com/))
- **חשבון Monday.com** - עם הרשאות יצירת אפליקציות

### 📦 התקנה - שלב אחר שלב

#### 1. שכפול הפרויקט מ-GitHub

```bash
git clone https://github.com/ilaiyomsh/GuideMonday.git
cd GuideMonday
```

#### 2. התקנת כל התלויות

```bash
npm install
```

**תלויות עיקריות שיותקנו:**
- `react` - ספריית הליבה
- `react-dom` - רנדור React
- `monday-sdk-js` - SDK של Monday.com
- `@vibe/core` - ספריית קומפוננטות של Monday
- `draft-js` - עורך טקסט עשיר
- `dompurify` - אבטחת HTML
- `cropperjs` - חיתוך תמונות
- ועוד...

**זמן ההתקנה:** כ-2-3 דקות (תלוי במהירות האינטרנט)

#### 3. הגדרת סביבת פיתוח

אין צורך בקבצי `.env` - כל ההגדרות מתבצעות דרך Monday.com!

---

### 🏃‍♂️ הרצת האפליקציה

#### הפעלה מקומית (Development Mode)

```bash
npm start
```

**מה קורה:**
1. ✅ שרת פיתוח עולה על port 8301
2. ✅ נפתח tunnel מאובטח עם ngrok
3. ✅ מוצג URL זמני: `https://xxxxx.apps-tunnel.monday.app`
4. ✅ Hot reload פעיל - שינויים בקוד מתעדכנים אוטומטית

**⚠️ חשוב:** שמור את ה-URL שמוצג בקונסול!

#### בנייה לייצור (Production Build)

```bash
npm run build
```

תיקיית `build/` תכיל את הקבצים הסטטיים המוכנים לפריסה.

---

### 🔧 הגדרת האפליקציה ב-Monday.com

#### שלב 1: יצירת אפליקציה ב-Monday

1. היכנס ל-[Monday Apps](https://auth.monday.com/developers)
2. לחץ על **"Create App"**
3. בחר שם לאפליקציה: **"Guide Learning"**
4. לחץ **"Create"**

#### שלב 2: הגדרת Board View

1. בתפריט השמאלי, לחץ על **"Features"**
2. לחץ **"Board View"** → **"Add Board View"**
3. בשדה **"View URL"**, הזן את ה-URL שקיבלת מ-`npm start`:
   ```
   https://xxxxx.apps-tunnel.monday.app
   ```
4. שם ה-View: **"Guide Learning"**
5. לחץ **"Save"**

#### שלב 3: הוספת הרשאות (Permissions)

1. עבור ל-**"OAuth & Permissions"**
2. הוסף את ההרשאות הבאות:
   - `boards:read` - קריאת נתוני לוחות
   - `boards:write` - עדכון נתוני לוחות
   - `storage:read` - קריאה מ-Monday Storage
   - `storage:write` - כתיבה ל-Monday Storage
3. לחץ **"Save"**

#### שלב 4: התקנה בבורד

1. פתח לוח (Board) ב-Monday
2. לחץ על **"+"** בסרגל ה-Views העליון
3. חפש את האפליקציה שלך: **"Guide Learning"**
4. לחץ **"Add to Board"**

🎉 **האפליקציה מותקנת ומוכנה לשימוש!**

---

### 🧪 בדיקה ראשונה

אחרי ההתקנה, האפליקציה תציג:

1. **מסך התקנה** - בחר בין:
   - 📋 **שימוש בתבנית ברירת מחדל** - מדריך דוגמה מלא
   - 🆕 **התחלה ריקה** - מדריך ריק לחלוטין
   - 📂 **העלאת JSON** - ייבוא מדריך קיים

2. **יצירת לוח מדיה** - אתחול אוטומטי של לוח לאחסון תמונות

3. **המדריך שלך** - מוכן לעריכה ושימוש!

---

### 📁 מבנה הפרויקט (למפתחים)

```
GuideMonday/
├── src/
│   ├── components/          # קומפוננטות React
│   │   ├── HomePage.jsx
│   │   ├── ChapterPage.jsx
│   │   ├── StyleSettings.jsx
│   │   ├── ImageCropperModal.jsx
│   │   └── ...
│   ├── hooks/              # Custom Hooks
│   │   ├── useGuideManager.js
│   │   ├── useStyleManager.js
│   │   └── useMondayApi.js
│   ├── services/           # לוגיקה עסקית
│   │   ├── guideService.js
│   │   ├── styleService.js
│   │   └── mediaBoardService.js
│   ├── context/            # React Context
│   │   └── GuideContext.jsx
│   ├── styles/             # קבצי CSS
│   ├── utils/              # פונקציות עזר
│   ├── constants/          # קבועים
│   └── defaultStyleTemplate.js
├── public/                 # קבצים סטטיים
├── package.json
├── vite.config.js         # קונפיגורציית Vite
└── README.md
```

---

## 🛠️ פקודות npm זמינות

```bash
# פיתוח - הרצת שרת מקומי
npm start

# בנייה - יצירת build לייצור
npm run build

# תצוגה מקדימה של build
npm run preview

# בדיקת lint
npm run lint

# תיקון lint אוטומטי
npm run lint:fix
```

---

## 🔑 API של Monday Storage

### שמירת נתונים

```javascript
// שמירת תוכן המדריך
await monday.storage.instance.setItem('guideData', jsonString);

// שמירת עיצוב המדריך (v4.0)
await monday.storage.instance.setItem('guideStyle', styleJsonString);
```

### טעינת נתונים

```javascript
// טעינת תוכן
const response = await monday.storage.instance.getItem('guideData');
const data = JSON.parse(response.data.value);

// טעינת עיצוב
const styleRes = await monday.storage.instance.getItem('guideStyle');
const style = JSON.parse(styleRes.data.value);
```

### הצגת הודעות

```javascript
monday.execute('notice', {
  message: 'הודעה למשתמש',
  type: 'success', // או 'error', 'warning', 'info'
  timeout: 5000
});
```

---

## 🐛 פתרון בעיות נפוצות

### בעיה: `npm install` נכשל

**פתרון:**
```bash
# נקה cache
npm cache clean --force

# מחק node_modules
rm -rf node_modules package-lock.json

# התקן מחדש
npm install
```

### בעיה: האפליקציה לא נטענת ב-Monday

**בדוק:**
1. ✅ ה-tunnel פעיל (`npm start` רץ)
2. ✅ ה-URL נכון ב-Monday Developer Portal
3. ✅ ההרשאות הוגדרו נכון
4. ✅ האפליקציה הותקנה בבורד

### בעיה: נתונים לא נשמרים

**פתרון:**
1. בדוק את הקונסול (F12) לשגיאות
2. ודא שיש הרשאות `storage:write`
3. רענן את הדף ונסה שוב
4. בדוק שאתה בעל הבורד

### בעיה: לוח המדיה לא נוצר

**פתרון:**
1. ודא שיש הרשאות `boards:write`
2. בדוק שיש הרשאות ליצירת לוחות בחשבון
3. רענן ונסה שוב - תיבת דו-שיח תופיע

---

## 🔐 אבטחה ופרטיות

- ✅ **כל הנתונים נשמרים בחשבון Monday שלך** - לא בשרתים חיצוניים
- ✅ **הרשאות מבוקרות** - רק בעלי הבורד יכולים לערוך
- ✅ **HTML Sanitization** - כל תוכן HTML מנוקה מקוד זדוני
- ✅ **HTTPS** - כל התקשורת מוצפנת

---

## 📚 טכנולוגיות בשימוש

- **React 18** - ספריית UI
- **Vite** - כלי build מהיר
- **Monday SDK** - אינטגרציה עם Monday
- **@vibe/core** - ספריית קומפוננטות של Monday
- **Draft.js** - עורך טקסט עשיר
- **DOMPurify** - אבטחת HTML
- **Cropper.js** - חיתוך תמונות

---

## 📖 תיעוד נוסף

- [Monday Apps Documentation](https://developer.monday.com/)
- [Monday SDK Reference](https://developer.monday.com/apps/docs/mondayapi)
- [Vibe Design System](https://style.monday.com/)

---

## 🤝 תרומה לפרויקט

מוזמנים לתרום לפרויקט:

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit את השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

---

## 📝 רישיון

פרויקט זה הוא קוד פתוח ללא רישיון ספציפי.

---

## 📞 יצירת קשר ותמיכה

- 🐛 **דיווח על באגים:** פתח Issue ב-GitHub
- 💡 **רעיונות לתכונות:** פתח Discussion ב-GitHub
- 📧 **שאלות:** צור Issue עם תגית "question"

---

## 🔄 גרסאות

### v4.0 (נוכחי) - הפרדת עיצוב מתוכן
- ✨ הפרדת guideStyle מ-guideData
- 🎨 תיבת עיצוב מחודשת עם כפתורי שמור
- 🐛 תיקוני באגים בכפתורי עריכה
- 🖼️ שיפורים בחיתוך לוגו

### v3.0 - העלאת מדיה ולוח מדיה
- 📁 לוח מדיה ייעודי לקבצים
- 🖼️ העלאת תמונות ווידאו
- 🎨 חיתוך תמונות מתקדם

### v2.0 - עורך טקסט עשיר
- 📝 עורך Draft.js
- 🎨 עיצוב טקסט (bold, italic, underline)
- 🎯 כותרות ורשימות

### v1.0 - גרסת בסיס
- 📖 הצגת מדריך בסיסי
- ✏️ עריכה פשוטה
- 💾 שמירה ל-Monday Storage

---

**פותח על ידי:** Ilai Yomsheni  
**תאריך עדכון אחרון:** אוקטובר 2025  
**גרסה נוכחית:** v4.0.0

## 💡 הלמות ושיפורים

### הבעיות שפתרנו:

1. **מבנה מעגלי ב-JSON** - וידוא שרק נתונים נקיים נשמרים
2. **מנגנון Retry חזק** - 3 ניסיונות עם וריפיקציה
3. **הפרדת עיצוב מתוכן** - שמירה עצמאית, ביצועים טובים יותר
4. **פתיחה אוטומטית של דיאלוגים** - רק כשבאמת נוצר פריט חדש
5. **z-index של כפתורי עריכה** - תיקון בעיות לחיצה

### עקרונות פיתוח:

- ✅ **תמיד לוודא סוג נתונים** לפני JSON.stringify
- ✅ **מנגנון retry** לפעולות רשת קריטיות
- ✅ **וריפיקציה** - קריאה חזרה אחרי שמירה
- ✅ **לוגים מפורטים** - console.log לדיבוג
- ✅ **טיפול בשגיאות** - הודעות ברורות למשתמש

---

## 🔧 פתרון בעיות נוספות

### אזהרת CORS בקונסול

זה נורמלי - האפליקציה רצה ב-iframe של Monday ויש הגבלות אבטחה.

### תמונות לא נטענות

ודא ש:
1. לוח המדיה נוצר (בדוק בקונסול)
2. יש הרשאות `boards:write`
3. התמונה קטנה מ-50MB

### מדריך נעלם אחרי רענון

1. בדוק שיש `storage:write` permission
2. בדוק את הקונסול לשגיאות שמירה
3. נסה לשמור שוב ידנית

---