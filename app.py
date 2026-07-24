from flask import Flask, render_template, request, abort
from datetime import datetime
import os

# ==========================================
# Flask App
# ==========================================
app = Flask(__name__)

# File lưu nhật ký truy cập
LOG_FILE = "access_log.txt"
if not os.path.exists(LOG_FILE):
    open(LOG_FILE, "w", encoding="utf-8").close()

# ==========================================
# Ghi nhật ký mỗi khi có người truy cập
# ==========================================
@app.before_request
def log_access():
    thoi_gian = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    dia_chi_ip = request.remote_addr
    trang_truy_cap = request.path
    thong_tin_thiet_bi = request.user_agent.string
    
    dong_ghi = f"[{thoi_gian}] | IP: {dia_chi_ip:15} | Trang: {trang_truy_cap:20} | Thiết bị: {thong_tin_thiet_bi}\n"
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(dong_ghi)

# ==========================================
# Home
# ==========================================
@app.route("/")
def home():
    return render_template("home.html")

# ==========================================
# Periodic Table
# ==========================================
@app.route("/periodic")
def periodic():
    return render_template("periodic.html")

# ==========================================
# Mol Calculator
# ==========================================
@app.route("/mol")
def mol():
    return render_template("mol.html")

# ==========================================
# Equation Balancer
# ==========================================
@app.route("/equation")
def equation():
    return render_template("equation.html")

# ==========================================
# Compound Search
# ==========================================
@app.route("/compound")
def compound():
    return render_template("compound.html")

# ==========================================
# Chemistry Quiz
# ==========================================
@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

# ==========================================
# Error Page
# ==========================================
@app.errorhandler(404)
def page_not_found(error):
    return render_template("error.html"), 404

# ==========================================
# Xem nhật ký truy cập (đặt mật khẩu đơn giản)
# ==========================================
@app.route("/admin-logs-chemlab-2026")
def xem_nhat_ky():
    mat_khau = request.args.get("pass")
    if mat_khau != "2505082000": # Đổi mật khẩu này thành mật khẩu bạn muốn
        abort(403) # Từ chối truy cập nếu sai mật khẩu
    
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        noi_dung = f.read()
    
    return f"""
    <html style="background:#1e293b;color:#f8fafc;padding:20px;font-family:monospace;">
        <h2>📋 Nhật ký truy cập Chemlab</h2>
        <pre style="white-space:pre-wrap;word-break:break-all;">{noi_dung}</pre>
    </html>
    """

# ==========================================
# Run
# ==========================================
if __name__ == "__main__":
    app.run(debug=True)
