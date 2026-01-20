import os
import streamlit as st
from PIL import Image
import shutil

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web", "public", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(uploaded_file, old_path=None):
    """
    Saves an uploaded file to web/public/uploads and returns the relative path for Next.js.
    If old_path is provided, it tries to preserve the filename or clean up (optional).
    For now, simplicity: unique filename or overwrite if same name.
    """
    if uploaded_file is None:
        return None

    try:
        # Create a safe filename
        filename = uploaded_file.name.replace(" ", "_")
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save the file
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Return path relative to 'public' folder for Next.js (e.g., /uploads/image.jpg)
        return f"/uploads/{filename}"
    except Exception as e:
        st.error(f"Error saving file: {e}")
        return None

def image_uploader_widget(label, current_path=None, key=None):
    """
    Reusable widget for image uploads.
    Shows current image if exists.
    Returns the new path (str) if changed, current_path if not, or None if cleared.
    """
    st.subheader(label)
    
    # Show current image
    if current_path:
        # Construct full path to display in Streamlit
        # current_path is like "/uploads/img.jpg"
        # We need absolute path for st.image or local URL if serving?
        # Streamlit generic static serving is tricky, easier to open raw file if local.
        
        local_full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web", "public") + current_path
        if os.path.exists(local_full_path):
             st.image(local_full_path, caption="Current Image", width=200)
        else:
             st.warning(f"Constructed path not found: {local_full_path}")
             # If it's an external URL (legacy), try showing it directly
             if current_path.startswith("http"):
                  st.image(current_path, caption="Current Image (External)", width=200)

    uploaded = st.file_uploader(f"Upload new {label.lower()}", type=["jpg", "png", "jpeg", "webp"], key=key)
    
    if uploaded is not None:
        new_path = save_uploaded_file(uploaded)
        if new_path:
            st.success(f"Uploaded: {new_path}")
            return new_path
    
    return current_path
