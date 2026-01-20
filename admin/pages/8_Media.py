import streamlit as st
import os
import shutil
from data_manager import DataLayer
from auth import check_password

if not check_password():
    st.stop()

st.title("🖼️ Media Library")

db = DataLayer()
# Go up 3 levels: pages -> admin -> root
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
uploads_dir = os.path.join(root_dir, "web", "public", "uploads")

# 1. Scan all files
if not os.path.exists(uploads_dir):
    st.error(f"Uploads directory not found: {uploads_dir}")
    st.stop()
    
all_files = [f for f in os.listdir(uploads_dir) if os.path.isfile(os.path.join(uploads_dir, f))]

# 2. Check usage
used_files = set()

# Check People
for p in db.get_people():
    if p.photo and p.photo.startswith("/uploads/"):
        used_files.add(p.photo.replace("/uploads/", ""))

# Check Projects
for p in db.get_projects():
    for img in p.images:
        if img and img.startswith("/uploads/"):
            used_files.add(img.replace("/uploads/", ""))
            
# Check Lab Info
info = db.get_lab_info()
if info.lab_photo and info.lab_photo.startswith("/uploads/"):
    used_files.add(info.lab_photo.replace("/uploads/", ""))

# 3. Categorize
orphaned_files = []
active_files = []

for f in all_files:
    if f in used_files:
        active_files.append(f)
    else:
        # Ignore system files
        if not f.startswith("."):
            orphaned_files.append(f)

# --- UI ---

tab_orphans, tab_active = st.tabs([f"🗑️ Clean Up ({len(orphaned_files)})", f"✅ Active ({len(active_files)})"])

with tab_orphans:
    st.markdown("### Orphaned Files")
    st.info("These files are in your `uploads` folder but are NOT used by any Person, Project, or Lab Info. You can safely delete them.")
    
    if orphaned_files:
        if st.button(f"🗑️ Delete ALL {len(orphaned_files)} Orphaned Files", type="primary"):
             count = 0
             for f in orphaned_files:
                 try:
                     os.remove(os.path.join(uploads_dir, f))
                     count += 1
                 except Exception as e:
                     st.error(f"Failed to delete {f}: {e}")
             st.success(f"Deleted {count} files!")
             st.rerun()
             
        st.divider()
        st.write("Preview:")
        cols = st.columns(4)
        for i, f in enumerate(orphaned_files):
             with cols[i % 4]:
                 st.image(os.path.join(uploads_dir, f), caption=f, use_container_width=True)
    else:
        st.success("Clean! No orphaned files found.")

with tab_active:
    st.markdown("### Active Files")
    st.info("These files are currently in use.")
    
    if active_files:
        cols = st.columns(4)
        for i, f in enumerate(active_files):
             with cols[i % 4]:
                 st.image(os.path.join(uploads_dir, f), caption=f, use_container_width=True)
    else:
        st.info("No active files found.")
