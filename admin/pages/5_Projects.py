import streamlit as st
from data_manager import DataLayer, Project
from auth import check_password
import os

if not check_password():
    st.stop()

st.title("🚀 Projects")

db = DataLayer()
projects = db.get_projects()

def save_project(proj: Project, index: int = -1):
    if index >= 0:
        projects[index] = proj
    else:
        projects.append(proj)
    db.save_projects(projects)
    st.success("Project saved!")
    st.rerun()

def delete_project(index: int):
    projects.pop(index)
    db.save_projects(projects)
    st.success("Deleted!")
    st.rerun()

tab_list, tab_add = st.tabs(["View / Edit", "Add New"])

with tab_add:
    st.subheader("Add Project")
    with st.form("add_project_form"):
        title = st.text_input("Title")
        status = st.selectbox("Status", ["Ongoing", "Completed"])
        desc = st.text_area("Description")
        
        # Simple single image uploader for now, or maybe just stick to text area for multiple?
        # Let's keep the text area for list of URLs but Add a helper uploader that appends to it?
        # Or simpler: Just a "Main Project Image" uploader that we assume is the first one.
        st.info("Upload a main image (will be added to the list). For multiple images, manually edit the list below.")
        from upload_utils import image_uploader_widget
        ul_img = image_uploader_widget("Upload Image", key="new_proj_img")
        
        current_images_val = ""
        if ul_img:
             current_images_val = ul_img
             
        images = st.text_area("Image URLs (one per line)", value=current_images_val)
        collaborators = st.text_input("Collaborators (comma separated)")
        related_pubs = st.text_input("Related Publications (titles/IDs comma separated)")

        submitted = st.form_submit_button("Add Project")
        if submitted:
            if not title:
                st.error("Title is required")
            else:
                img_list = [i.strip() for i in images.split('\n') if i.strip()]
                collab_list = [c.strip() for c in collaborators.split(',') if c.strip()]
                rel_pubs_list = [p.strip() for p in related_pubs.split(',') if p.strip()]

                p = Project(
                    title=title, description=desc, status=status,
                    images=img_list, collaborators=collab_list,
                    related_publications=rel_pubs_list
                )
                save_project(p)

with tab_list:
    # Filter Controls
    c_search, c_filter = st.columns([3, 1])
    search_term = c_search.text_input("Search Projects", placeholder="Title...")
    show_completed = c_filter.checkbox("Show Completed", value=False)
    
    filtered_projects = []
    for i, p in enumerate(projects):
        if search_term and search_term.lower() not in p.title.lower():
            continue
        if not show_completed and p.status == "Completed":
            continue
        filtered_projects.append((i, p))
        
    if not filtered_projects:
        st.info("No projects found.")
    else:
        st.write(f"Showing {len(filtered_projects)} projects")
        for original_idx, proj in filtered_projects:
            with st.expander(f"{proj.title} ({proj.status})"):
                with st.form(f"edit_proj_{i}"):
                    e_title = st.text_input("Title", value=proj.title)
                    e_status = st.selectbox("Status", ["Ongoing", "Completed"], index=0 if proj.status == "Ongoing" else 1)
                    e_desc = st.text_area("Description", value=proj.description)
                    
                    from upload_utils import image_uploader_widget
                    st.markdown("---")
                    st.markdown("---")
                    st.write("Current Images (Visual Manager):")
                    
                    if not proj.images:
                        st.info("No images.")
                    else:
                        cols = st.columns(3)
                        for img_idx, img_url in enumerate(proj.images):
                             with cols[img_idx % 3]:
                                 if img_url:
                                     try:
                                         # Try to show if local
                                         LOCAL_PREFIX = "/uploads"
                                         display_path = img_url
                                         if img_url.startswith(LOCAL_PREFIX):
                                             root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                                             real_path = os.path.join(root_dir, "web", "public") + img_url
                                             if os.path.exists(real_path):
                                                 display_path = real_path
                                         
                                         st.image(display_path, use_container_width=True)
                                         if st.button("❌ Remove", key=f"rm_img_{i}_{img_idx}"):
                                             proj.images.pop(img_idx)
                                             save_project(proj, i) # This will rerun
                                     except Exception as e:
                                         st.error(f"Error loading image: {e}")
                                         st.write(img_url)
                    
                    new_ul = image_uploader_widget("Upload New Image (to append)", key=f"edit_proj_img_{i}")
                    
                    # Logic to append new upload to the text area value if it happened
                    current_imgs_str = "\n".join(proj.images)
                    if new_ul and new_ul not in proj.images:
                        current_imgs_str += f"\n{new_ul}"
                    
                    e_images = st.text_area("Image URLs", value=current_imgs_str, key=f"edit_proj_imgs_text_{i}")
                    e_collab = st.text_input("Collaborators", value=", ".join(proj.collaborators))
                    e_related = st.text_input("Related Publications", value=", ".join(proj.related_publications))

                    saved = st.form_submit_button("Update")
                    if saved:
                        img_list = [line.strip() for line in e_images.split('\n') if line.strip()]
                        collab_list = [c.strip() for c in e_collab.split(',') if c.strip()]
                        rel_pubs_list = [p.strip() for p in e_related.split(',') if p.strip()]
                        
                        p = Project(
                            title=e_title, description=e_desc, status=e_status,
                            images=img_list, collaborators=collab_list,
                            related_publications=rel_pubs_list
                        )
                        save_project(p, i)
                
                if st.button(f"Delete '{proj.title}'", key=f"del_proj_{i}"):
                    delete_project(i)
