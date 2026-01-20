import streamlit as st
import subprocess
import os

from auth import check_password

if not check_password():
    st.stop()

st.title("⚙️ Settings & Deployment")

st.markdown("""
### 🚀 Publish Changes

The website is **static**, meaning it needs to be rebuilt to show the changes you've made in this admin panel.
Click the button below to trigger a rebuild of the public website.
""")

if st.button("♻️ Rebuild Website Changes", type="primary"):
    with st.spinner("Rebuilding website... this may take a minute..."):
        try:
            # pages -> admin -> root
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            web_dir = os.path.join(root_dir, "web")
            
            # Run npm run build
            result = subprocess.run(
                ["npm", "run", "build"], 
                cwd=web_dir, 
                capture_output=True, 
                text=True
            )
            
            if result.returncode == 0:
                st.success("✅ Website successfully rebuilt!")
                with st.expander("Show Build Logs"):
                    st.code(result.stdout)
            else:
                st.error("❌ Build failed!")
                st.error(result.stderr)
        except Exception as e:
            st.error(f"Error triggering build: {e}")

    st.error(f"Error triggering build: {e}")

st.divider()

st.subheader("🚑 Disaster Recovery")
st.warning("Restoring from backup will OVERWRITE all current data. Proceed with caution.")
uploaded_backup = st.file_uploader("Upload Backup Zip", type="zip")
if uploaded_backup:
    if st.button("🚨 Restore Data Now"):
        import zipfile
        import shutil
        
        try:
            # Save upload to temp
            with open("temp_restore.zip", "wb") as f:
                f.write(uploaded_backup.getbuffer())
            
            # Unzip to data dir
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(root_dir, "data")
            
            with zipfile.ZipFile("temp_restore.zip", 'r') as zip_ref:
                zip_ref.extractall(data_dir)
                
            st.success("✅ Data Restored Successfully! Refreshing...")
            os.remove("temp_restore.zip")
            st.rerun()
        except Exception as e:
            st.error(f"Restore failed: {e}")

            st.error(f"Restore failed: {e}")

st.divider()

st.subheader("🎨 Appearance")
st.info("Customize the brand colors of your website.")

# Helper to read/write css (simplistic regex or just string replacement)
# We assume globals.css has standard root variables.
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSS_PATH = os.path.join(root_dir, "web", "app", "globals.css")

def get_css_var(var_name, content):
    import re
    # Match --var-name: hex; or --var-name: hsl; 
    # Current implementation uses HSL numbers like 222.2 84% 4.9%
    # But for a simple color picker we might want to just set it. 
    # Wait, our globals.css uses HSL space separated? Or standard css?
    # Let's verify content first. 
    # Actually, to be safe, let's just let user pick a Hex color and we convert it to HSL for the app if needed, 
    # or just use Hex if the app supports it.
    # Our app uses Tailwind with CSS variables. 
    # If variables are like "--primary: 221.2 83.2% 53.3%;" then we need to convert.
    pass

if os.path.exists(CSS_PATH):
    with open(CSS_PATH, "r") as f:
        css_content = f.read()

    # Simple regex to find the primary color line
    # Assuming standard format: --primary: ...;
    # We will just overwrite the :root definition for simplification? 
    # Or just tell user "Coming Soon" if regex is too risky?
    # Let's try a safe approach: Just replacing a known placeholder or well-formatted line.
    
    st.write("Theme customization requires matching CSS variable formats. Use with caution.")
    
    # Let's just provide a "Reset to Blue" or "Set to Red" for now as safe options, 
    # or advanced: Edit CSS directly?
    # Direct CSS edit is powerful.
    
    if st.checkbox("Show Advanced CSS Editor"):
        new_css = st.text_area("globals.css", value=css_content, height=300)
        if st.button("Save CSS"):
            with open(CSS_PATH, "w") as f:
                f.write(new_css)
            st.success("CSS Updated! Rebuild required.")

st.divider()

st.subheader("🛡️ Security")
with st.expander("Change Password"):
    with st.form("pwd_change_form"):
        new_p1 = st.text_input("New Password", type="password")
        new_p2 = st.text_input("Confirm New Password", type="password")
        
        if st.form_submit_button("Update Password"):
            if new_p1 and new_p1 == new_p2:
                from auth import save_secrets
                save_secrets(new_p1)
                st.success("Password updated! You will need to login again next time.")
            else:
                st.error("Passwords do not match or are empty.")

st.divider()

st.subheader("🏥 Health Check")
st.info("Check for broken links (404s) in your data.")

if st.button("Run Health Check"):
    import requests
    from data_manager import DataLayer
    db = DataLayer()
    
    links_to_check = []
    
    # Collect links
    for p in db.get_people():
        if p.photo: links_to_check.append(("Person Photo", p.name, p.photo))
    
    for pub in db.get_publications():
        if pub.pdf_link: links_to_check.append(("Pub PDF", pub.title, pub.pdf_link))
        if pub.code_link: links_to_check.append(("Pub Code", pub.title, pub.code_link))
        if pub.doi: links_to_check.append(("Pub DOI", pub.title, f"https://doi.org/{pub.doi}"))
        
    for proj in db.get_projects():
        for img in proj.images:
            if img: links_to_check.append(("Project Image", proj.title, img))
            
    st.write(f"checking {len(links_to_check)} links...")
    
    issues = []
    progress_bar = st.progress(0)
    
    for i, (kind, name, url) in enumerate(links_to_check):
        progress_bar.progress((i + 1) / len(links_to_check))
        
        # Skip local relative paths for now or check file existence
        if url.startswith("/"):
            # Local file check
            web_public = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web", "public")
            if not os.path.exists(web_public + url):
                issues.append(f"❌ {kind} - {name}: Local file not found ({url})")
            continue
            
        try:
            r = requests.head(url, timeout=3)
            if r.status_code >= 400:
                 # Fallback to get
                 r = requests.get(url, timeout=3)
                 if r.status_code >= 400:
                    issues.append(f"❌ {kind} - {name}: {r.status_code} ({url})")
        except:
            issues.append(f"❌ {kind} - {name}: Connection Error ({url})")
            
    if not issues:
        st.success("✅ All links are healthy!")
    else:
        st.error(f"Found {len(issues)} broken links:")
        for issue in issues:
            st.write(issue)

st.divider()

st.subheader("System Info")
st.info("Data Storage: JSON Files (Local)")
st.info(f"Data Directory: {os.path.join(root_dir, 'data')}")
