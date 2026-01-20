import streamlit as st
from data_manager import DataLayer, ProfessorProfile
from auth import check_password

if not check_password():
    st.stop()

st.title("👤 Professor Profile")

# Initialize DataLayer
db = DataLayer()

# Load current data
current_profile = db.get_profile()

with st.form("profile_form"):
    col1, col2 = st.columns(2)
    with col1:
        name = st.text_input("Full Name", value=current_profile.name)
        title = st.text_input("Title", value=current_profile.title)
        email = st.text_input("Email", value=current_profile.email)
        phone = st.text_input("Phone", value=current_profile.phone)
    with col2:
        affiliation = st.text_input("Affiliation", value=current_profile.affiliation)
        location = st.text_input("Office Location", value=current_profile.office_location)
        
        # Image Uploader
        from upload_utils import image_uploader_widget
        profile_photo = image_uploader_widget("Profile Photo", current_path=current_profile.profile_photo, key="prof_photo")

    st.subheader("Bio")
    bio_short = st.text_area("Short Bio (Home Page)", value=current_profile.bio_short, height=100)
    bio_long = st.text_area("Long Bio (Profile Page)", value=current_profile.bio_long, height=300)

    st.subheader("Social Links")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        gs = st.text_input("Google Scholar URL", value=current_profile.google_scholar_url)
    with c2:
        orcid = st.text_input("ORCID", value=current_profile.orcid)
    with c3:
        tw = st.text_input("Twitter URL", value=current_profile.twitter_url)
    with c4:
        li = st.text_input("LinkedIn URL", value=current_profile.linkedin_url)

    if st.form_submit_button("Save Profile"):
        new_profile = ProfessorProfile(
            name=name, title=title, affiliation=affiliation,
            bio_short=bio_short, bio_long=bio_long,
            profile_photo=profile_photo, # Use the path from uploader
            email=email, phone=phone, office_location=location,
            google_scholar_url=gs or None,
            orcid=orcid or None,
            twitter_url=tw or None,
            linkedin_url=li or None
        )
        try:
            db.save_profile(new_profile)
            st.success("Profile saved successfully!")
            # Update current_profile reference for preview immediately after save
            current_profile = new_profile 
        except Exception as e:
            st.error(f"Error saving profile: {e}")

# Live Preview Section
st.divider()
st.subheader("Live Preview")
if st.checkbox("Show Preview"):
    from preview_utils import render_profile_preview
    # Use current form values to reconstruct object for preview? 
    # Or just use the loaded/saved object? 
    # Use current_profile (which is either loaded or just saved)
    render_profile_preview(current_profile)
