import os
from config import constants
from models.schemas import User
from dotenv import load_dotenv
load_dotenv()
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.utils import get_openapi
from fastapi import Depends
import re

def save_uploaded_file(uploaded_file, namespace_id):
    upload_dir: str = os.path.join(constants.UPLOAD_DIR, namespace_id, constants.PRIMARY_FOLDER)

   # Create directories if they don't exist
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, uploaded_file.filename)
    with open(file_path, "wb") as f:
        f.write(uploaded_file.file.read())
    return file_path


def create_super_admin():
    # Check if super admin already exists
    user = User.objects(role="SUPER_ADMIN").first()
    if user: 
        return
    else:
        superUser = User(**constants.SUPER_ADMIN_DATA)
        superUser.save()
        print("Super admin created successfully.")
        return
    
bearer_scheme = HTTPBearer()

def get_current_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    return credentials.credentials    


_JAVA_HINTS_RE = re.compile(
    r"\b("
    r"java|jdk|jre|jvm|javac|jar|javadoc|bytecode|"
    r"spring|springboot|hibernate|jpa|jdbc|servlet|jsp|"
    r"maven|gradle|junit|mockito|lombok|"
    r"package|import|class|interface|extends|implements|"
    r"public|private|protected|static|final|abstract|"
    r"void|int|long|double|float|boolean|char|string|"
    r"arraylist|linkedlist|hashmap|hashset|treemap|treeset|"
    r"collections|streams?|optional|lambda|functionalinterface|"
    r"thread|synchronized|volatile|executor|completablefuture|"
    r"exception|try|catch|finally|throws|"
    r"serialization|generics?|annotations?|"
    r"oop|encapsulation|polymorphism|inheritance|"
    r"api|rest|microservices?"
    r")\b",
    re.IGNORECASE,
)

_NON_JAVA_HINTS_RE = re.compile(
    r"\b("
    r"python|py|javascript|typescript|node|react|vue|angular|"
    r"c\+\+|cpp|c#|dotnet|go|golang|rust|ruby|php|swift|kotlin|"
    r"tuples?|list comprehension|pandas|numpy|django|flask"
    r")\b",
    re.IGNORECASE,
)


def is_java_related_query(text: str) -> bool:
    """
    Conservative Java-only guard:
    - Allow if the user explicitly mentions Java or common Java ecosystem terms.
    - Block if the user explicitly mentions another language/topic (e.g., Python/tuples).
    """
    if not text:
        return False
    t = text.strip()
    if not t:
        return False

    # If user clearly asks about other ecosystems/topics, treat as non-Java
    if _NON_JAVA_HINTS_RE.search(t) and not re.search(r"\bjava\b", t, re.IGNORECASE):
        return False

    return bool(_JAVA_HINTS_RE.search(t))
