from flask import Flask, render_template, request, abort, session, redirect
from datetime import datetime
import os

# ==========================================
# Flask App Setup
# ==========================================
app = Flask(__name__)
app.secret_key = "chemlab_secure_key_2026_only_for_you"

# Access log file
LOG_FILE = "access_log.txt"
if not os.path.exists(LOG_FILE):
    open(LOG_FILE, "w", encoding="utf-8").close()

# ==========================================
# Check if user has entered their name
# ==========================================
@app.before_request
def check_name():
    # Public routes that do not require a name
    public_routes = ["/nhap_ten", "/admin-logs-chemlab-2026"]
    if "username" not in session and request.path not in public_routes:
        return redirect("/nhap_ten")

# ==========================================
# Log all visits with username
# ==========================================
@app.before_request
def log_access():
    username = session.get("username", "Unknown")
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    ip = request.remote_addr
    page = request.path
    device = request.user_agent.string

    log_line = f"[{timestamp}] | Username: {username:<22} | IP: {ip:<16} | Page: {page:<22} | Device: {device}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_line)

# ==========================================
# Enter Name Page
# ==========================================
@app.route("/nhap_ten", methods=["GET", "POST"])
def enter_name():
    if request.method == "POST":
        name_input = request.form.get("name", "").strip()
        if name_input:
            session["username"] = name_input
            return redirect("/")
    return render_template("nhap_ten.html")

# ==========================================
# Main Pages
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
# Admin Access Logs
# ==========================================
@app.route("/admin-logs-chemlab-2026")
def view_logs():
    password = request.args.get("pass")
    if password != "chemlab123": # Change this to your own password
        abort(403)
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    return f"""
    <html style="background:#0f172a;color:#e2e8f0;padding:20px;font-family:monospace;">
        <h2>📋 ChemLab Access Logs</h2>
        <pre>{content}</pre>
    </html>
    """

# ==========================================
# Error Handler
# ==========================================
@app.errorhandler(404)
def page_not_found(error):
    return render_template("error.html"), 404

# ==========================================
# Run App
# ==========================================
if __name__ == "__main__":
    app.run(debug=True)
