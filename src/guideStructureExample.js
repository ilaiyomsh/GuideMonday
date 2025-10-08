/**
 * קובץ תבנית/מדריך למודל בינה מלאכותית עבור בנייה ועריכה של מדריך אינטראקטיבי.
 * כיצד להשתמש:
 * 1) קרא את אובייקט ה-export כמבנה יעד. שמור על ההיררכיה: homePage → chapters → sections → contentBlocks
 * 2) ערוך תכנים בהתאם לקלט המשתמש, מבלי לשבור את הסכמה (ראה meta.ai_instructions)
 * 3) שמור על ייחודיות מזהים (IDs) ותבניותיהם. אל תמחוק את meta.
 * 4) הקפד לסנן/להגביל HTML בהתאם למדיניות המופיעה ב-meta, ובמיוחד בשדות embedCode.
 */

export const GUIDE_STRUCTURE_EXAMPLE = {
  // ===== META: הנחיות למודל ולוולידציה =====
  "meta": {
    "version": "1.0",
    "language": "he",
    "purpose": "קובץ תבנית לעריכה אוטומטית ע\"י מודל בינה מלאכותית",
    "ai_instructions": {
      "goal": "לייצר/לעדכן מדריך שלם על בסיס תוכן קלט",
      "allowed_operations": [
        "update_text",
        "add_chapter",
        "add_section",
        "add_block",
        "reorder",
        "delete_block"
      ],
      "disallowed_operations": [
        "remove_meta",
        "change_id_format",
        "introduce_unknown_block_type",
        "remove_required_fields"
      ],
      "id_policies": {
        "chapter": "^chap_[0-9]+$",
        "section": "^sec_[0-9]+$",
        "block": "^block_(txt|img|vid|gif|form)_[0-9]+$"
      },
      "content_policy": {
        "text_max_length": 10000,
        "html_allowed_tags_general": ["p","strong","em","ul","ol","li","a","br"],
        "html_allowed_in_embedCode_only": ["iframe","div"],
        "disallowed_tags": ["script","style"],
        "sanitize_urls": true
      },
      "validation": {
        "required_top_level": ["homePage","chapters"],
        "chapter_required_fields": ["id","title"],
        "section_required_fields": ["id","title","contentBlocks"],
        "block_required_fields": ["id","type","data"],
        "block_type_enum": ["text","image","video","gif","form"]
      }
    }
  },
  // ===== דף הבית =====
  "homePage": {
    // חובה: כותרת קצרה וברורה לדף הבית (טקסט רגיל, ללא HTML)
    "title": "כותרת דף הבית",
    // חובה: תיאור קצר למדריך (טקסט רגיל, ללא HTML)
    "content": "תיאור כללי של המדריך"
  },

  // ===== פרקים =====
  "chapters": [
    {
      // מזהה ייחודי לפרק - חייב להתחיל ב-chap_
      "id": "chap_1",
      
      // כותרת הפרק - טקסט חופשי
      "title": "כותרת הפרק",
      
      // תוכן/תיאור הפרק - טקסט חופשי
      "content": "תיאור הפרק - מה המשתמשים ילמדו בפרק זה",
      
      // ===== סעיפים =====
      "sections": [
        {
          // מזהה ייחודי לסעיף - חייב להתחיל ב-sec_
          "id": "sec_1",
          
          // כותרת הסעיף - טקסט חופשי
          "title": "כותרת הסעיף",
          
          // ===== בלוקי תוכן =====
          "contentBlocks": [
            
            // ----- בלוק טקסט -----
            {
              "id": "block_txt_001",  // מזהה ייחודי
              "type": "text",          // סוג הבלוק: "text"
              "data": {
                // תוכן HTML - מותר רק תגיות שב-meta.ai_instructions.content_policy.html_allowed_tags_general
                "content": "<p>זהו בלוק טקסט. ניתן להשתמש בתגיות HTML לעיצוב.</p><p><strong>טקסט מודגש</strong> ו<em>טקסט נטוי</em></p><ul><li>פריט 1</li><li>פריט 2</li></ul>"
              }
            },
            
            // ----- בלוק תמונה -----
            {
              "id": "block_img_001",
              "type": "image",         // סוג הבלוק: "image"
              "data": {
                // URL מלא של התמונה (חובה, https בלבד)
                "url": "https://example.com/path/to/image.jpg",
                
                // כיתוב לתמונה - טקסט חופשי (אופציונלי)
                "caption": "תיאור התמונה או כיתוב"
              }
            },
            
            // ----- בלוק וידאו -----
            {
              "id": "block_vid_001",
              "type": "video",         // סוג הבלוק: "video"
              "data": {
                // קוד הטמעה מלא של הוידאו (iframe בתוך div). תגיות מותרות לפי meta.ai_instructions.content_policy.html_allowed_in_embedCode_only
                // דוגמה: מ-YouTube, Loom, Vimeo וכו'
                "embedCode": "<div style=\"position: relative; padding-bottom: 56.25%; height: 0;\"><iframe src=\"https://www.youtube.com/embed/VIDEO_ID\" frameborder=\"0\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe></div>",
                
                // כותרת לוידאו - טקסט חופשי
                "title": "כותרת הוידאו"
              }
            },
            
            // ----- בלוק GIF -----
            {
              "id": "block_gif_001",
              "type": "gif",           // סוג הבלוק: "gif"
              "data": {
                // קוד הטמעה של ה-GIF (div עם img). אין להשתמש בתגיות אסורות (script/style)
                // יכול להיות קישור ישיר לתמונת GIF או קוד הטמעה מלא
                "embedCode": "<div><img style=\"max-width:100%;\" src=\"https://example.com/path/to/animation.gif\" alt=\"GIF\"></div>",
                
                // כיתוב ל-GIF - טקסט חופשי (אופציונלי)
                "caption": "תיאור או כיתוב ל-GIF"
              }
            },
            
            // ----- בלוק טופס -----
            {
              "id": "block_form_001",
              "type": "form",          // סוג הבלוק: "form"
              "data": {
                // קוד הטמעה מלא של הטופס (iframe). תגיות מותרות לפי meta.ai_instructions.content_policy.html_allowed_in_embedCode_only
                // דוגמה: מ-Google Forms, Typeform, Microsoft Forms וכו'
                "embedCode": "<iframe src=\"https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true\" width=\"640\" height=\"800\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\">טוען...</iframe>",
                
                // כותרת לטופס - טקסט חופשי
                "title": "כותרת הטופס"
              }
            }
            
          ]
        }
        
        // ניתן להוסיף סעיפים נוספפים באותו הפורמט
        // {
        //   "id": "sec_2",
        //   "title": "סעיף שני",
        //   "contentBlocks": [...]
        // }
        
      ]
    }
    
    // ניתן להוסיף פרקים נוספים באותו הפורמט
    // {
    //   "id": "chap_2",
    //   "title": "פרק שני",
    //   "content": "תיאור",
    //   "sections": [...]
    // }
    
  ]
};

/**
 * הערות חשובות:
 * 
 * 1. מזהים (IDs):
 *    - כל מזהה חייב להיות ייחודי בכל המדריך
 *    - פרקים: chap_1, chap_2, chap_3...
 *    - סעיפים: sec_1, sec_2, sec_3...
 *    - בלוקים: block_txt_001, block_img_001, block_vid_001...
 * 
 * 2. סוגי בלוקים (types):
 *    - "text" - בלוק טקסט עם תמיכה ב-HTML
 *    - "image" - תמונה עם URL וכיתוב
 *    - "video" - וידאו מוטמע (iframe)
 *    - "gif" - אנימציית GIF (img או iframe)
 *    - "form" - טופס מוטמע (iframe)
 * 
 * 3. מבנה היררכי:
 *    מדריך → פרקים (chapters) → סעיפים (sections) → בלוקי תוכן (contentBlocks)
 * 
 * 4. שדות חובה:
 *    - כל אובייקט חייב לכלול את השדה "id"
 *    - כל בלוק חייב לכלול "id", "type", ו-"data"
 *    - תוכן השדה "data" משתנה בהתאם לסוג הבלוק
 */

