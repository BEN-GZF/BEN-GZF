import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client

app = Flask(__name__)

# 仅允许来自你的前端域名的跨域；首次调通可先用 *，上线后改成固定域名
CORS(app, resources={r"/*": {"origins": os.environ.get("FRONTEND_ORIGIN", "*")}})

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/upload")
def upload():
    f = request.files.get("file")
    title = request.form.get("title") if request.form.get("title") else (f.filename if f else "untitled")
    if not f:
        return jsonify({"error": "no file"}), 400

    # 1) 存到 Supabase Storage（bucket: videos）
    storage_path = f"uploads/{title}"
    sb.storage.from_("videos").upload(storage_path, f.read(), {"content-type": f.mimetype})

    # 2) 写入 DB 行：status=pending
    row = {"title": title, "storage_path": storage_path, "status": "pending"}
    inserted = sb.table("videos").insert(row).execute().data[0]
    return {"ok": True, "video": inserted}
