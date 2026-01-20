import streamlit as st
from data_manager import ProfessorProfile, NewsItem, Publication, Person, LabInfo, Project
from typing import List

# Simple CSS to mimic the "clean academic" look
PREVIEW_CSS = """
<style>
.preview-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
}
.preview-header {
    font-size: 24px;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 10px;
}
.preview-sub {
    font-size: 18px;
    color: #666;
    margin-bottom: 20px;
}
.preview-body {
    line-height: 1.6;
}
.preview-tag {
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    margin-right: 5px;
}
</style>
"""

def inject_preview_css():
    st.markdown(PREVIEW_CSS, unsafe_allow_html=True)

def render_profile_preview(p: ProfessorProfile):
    inject_preview_css()
    st.markdown(f"""
    <div class="preview-container">
        <div class="preview-header">{p.name}</div>
        <div class="preview-sub">{p.title} | {p.affiliation}</div>
        <div class="preview-body">
            <p><strong>Email:</strong> {p.email}</p>
            <p><strong>Bio:</strong> {p.bio_short}</p>
            <hr>
            <p>{p.bio_long}</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_news_preview(news: NewsItem):
    inject_preview_css()
    st.markdown(f"""
    <div class="preview-container">
        <div class="preview-header">{news.title}</div>
        <div class="preview-sub">{news.publish_date} {'(Featured)' if news.featured else ''}</div>
        <div class="preview-body">
            {news.content}
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_publications_preview(pubs: List[Publication]):
    inject_preview_css()
    st.markdown('<div class="preview-container">', unsafe_allow_html=True)
    for p in pubs:
        tags_html = "".join([f'<span class="preview-tag">{t}</span>' for t in p.tags])
        st.markdown(f"""
        <div style="margin-bottom: 15px;">
            <strong>{p.title}</strong><br>
            {p.authors} ({p.year})<br>
            <em>{p.venue}</em><br>
            {tags_html}
        </div>
        """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
