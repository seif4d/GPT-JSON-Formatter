function extractConversationsToJson() {
    // 1. تحديد جميع عناصر المحادثات
    const conversationElements = document.querySelectorAll('div.conversation');

    // 2. تهيئة مصفوفة لتخزين بيانات المحادثات
    const allConversationsData = [];

    // 3. المرور على كل عنصر محادثة لاستخراج بياناته
    conversationElements.forEach(convoDiv => {
        const conversationData = {
            title: null, // سيتم تحديثه إذا وجد عنوان
            messages: []
        };

        // 3.1 محاولة استخراج العنوان (العنصر h4 داخل المحادثة)
        const titleElement = convoDiv.querySelector('h4');
        if (titleElement) {
            conversationData.title = titleElement.textContent.trim();
        }

        // 3.2 تحديد جميع عناصر الرسائل داخل المحادثة الحالية
        const messageElements = convoDiv.querySelectorAll('pre.message');

        // 3.3 المرور على كل عنصر رسالة لاستخراج المؤلف والمحتوى
        messageElements.forEach(messagePre => {
            const authorElement = messagePre.querySelector('div.author');
            // نفترض أن محتوى الرسالة هو العنصر div التالي مباشرة لعنصر المؤلف
            // أو يمكن استخدام selector أكثر تحديدًا إذا تغير الهيكل
            const contentElement = authorElement ? authorElement.nextElementSibling : messagePre.querySelector('div:not(.author)'); // طريقة بديلة لإيجاد المحتوى

            if (authorElement && contentElement) {
                const messageData = {
                    author: authorElement.textContent.trim(),
                    content: contentElement.textContent.trim()
                };
                conversationData.messages.push(messageData);
            } else {
                console.warn("Could not find author or content for a message in conversation:", conversationData.title || 'Untitled', messagePre);
            }
        });

        // 3.4 إضافة بيانات المحادثة المكتملة إلى المصفوفة الرئيسية
        if (conversationData.messages.length > 0) {
             allConversationsData.push(conversationData);
        } else if (conversationData.title) {
             // يمكن إضافة محادثات فارغة إذا كان لها عنوان فقط (اختياري)
             // allConversationsData.push(conversationData);
             console.warn("Conversation found with title but no messages:", conversationData.title);
        }
    });

    // 4. التأكد من وجود بيانات لاستخراجها
    if (allConversationsData.length === 0) {
        console.log("لم يتم العثور على أي محادثات بالصنف 'conversation'.");
        alert("لم يتم العثور على أي محادثات بالصنف 'conversation'.");
        return;
    }

    // 5. تحويل مصفوفة البيانات إلى نص JSON منسق
    const jsonString = JSON.stringify(allConversationsData, null, 2); // null, 2 للتنسيق الجميل

    // 6. إنشاء وتحميل ملف JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversations.json'; // اسم الملف الذي سيتم تحميله
    document.body.appendChild(a); // الإضافة ضرورية لبعض المتصفحات مثل Firefox
    a.click();
    document.body.removeChild(a); // التنظيف بعد التحميل
    URL.revokeObjectURL(url); // تحرير الذاكرة

    console.log(`تم استخراج ${allConversationsData.length} محادثة وحفظها في ملف conversations.json`);
    alert(`تم استخراج ${allConversationsData.length} محادثة بنجاح! تحقق من مجلد التنزيلات لملف conversations.json.`);
}

// --- كيفية الاستخدام ---
// 1. افتح صفحة HTML التي تحتوي على المحادثات في جوجل كروم.
// 2. اضغط F12 لفتح أدوات المطور (Developer Tools).
// 3. اذهب إلى تبويب "Console".
// 4. الصق الكود أعلاه بالكامل في الـ Console واضغط Enter.
// 5. سيقوم الكود بتشغيل الدالة extractConversationsToJson() تلقائيًا.

// تشغيل الدالة مباشرة بعد لصق الكود
extractConversationsToJson();
