import re

def parse_signature(email_body: str) -> dict:
    """
    Extracts phone, email, linkedin, title, and company from an email body using regex.
    """
    results = {}
    
    # Phone number regex: supports (555) 867-5309, 555-867-5309, +1 555 867 5309
    phone_pattern = r'(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}'
    phone_match = re.search(phone_pattern, email_body)
    if phone_match:
        results['phone'] = phone_match.group(0).strip()
        
    # Email regex: standard pattern
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_match = re.search(email_pattern, email_body)
    if email_match:
        results['email'] = email_match.group(0).strip()
        
    # LinkedIn regex: linkedin.com/in/username
    linkedin_pattern = r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+'
    linkedin_match = re.search(linkedin_pattern, email_body)
    if linkedin_match:
        url = linkedin_match.group(0)
        if not url.startswith('http'):
            url = 'https://' + url
        results['linkedin'] = url
        
    # Title and Company regex: matches patterns like "VP of Operations | Acme Corp" or "Director @ TechFlow"
    # Looking for common separator patterns in signatures
    title_company_pattern = r'^([^|\n@]+)\s*[|@–-]\s*([^|\n]+)$'
    for line in email_body.splitlines():
        match = re.search(title_company_pattern, line.strip())
        if match:
            results['title'] = match.group(1).strip()
            results['company'] = match.group(2).strip()
            break
            
    return results
