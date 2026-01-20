import streamlit as st
from data_manager import DataLayer, Publication
from auth import check_password

if not check_password():
    st.stop()

st.title("📚 Publications")

db = DataLayer()
pubs = db.get_publications()

def save_pub(pub: Publication, index: int = -1):
    if index >= 0:
        pubs[index] = pub
    else:
        pubs.append(pub)
    db.save_publications(pubs)
    st.success("Publication saved!")
    st.rerun()

def delete_pub(index: int):
    pubs.pop(index)
    db.save_publications(pubs)
    st.success("Deleted!")
    st.rerun()

tab_list, tab_add, tab_import, tab_bulk = st.tabs(["View / Edit", "Add New", "Smart Import", "Bulk Edit (Spreadsheet)"])

# ... existing tabs ...

with tab_bulk:
    st.header("Bulk Edit Publications")
    st.info("Edit multiple rows at once. Changes are saved when you click 'Save Changes' at the bottom.")
    
    # Prepare data for editor
    # We convert the list of objects to a format suitable for data_editor (list of dicts)
    # But data_editor returns a changed dataframe/dict.
    
    # Simplest way: List of dicts
    # We need to ensure we can map back to original objects.
    
    # Let's use a standard list of dicts approach
    data = [p.dict() for p in pubs]
    
    edited_data = st.data_editor(data, num_rows="dynamic", use_container_width=True, key="pub_editor")
    
    if st.button("Save All Bulk Changes"):
        try:
            new_pubs = [Publication(**item) for item in edited_data]
            db.save_publications(new_pubs)
            st.success(f"Successfully saved {len(new_pubs)} publications!")
            st.rerun()
        except Exception as e:
            st.error(f"Error saving data: {e}")

def fetch_doi_metadata(doi_input):
    import requests
    # Clean DOI
    doi = doi_input.strip()
    if doi.startswith("https://doi.org/"):
        doi = doi.replace("https://doi.org/", "")
    
    # CrossRef API
    url = f"https://api.crossref.org/works/{doi}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()['message']
            
            # Extract fields
            title = data.get('title', [''])[0]
            
            authors_list = data.get('author', [])
            authors = ", ".join([f"{a.get('given', '')} {a.get('family', '')}" for a in authors_list])
            
            year = 2024
            if 'published-print' in data:
                year = data['published-print']['date-parts'][0][0]
            elif 'created' in data:
                year = data['created']['date-parts'][0][0]
                
            venue = data.get('container-title', [''])[0]
            
            return {
                "title": title,
                "authors": authors,
                "year": int(year),
                "venue": venue,
                "doi": doi,
                "tags": []
            }
        else:
            return None
    except Exception as e:
        st.error(f"Error fetching DOI: {e}")
        return None

with tab_import:
    st.header("Smart Import")
    
    st.markdown("### Option 1: Fetch via DOI")
    doi_input = st.text_input("Enter DOI (e.g. 10.1038/s41586...)", key="doi_import")
    if st.button("Fetch Metadata"):
        meta = fetch_doi_metadata(doi_input)
        if meta:
            st.session_state['import_meta'] = meta
            st.success("Found paper! Review below.")
        else:
            st.error("Could not find DOI.")
            
    if 'import_meta' in st.session_state:
        meta = st.session_state['import_meta']
        with st.form("import_doi_form"):
            i_title = st.text_input("Title", value=meta['title'])
            i_authors = st.text_input("Authors", value=meta['authors'])
            i_year = st.number_input("Year", value=meta['year'])
            i_venue = st.text_input("Venue", value=meta['venue'])
            i_doi = st.text_input("DOI", value=meta['doi'])
            
            if st.form_submit_button("Import This Paper"):
                p = Publication(
                    title=i_title, authors=i_authors, year=i_year, venue=i_venue,
                    abstract="", doi=i_doi, pdf_link=None, code_link=None, bibtex=None, tags=[]
                )
                save_pub(p)
                del st.session_state['import_meta']

    st.divider()
    
    st.markdown("### Option 2: Bulk BibTeX Upload")
    bib_file = st.file_uploader("Upload .bib file", type=["bib"])
    if bib_file:
        import bibtexparser
        try:
            bib_str = bib_file.getvalue().decode("utf-8")
            bib_db = bibtexparser.loads(bib_str)
            
            st.info(f"Found {len(bib_db.entries)} entries.")
            
            if st.button(f"Import {len(bib_db.entries)} Publications"):
                count = 0
                for entry in bib_db.entries:
                    # Map fields
                    title = entry.get('title', 'Unknown Title').replace('{', '').replace('}', '')
                    author = entry.get('author', 'Unknown Authors').replace('{', '').replace('}', '')
                    year = int(entry.get('year', 2024))
                    venue = entry.get('journal') or entry.get('booktitle') or "Unknown Venue"
                    venue = venue.replace('{', '').replace('}', '')
                    
                    p = Publication(
                        title=title,
                        authors=author,
                        year=year,
                        venue=venue,
                        abstract=entry.get('abstract', ''),
                        doi=entry.get('doi'),
                        bibtex=bib_str, # Store full bib? Or just this entry? Ideally just this entry but raw string is okay.
                        tags=["imported"]
                    )
                    pubs.append(p)
                    count += 1
                
                db.save_publications(pubs)
                st.success(f"Successfully imported {count} papers!")
                st.rerun()
                
        except Exception as e:
            st.error(f"Error parsing BibTeX: {e}")

