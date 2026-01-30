import streamlit as st
import subprocess
import os

from auth import check_password

if not check_password():
    st.stop()

st.title("⚙️ Settings & Deployment")

st.header("🚀 Deployment")
st.info("Two-step process: **Preview** changes locally first, then **Publish** to make them live.")

tab_preview, tab_publish = st.tabs(["1. Preview (Local)", "2. Publish (Live)"])

with tab_preview:
    st.subheader("Test Changes Locally")
    st.markdown("Run a local build to verify your edits before going live.")
    
    def ensure_node():
        """Ensures Node.js 20+ is available. Returns the PATH or modifies env."""
        # pages -> admin -> root
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        admin_dir = os.path.join(root_dir, "admin")
        
        # Check current version
        try:
            res = subprocess.run(["node", "-v"], capture_output=True, text=True)
            if res.returncode == 0:
                v_str = res.stdout.strip().lstrip("v") # e.g. 18.20.4
                major = int(v_str.split(".")[0])
                if major >= 20:
                    return os.environ.copy() # Good to go
                st.warning(f"⚠️ System Node.js ({v_str}) is too old. Needed 20+. Switching to portable Node...")
        except FileNotFoundError:
            st.warning("⚠️ Node.js not found. Switching to portable Node...")

        # Define portable path
        node_dist_dir = os.path.join(admin_dir, "node_dist")
        node_bin = os.path.join(node_dist_dir, "node-v22.11.0-linux-x64", "bin")
        
        if not os.path.exists(node_bin):
            os.makedirs(node_dist_dir, exist_ok=True)
            tar_path = os.path.join(node_dist_dir, "node.tar.xz")
            
            st.info("⬇️ Downloading Node.js v22 (standalone)...")
            # Download
            import urllib.request
            url = "https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz"
            try:
                urllib.request.urlretrieve(url, tar_path)
                st.info("📦 Extracting Node.js...")
                import tarfile
                with tarfile.open(tar_path) as f:
                    f.extractall(node_dist_dir)
                os.remove(tar_path)
            except Exception as e:
                st.error(f"Failed to download/setup Node.js: {e}")
                st.stop()
        
        # Setup Envs
        env = os.environ.copy()
        env["PATH"] = f"{node_bin}:{env['PATH']}"
        return env

    if st.button("♻️ Build & Preview", type="primary"):
        with st.spinner("Building local preview..."):
            try:
                root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                web_dir = os.path.join(root_dir, "web")
                
                build_env = ensure_node()
                
                # Check Dependencies
                node_modules_path = os.path.join(web_dir, "node_modules")
                if not os.path.exists(node_modules_path):
                    st.warning("Dependencies not found. Installing...")
                    install_cmd = ["npm", "ci"] if os.path.exists(os.path.join(web_dir, "package-lock.json")) else ["npm", "install"]
                    subprocess.run(install_cmd, cwd=web_dir, capture_output=True, env=build_env)

                # Build
                result = subprocess.run(["npm", "run", "build"], cwd=web_dir, capture_output=True, text=True, env=build_env)
                
                if result.returncode == 0:
                    st.success("✅ Preview Built! Check the main URL.")
                    with st.expander("Build Logs"):
                        st.code(result.stdout)
                else:
                    st.error("❌ Build Failed")
                    st.error(result.stderr)
            except Exception as e:
                st.error(f"Error: {e}")

with tab_publish:
    st.subheader("Update Public Website")
    st.markdown("Pushes your data changes to GitHub, triggering a live update.")
    
    if st.button("🚀 Publish to Live Website"):
        if "GITHUB_TOKEN" not in st.secrets:
            st.error("❌ `GITHUB_TOKEN` not found in Secrets. Cannot push.")
        else:
            with st.spinner("Pushing changes to GitHub..."):
                try:
                    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                    
                    # Git Config
                    subprocess.run(["git", "config", "user.name", "Streamlit Admin"], cwd=root_dir)
                    subprocess.run(["git", "config", "user.email", "admin@generated.com"], cwd=root_dir)
                    
                    # Add Data
                    subprocess.run(["git", "add", "data/*.json"], cwd=root_dir)
                    
                    # Commit
                    status = subprocess.run(["git", "status", "--porcelain"], cwd=root_dir, capture_output=True, text=True)
                    if not status.stdout:
                        st.info("⚠️ No changes to publish.")
                    else:
                        subprocess.run(["git", "commit", "-m", "update: content from admin panel"], cwd=root_dir)
                        
                        # Push
                        repo_url = f"https://{st.secrets['GITHUB_TOKEN']}@github.com/{st.secrets.get('GITHUB_REPO', 'shobhitvats/sk_lab_website')}.git"
                        push_res = subprocess.run(["git", "push", repo_url, "HEAD:main"], cwd=root_dir, capture_output=True, text=True)
                        
                        if push_res.returncode == 0:
                            st.success("✅ Changes Pushed! The live site will update in ~2 minutes.")
                        else:
                            st.error("❌ Push Failed")
                            st.code(push_res.stderr)
                            if "403" in push_res.stderr:
                                st.warning("💡 Tip: A 403 error usually means your GitHub Token is missing permissions. \n\n1. Go to GitHub Tokens.\n2. Regenerate your token.\n3. **IMPORTANT**: Check the box that says **'repo'** (Full control of private repositories).\n4. Update secrets in Streamlit.")
                except Exception as e:
                    st.error(f"Error: {e}")

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
