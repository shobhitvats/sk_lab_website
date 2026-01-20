import streamlit as st
from data_manager import DataLayer, Person
from auth import check_password

if not check_password():
    st.stop()

st.title("👥 People")

db = DataLayer()
people = db.get_people()

# --- Actions ---

# Helper to save
def save_person(person: Person, index: int = -1):
    if index >= 0:
        people[index] = person
    else:
        people.append(person)
    db.save_people(people)
    st.success("Saved successfully!")
    st.rerun()

def delete_person(index: int):
    people.pop(index)
    db.save_people(people)
    st.success("Deleted successfully!")
    st.rerun()
    st.rerun()

def move_up(index: int):
    if index > 0:
        people[index], people[index-1] = people[index-1], people[index]
        db.save_people(people)
        st.rerun()

def move_down(index: int):
    if index < len(people) - 1:
        people[index], people[index+1] = people[index+1], people[index]
        db.save_people(people)
        st.rerun()

tab_list, tab_add, tab_bulk = st.tabs(["View / Edit", "Add New", "Bulk Edit (Spreadsheet)"])

with tab_bulk:
    st.header("Bulk Edit People")
    st.info("Edit your team roster as a spreadsheet.")
    
    data = [p.dict() for p in people]
    edited_data = st.data_editor(data, num_rows="dynamic", use_container_width=True, key="people_editor")
    
    if st.button("Save All Bulk Changes"):
        try:
            new_people = [Person(**item) for item in edited_data]
            db.save_people(new_people)
            st.success(f"Saved {len(new_people)} people!")
            st.rerun()
        except Exception as e:
            st.error(f"Error saving: {e}")

# --- UI ---

st.header("Manage Team")
# tab_list, tab_add defined earlier


with tab_add:
    st.subheader("Add New Person")
    with st.form("add_person_form"):
        new_name = st.text_input("Name")
        new_role = st.selectbox("Role", ["PhD Student", "MS Student", "Postdoc", "RA", "Alumni", "PI", "Staff"])
        new_bio = st.text_area("Bio")
        # Image Uploader
        from upload_utils import image_uploader_widget
        new_photo = image_uploader_widget("Photo", key="new_person_photo")
        c1, c2 = st.columns(2)
        new_start = c1.number_input("Start Year", min_value=1900, max_value=2100, step=1, value=2024)
        new_end = c2.number_input("End Year (Optional)", min_value=1900, max_value=2100, step=1, value=None)
        new_website = st.text_input("Personal Website")

        submitted_add = st.form_submit_button("Add Person")
        if submitted_add:
            if not new_name:
                st.error("Name is required")
            else:
                p = Person(
                    name=new_name,
                    role=new_role,
                    bio=new_bio,
                    photo=new_photo if new_photo else None,
                    start_year=new_start,
                    end_year=int(new_end) if new_end else None,
                    personal_website=new_website if new_website else None
                )
                save_person(p)

with tab_list:
    # Filter Controls
    c_search, c_filter = st.columns([3, 1])
    search_term = c_search.text_input("Search People", placeholder="Name or Role...")
    show_alumni = c_filter.checkbox("Show Alumni", value=False)
    
    # Filter Logic
    filtered_people = []
    for i, p in enumerate(people):
        # 1. Search
        if search_term:
            if search_term.lower() not in p.name.lower() and search_term.lower() not in p.role.lower():
                continue
        
        # 2. Archive Filter
        if not show_alumni:
            if p.role == "Alumni":
                continue
                
        filtered_people.append((i, p))
        
    if not filtered_people:
        st.info("No people found matching criteria.")
    else:
        st.write(f"Showing {len(filtered_people)} people")
        for original_idx, person in filtered_people:
            with st.expander(f"{person.name} ({person.role})"):
                with st.form(f"edit_person_{i}"):
                    e_name = st.text_input("Name", value=person.name)
                    e_role = st.selectbox("Role", ["PhD Student", "MS Student", "Postdoc", "RA", "Alumni", "PI", "Staff"], index=["PhD Student", "MS Student", "Postdoc", "RA", "Alumni", "PI", "Staff"].index(person.role) if person.role in ["PhD Student", "MS Student", "Postdoc", "RA", "Alumni", "PI", "Staff"] else 0)
                    e_bio = st.text_area("Bio", value=person.bio)
                    
                    from upload_utils import image_uploader_widget
                    e_photo = image_uploader_widget("Photo", current_path=person.photo, key=f"edit_photo_{i}")
                    ec1, ec2 = st.columns(2)
                    e_start = ec1.number_input("Start Year", value=person.start_year)
                    # Handle optional end year gracefully for number_input which expects numbers
                    e_end_val = person.end_year if person.end_year else 0
                    e_end = ec2.number_input("End Year (0 = None)", value=e_end_val)
                    e_end_val = person.end_year if person.end_year else 0
                    e_end = ec2.number_input("End Year (0 = None)", value=e_end_val)
                    e_website = st.text_input("Personal Website", value=str(person.personal_website) if person.personal_website else "")
                    
                    e_visible = st.toggle("Published (Visible on Website)", value=person.visible)
                    if not e_visible:
                        st.caption("🚫 This person is hidden from the public website.")

                    c_save, c_del = st.columns([1, 4])
                    saved = c_save.form_submit_button("Update")
                    
                    if saved:
                        p = Person(
                            name=e_name,
                            role=e_role,
                            bio=e_bio,
                            photo=e_photo if e_photo else None,
                            start_year=e_start,
                            end_year=int(e_end) if e_end > 0 else None,
                            personal_website=e_website if e_website else None,
                            visible=e_visible
                        )
                        save_person(p, i)
                
                # Delete button outside form to avoid form submission issues or use a separate small form
                c_del, c_up, c_down = st.columns([2, 1, 1])
                if c_del.button(f"Delete {person.name}", key=f"del_{i}"):
                     delete_person(i)
                
                if i > 0:
                     if c_up.button("⬆️", key=f"up_{i}", help="Move Up"):
                         move_up(i)
                
                if i < len(people) - 1:
                     if c_down.button("⬇️", key=f"down_{i}", help="Move Down"):
                         move_down(i)
