from flask import Flask
from flask import render_template
from flask import abort

# ==========================================
# Flask App
# ==========================================

app = Flask(__name__)

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

    return render_template("error.html"),404


# ==========================================
# Run
# ==========================================

if __name__=="__main__":

    app.run(
        debug=True
    )
def mol():

    return render_template("mol.html")