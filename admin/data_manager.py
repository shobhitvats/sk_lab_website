import json
import os
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, HttpUrl, Field, ValidationError, field_validator

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# --- Pydantic Models ---

class ProfessorProfile(BaseModel):
    name: str
    title: str
    affiliation: str
    bio_short: str
    bio_long: str
    profile_photo: Optional[str] = None
    email: EmailStr
    google_scholar_url: Optional[HttpUrl] = None
    orcid: Optional[str] = None
    twitter_url: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None

class LabInfo(BaseModel):
    lab_name: str
    mission_statement: str
    research_focus_areas: List[str] = []
    lab_photo: Optional[str] = None
    join_lab_text: str
    seo_title: Optional[str] = "Research Lab"
    seo_description: Optional[str] = "A leading research group."
    seo_keywords: Optional[str] = "research, science, lab"

class Person(BaseModel):
    name: str
    role: str 
    bio: str
    photo: Optional[str] = None
    start_year: int
    end_year: Optional[int] = None
    personal_website: Optional[HttpUrl] = None
    email: Optional[EmailStr] = None
    visible: bool = True

class Publication(BaseModel):
    title: str
    authors: str 
    year: int
    venue: str
    abstract: str
    doi: Optional[str] = None
    pdf_link: Optional[str] = None
    code_link: Optional[str] = None
    bibtex: Optional[str] = None
    tags: List[str] = []
    visible: bool = True

    @field_validator('year')
    def year_must_be_realistic(cls, v):
        if v < 1900 or v > 2100:
            raise ValueError('Year must be between 1900 and 2100')
        return v
    
    @field_validator('doi')
    def doi_format(cls, v):
        if v and not v.strip():
            return None 
        if v and not v.startswith('10.'):
             raise ValueError('DOI must start with 10.')
        return v

class Project(BaseModel):
    title: str
    description: str
    status: str 
    related_publications: List[str] = [] 
    images: List[str] = []
    collaborators: List[str] = []
    funding_source: Optional[str] = None
    visible: bool = True

    @field_validator('status')
    def status_must_be_valid(cls, v):
        if v not in ["Ongoing", "Completed"]:
            raise ValueError('Status must be Ongoing or Completed')
        return v

class NewsItem(BaseModel):
    title: str
    content: str 
    publish_date: str 
    featured: bool = False
    visible: bool = True

    @field_validator('publish_date')
    def date_must_be_iso(cls, v):
        from datetime import date
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

# --- Data Layer ---

class DataLayer:
    def __init__(self):
        self.data_dir = DATA_DIR
        os.makedirs(self.data_dir, exist_ok=True)

    def _get_path(self, filename: str) -> str:
        return os.path.join(self.data_dir, filename)

    def _load_json(self, filename: str, default: Any):
        path = self._get_path(filename)
        if not os.path.exists(path):
            return default
        with open(path, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return default

    def _backup_json(self, filename: str, data: Any):
        """Creates a timestamped backup of the data."""
        from datetime import datetime
        history_dir = os.path.join(self.data_dir, "history", filename.split('.')[0])
        os.makedirs(history_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"{timestamp}_{filename}"
        backup_path = os.path.join(history_dir, backup_filename)
        
        with open(backup_path, "w") as f:
            json.dump(data, f, indent=2)

    def log_action(self, action: str, details: str):
        from datetime import datetime
        log_file = self._get_path("audit_log.json")
        logs = []
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                try:
                    logs = json.load(f)
                except:
                    pass
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "details": details
        }
        logs.insert(0, entry) # Prepend
        # Keep last 1000 logs
        logs = logs[:1000]
        
        with open(log_file, "w") as f:
            json.dump(logs, f, indent=2)

    def get_audit_logs(self):
        return self._load_json("audit_log.json", [])

    def _save_json(self, filename: str, data: Any):
        # First save the live file
        path = self._get_path(filename)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
            
        # Then create a backup
        try:
            self._backup_json(filename, data)
        except Exception as e:
            print(f"Backup failed: {e}")

    # --- Profile ---
    def get_profile(self) -> ProfessorProfile:
        data = self._load_json("profile.json", {})
        try:
            return ProfessorProfile(**data)
        except ValidationError:
             return ProfessorProfile(
                 name="", title="", affiliation="", bio_short="", bio_long="", email="user@example.com"
             )

    def save_profile(self, profile: ProfessorProfile):
        self._save_json("profile.json", profile.dict(exclude_none=True))
        self.log_action("UPDATE", "Updated Profile")

    # --- Lab Info ---
    def get_lab_info(self) -> LabInfo:
        data = self._load_json("lab_info.json", {})
        try:
            return LabInfo(**data)
        except ValidationError:
            return LabInfo(lab_name="", mission_statement="", join_lab_text="")

    def save_lab_info(self, info: LabInfo):
        self._save_json("lab_info.json", info.dict(exclude_none=True))
        self.log_action("UPDATE", "Updated Lab Info")

    # --- People ---
    def get_people(self) -> List[Person]:
        data = self._load_json("people.json", [])
        return [Person(**item) for item in data]

    def save_people(self, people: List[Person]):
        self._save_json("people.json", [p.dict(exclude_none=True) for p in people])
        self.log_action("UPDATE", f"Updated People List ({len(people)} entries)")

    # --- Publications ---
    def get_publications(self) -> List[Publication]:
        data = self._load_json("publications.json", [])
        return [Publication(**item) for item in data]

    def save_publications(self, pubs: List[Publication]):
        self._save_json("publications.json", [p.dict(exclude_none=True) for p in pubs])
        self.log_action("UPDATE", f"Updated Publications List ({len(pubs)} entries)")
    
    # --- Projects ---
    def get_projects(self) -> List[Project]:
        data = self._load_json("projects.json", [])
        return [Project(**item) for item in data]

    def save_projects(self, projects: List[Project]):
        self._save_json("projects.json", [p.dict(exclude_none=True) for p in projects])
        self.log_action("UPDATE", f"Updated Projects List ({len(projects)} entries)")

    # --- News ---
    def get_news(self) -> List[NewsItem]:
        data = self._load_json("news.json", [])
        return [NewsItem(**item) for item in data]

    def save_news(self, news: List[NewsItem]):
        self._save_json("news.json", [n.dict(exclude_none=True) for n in news])
        self.log_action("UPDATE", f"Updated News List ({len(news)} entries)")
