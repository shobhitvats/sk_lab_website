import streamlit as st
from data_manager import DataLayer, NewsItem
from auth import check_password
from datetime import date

if not check_password():
    st.stop()

st.title("📰 News")

db = DataLayer()
news = db.get_news()

def save_news(item: NewsItem, index: int = -1):
    if index >= 0:
        news[index] = item
    else:
        news.append(item)
    db.save_news(news)
    st.success("News item saved!")
    st.rerun()

def delete_news(index: int):
    news.pop(index)
    db.save_news(news)
    st.success("Deleted!")
    st.rerun()

tab_list, tab_add = st.tabs(["View / Edit", "Add New"])

with tab_add:
    st.subheader("Add News")
    with st.form("add_news_form"):
        title = st.text_input("Title")
        
        # Use st.date_input but convert to string for JSON storage
        d = st.date_input("Date", value=date.today())
        
        c_edit, c_view = st.columns(2)
        with c_edit:
             content = st.text_area("Content (Markdown supported)", height=300, key="new_content")
        with c_view:
             st.markdown("### Preview")
             if content:
                 st.markdown(content)
             else:
                 st.info("Preview will appear here.")
        
        featured = st.checkbox("Featured?")

        submitted = st.form_submit_button("Add News")
        if submitted:
            if not title:
                st.error("Title is required")
            else:
                n = NewsItem(
                    title=title, content=content,
                    publish_date=d.isoformat(),
                    featured=featured
                )
                save_news(n)

with tab_list:
    if not news:
        st.info("No news items.")
    else:
        # Sort by date desc
        sorted_news = sorted(list(enumerate(news)), key=lambda x: x[1].publish_date, reverse=True)

        for original_idx, item in sorted_news:
            with st.expander(f"{item.publish_date} - {item.title}"):
                with st.form(f"edit_news_{original_idx}"):
                    e_title = st.text_input("Title", value=item.title)
                    
                    # Parse date string back to date object
                    try:
                        e_date_val = date.fromisoformat(item.publish_date)
                    except ValueError:
                        e_date_val = date.today()
                    
                    e_date = st.date_input("Date", value=e_date_val)
                    
                    ec_edit, ec_view = st.columns(2)
                    with ec_edit:
                        e_content = st.text_area("Content", value=item.content, height=300)
                    with ec_view:
                        st.markdown("### Preview")
                        if e_content:
                            st.markdown(e_content)
                    
                    e_featured = st.checkbox("Featured?", value=item.featured)

                    saved = st.form_submit_button("Update")
                    if saved:
                        n = NewsItem(
                            title=e_title,
                            content=e_content,
                            publish_date=e_date.isoformat(),
                            featured=e_featured
                        )
                        save_news(n, original_idx)
                
                if st.button(f"Delete '{item.title}'", key=f"del_news_{original_idx}"):
                    delete_news(original_idx)
