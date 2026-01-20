import streamlit as st
from data_manager import DataLayer, LabInfo
from auth import check_password
from upload_utils import image_uploader_widget

if not check_password():
    st.stop()

st.title("🧪 Lab Information")

db = DataLayer()
current_info = db.get_lab_info()

with st.form("lab_info_form"):
    lab_name = st.text_input("Lab Name", value=current_info.lab_name)
    
    mission = st.text_area("Mission Statement", value=current_info.mission_statement)
    
    # Image Uploader
    lab_photo = image_uploader_widget("Lab Group Photo", current_path=current_info.lab_photo, key="lab_photo")
    
    join_text = st.text_area("Join Lab Text", value=current_info.join_lab_text)

    st.subheader("Research Focus Areas")
    # Simple list management
    areas_text = st.text_area("Enter areas (one per line)", value="\n".join(current_info.research_focus_areas), height=150)
    
    st.subheader("🌐 Global SEO")
    s_title = st.text_input("Site Title (Browser Tab)", value=current_info.seo_title or "Research Lab")
    s_desc = st.text_input("Meta Description (Google)", value=current_info.seo_description or "A leading research group.")
    s_keys = st.text_input("Keywords (comma separated)", value=current_info.seo_keywords or "research, science")

    if st.form_submit_button("Save Lab Info"):
        areas = [line.strip() for line in areas_text.split("\n") if line.strip()]
        new_info = LabInfo(
            lab_name=lab_name,
            mission_statement=mission,
            research_focus_areas=areas,
            lab_photo=lab_photo,
            join_lab_text=join_text,
            seo_title=s_title,
            seo_description=s_desc,
            seo_keywords=s_keys
        )

        try:
            db.save_lab_info(new_info)
            st.success("Lab Info updated successfully!")
        except Exception as e:
            st.error(f"Error saving lab info: {e}")