with tab_add:
    st.subheader("Add Publication")
    with st.form("add_pub_form"):
        title = st.text_input("Title")
        authors = st.text_input("Authors")
        year = st.number_input("Year", min_value=1900, max_value=2100, value=2024)
        venue = st.text_input("Venue (Journal/Conf)")
        abstract = st.text_area("Abstract")
        doi = st.text_input("DOI")
        pdf = st.text_input("PDF Link")
        code = st.text_input("Code Link")
        bibtex = st.text_area("BibTeX Citation")
        tags = st.text_input("Tags (comma separated)")

        submitted = st.form_submit_button("Add Publication")
        if submitted:
            if not title:
                st.error("Title is required")
            else:
                tag_list = [t.strip() for t in tags.split(",") if t.strip()]
                p = Publication(
                    title=title, authors=authors, year=year, venue=venue, abstract=abstract,
                    doi=doi if doi else None, pdf_link=pdf if pdf else None,
                    code_link=code if code else None, bibtex=bibtex if bibtex else None, tags=tag_list
                )
                save_pub(p)

with tab_list:
    if not pubs:
        st.info("No publications.")
    else:
        # Preview All Button
        if st.checkbox("Show Preview of All Publications"):
            from preview_utils import render_publications_preview
            render_publications_preview(pubs)
        
        # Sort by year desc
        sorted_pubs = sorted(list(enumerate(pubs)), key=lambda x: x[1].year, reverse=True)
        
        for original_idx, pub in sorted_pubs:
            with st.expander(f"[{pub.year}] {pub.title}"):
                with st.form(f"edit_pub_{original_idx}"):
                    e_title = st.text_input("Title", value=pub.title)
                    e_authors = st.text_input("Authors", value=pub.authors)
                    e_year = st.number_input("Year", value=pub.year)
                    e_venue = st.text_input("Venue", value=pub.venue)
                    e_abstract = st.text_area("Abstract", value=pub.abstract)
                    e_doi = st.text_input("DOI", value=pub.doi or "")
                    e_pdf = st.text_input("PDF Link", value=pub.pdf_link or "")
                    e_code = st.text_input("Code Link", value=pub.code_link or "")
                    e_bibtex = st.text_area("BibTeX Citation", value=pub.bibtex or "")
                    e_bibtex = st.text_area("BibTeX Citation", value=pub.bibtex or "")
                    e_tags = st.text_input("Tags", value=", ".join(pub.tags))
                    
                    e_visible = st.toggle("Published", value=pub.visible)
                    if not e_visible:
                        st.caption("🚫 This publication is hidden.")

                    saved = st.form_submit_button("Update")
                    if saved:
                        tag_list = [t.strip() for t in e_tags.split(",") if t.strip()]
                        p = Publication(
                            title=e_title, authors=e_authors, year=e_year, venue=e_venue,
                            abstract=e_abstract, doi=e_doi if e_doi else None,
                            pdf_link=e_pdf if e_pdf else None, code_link=e_code if e_code else None,
                            bibtex=e_bibtex if e_bibtex else None,
                            tags=tag_list,
                            visible=e_visible
                        )
                        save_pub(p, original_idx)
                
                c_del, c_promote = st.columns([1, 1])
                with c_del:
                    if st.button(f"Delete '{pub.title[:20]}...'", key=f"del_pub_{original_idx}"):
                        delete_pub(original_idx)
                
                with c_promote:
                    if st.button(f"📢 Promote to News", key=f"prom_pub_{original_idx}"):
                        from data_manager import NewsItem
                        n_title = f"New Paper Published: {pub.title}"
                        n_content = f"We are excited to announce our new paper **{pub.title}** has been published in *{pub.venue}* ({pub.year}).\n\nAuthors: {pub.authors}\n\n[Read PDF]({pub.pdf_link or '#'}) | [DOI](https://doi.org/{pub.doi or ''})"
                        
                        from datetime import date
                        n = NewsItem(title=n_title, content=n_content, publish_date=date.today().isoformat(), featured=True)
                        db.save_news(db.get_news() + [n])
                        st.success("News Draft Created! Check the News tab.")
