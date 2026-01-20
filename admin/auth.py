import streamlit as st
import os

# Credentials Management
SECRETS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "secrets.json")

def load_secrets():
    import json
    if os.path.exists(SECRETS_FILE):
        with open(SECRETS_FILE, "r") as f:
            return json.load(f)
    return {"admin_user": "admin", "admin_pass": "admin123"}

def save_secrets(new_pass: str):
    import json
    secrets = load_secrets()
    secrets["admin_pass"] = new_pass
    with open(SECRETS_FILE, "w") as f:
        json.dump(secrets, f)

def check_password():
    """Returns `True` if the user had the correct password."""
    secrets = load_secrets()
    ADMIN_USER = secrets.get("admin_user", "admin")
    ADMIN_PASS = secrets.get("admin_pass", "admin123")

    def password_entered():
        """Checks whether a password entered by the user is correct."""
        if st.session_state["username"] == ADMIN_USER and st.session_state["password"] == ADMIN_PASS:
            st.session_state["password_correct"] = True
            del st.session_state["password"]  # don't store password
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        # First run, show input for username and password.
        st.text_input("Username", key="username")
        st.text_input("Password", type="password", on_change=password_entered, key="password")
        return False
    elif not st.session_state["password_correct"]:
        # Password not correct, show input + error.
        st.text_input("Username", key="username")
        st.text_input("Password", type="password", on_change=password_entered, key="password")
        st.error("😕 User not known or password incorrect")
        return False
    else:
        # Password correct.
        return True

def logout():
    st.session_state["password_correct"] = False
