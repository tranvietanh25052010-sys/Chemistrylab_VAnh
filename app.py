from flask import Flask, render_template, request, abort, session, redirect
from datetime import datetime
import os

# ==========================================
# Flask App
# ==========================================
app = Flask(__name__)
app.secret_key = "chemlab_secure_key_2026_only_for_you" # Khóa bảo mật riêng

# File lưu nhật ký truy cập
LOG_FILE = "access_log.txt"
if not os.path.exists(LOG_FILE):
    open(LOG_FILE, "w", encoding="utf-8").close()

# ==========================================
# Kiểm tra đã nhập tên chưa (chạy TRƯỚC mọi thứ)
# ==========================================
@app.before_request
def kiem_tra_ten():
    # Các đường dẫn được vào mà không cần nhập tên
    duong_dan_mo = ["/nhap-ten", "/admin-logs-chemlab-2026"]
    # Nếu chưa có tên và không phải đường dẫn mở → đẩy về trang nhập tên
    if "ten_nguoi_dung" not in session and request.path not in duong_dan_mo:
        return redirect("/nhap-ten")

# ==========================================
# Ghi nhật ký truy cập kèm tên
# ==========================================
@app.before_request
def log_access():
    ten = session.get("ten_nguoi_dung", "Không xác định")
    gio = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    ip = request.remote_addr
    trang = request.path
    thiet_bi = request.user_agent.string
    
    dong = f"[{gio}] | Tên: {ten:22} | IP: {ip:16} | Trang: {trang:22} | Thiết bị: {thiet_bi}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(dong)

# ==========================================
# Trang nhập tên
# ==========================================
@app.route("/nhap-ten", methods=["GET", "POST"])
def nhap_ten():
    if request.method == "POST":
        ten_nhap = request.form.get("ten", "").strip()
        if ten_nhap:
            session["ten_nguoi_dung"] = ten_nhap
            return redirect("/")
    return render_template("nhap_ten.html")

# ==========================================
# Các trang chính của ChemLab
# ==========================================
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/periodic")
def periodic():
    return render_template("periodic.html")

@app.route("/mol")
def mol():
    return render_template("mol.html")

@app.route("/equation")
def equation():
    return render_template("equation.html")

@app.route("/compound")
def compound():
    return render_template("compound.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

# ==========================================
# Xem nhật ký (giữ nguyên mật khẩu)
# ==========================================
@app.route("/admin-logs-chemlab-2026")
def xem_nhat_ky():
    mk = request.args.get("pass")
    if mk != "chemlab123": # Đổi mật khẩu ở đây nếu muốn
        abort(403)
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        nd = f.read()
    return f"<html style='background:#0f172a;color:#e2e8f0;padding:20px;font-family:monospace;'><h2>📋 Nhật ký truy cập ChemLab</h2><pre>{nd}</pre></html>"

# ==========================================
# Trang lỗi
# ==========================================
@app.errorhandler(404)
def page_not_found(error):
    return render_template("error.html"), 404

# ==========================================
# Chạy app
# ==========================================
if __name__ == "__main__":
    app.run(debug=True)
