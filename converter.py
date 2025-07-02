import json

def extract_text_from_parts(parts):
    """
    دالة ذكية لاستخراج النص من قائمة 'parts' التي قد تحتوي على نصوص وقواميس.
    """
    content_pieces = []
    if not isinstance(parts, list):
        return "" # إذا لم تكن قائمة، أرجع نصًا فارغًا

    for part in parts:
        if isinstance(part, str):
            content_pieces.append(part)
        elif isinstance(part, dict):
            # هنا يمكنك إضافة منطق أكثر تعقيدًا إذا كانت القواميس تحتوي على نص
            # على سبيل المثال، بعض البيانات قد تحتوي على نص داخل: part.get('text', '')
            # للتبسيط الآن، سنتجاهل القواميس التي لا نعرف هيكلها
            pass
    return "".join(content_pieces)

def transform_chat_data(input_filename="input.json", output_filename="conversations_formatted.json"):
    """
    يحول ملف بيانات المحادثات المعقد إلى صيغة JSON بسيطة ومنظمة.
    """
    print(f"🚀 جارٍ قراءة الملف: {input_filename}")
    
    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ خطأ: لم يتم العثور على الملف '{input_filename}'. تأكد من وجوده في نفس المجلد.")
        return
    except json.JSONDecodeError:
        print(f"❌ خطأ: الملف '{input_filename}' ليس ملف JSON صالح.")
        return

    all_formatted_conversations = []
    
    for i, conversation_data in enumerate(data, 1):
        print(f"🔍 [{i}/{len(data)}] جارٍ معالجة المحادثة بعنوان: '{conversation_data.get('title', 'بدون عنوان')}'")
        
        formatted_convo = {
            "title": conversation_data.get("title"),
            "messages": []
        }
        
        mapping = conversation_data.get("mapping", {})
        if not mapping:
            continue

        root_node = None
        for node in mapping.values():
            if node.get("parent") is None:
                root_node = node
                break
        
        if not root_node:
            continue

        children_of_root = root_node.get("children", [])
        if not children_of_root:
            continue
            
        current_node_id = children_of_root[0]
        
        while current_node_id:
            current_node = mapping.get(current_node_id)
            if not current_node:
                break

            message = current_node.get("message")
            
            if message and message.get("author") and "parts" in message.get("content", {}):
                if message["author"].get("role") != "system" or message["content"]["parts"]:
                    author = message["author"].get("role", "unknown")
                    
                    # ✅ استخدام الدالة الذكية الجديدة لاستخراج المحتوى
                    content = extract_text_from_parts(message["content"]["parts"])
                    
                    if content.strip(): # تأكد من أن المحتوى ليس فارغًا بعد التنظيف
                        formatted_convo["messages"].append({
                            "author": author,
                            "content": content.strip()
                        })

            children = current_node.get("children", [])
            if children:
                current_node_id = children[0]
            else:
                current_node_id = None

        if formatted_convo["messages"]:
            all_formatted_conversations.append(formatted_convo)

    print(f"\n💾 جارٍ حفظ {len(all_formatted_conversations)} محادثة في الملف: {output_filename}")
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(all_formatted_conversations, f, indent=2, ensure_ascii=False)
        
    print("✨ تمت العملية بنجاح!")

# --- كيفية الاستخدام ---
if __name__ == "__main__":
    # ⚠️ تأكد من أن هذا هو اسم ملفك!
    input_file = "conversations.json"
    
    # اسم الملف الذي سيتم إنشاؤه بالنتيجة
    output_file = "conversations_formatted.json"
    
    transform_chat_data(input_file, output_file)
