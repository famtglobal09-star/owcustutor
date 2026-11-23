"""Role catalogue used by the public OWCUS resume examples pages."""

ROLE_GROUPS = {
    'AI, Machine Learning & Data Science': [
        'AI Engineer', 'AI Engineer Fresher', 'Generative AI Engineer', 'LLM Engineer',
        'RAG Developer', 'Prompt Engineer', 'Machine Learning Engineer', 'Deep Learning Engineer',
        'NLP Engineer', 'Computer Vision Engineer', 'AI Agent Developer', 'AI Research Scientist',
        'Data Scientist', 'Data Scientist Fresher', 'Data Analyst', 'Data Engineer',
        'Business Intelligence Analyst', 'Power BI Developer', 'Tableau Developer', 'MLOps Engineer',
    ],
    'Digital Marketing, DV360 & Advertising Technology': [
        'DV360 Campaign Manager', 'DV360 Campaign Specialist', 'DV360 Specialist',
        'Programmatic Advertising Specialist', 'Programmatic Campaign Manager', 'Programmatic Trader',
        'Google Ads Specialist', 'Google Ads Campaign Manager', 'PPC Specialist', 'Paid Search Specialist',
        'Paid Media Manager', 'Digital Marketing Executive', 'Digital Marketing Specialist',
        'Digital Marketing Manager', 'Digital Marketing Fresher', 'SEO Specialist', 'SEO Executive',
        'SEO Manager', 'SEM Specialist', 'Social Media Manager', 'Social Media Marketing Specialist',
        'Performance Marketing Manager', 'Meta Ads Specialist', 'Google Campaign Manager 360',
        'Google Ad Manager Specialist', 'Ad Operations Specialist', 'Ad Operations Manager',
        'Media Planner', 'Media Buyer', 'Marketing Analyst', 'Marketing Automation Specialist',
        'Email Marketing Specialist', 'Content Marketing Manager', 'Affiliate Marketing Specialist',
    ],
    'Software Testing & QA Automation': [
        'Manual Testing Fresher', 'Manual Test Engineer', 'QA Engineer', 'QA Automation Engineer',
        'Selenium Automation Engineer', 'Playwright Automation Engineer', 'Cypress Automation Engineer',
        'SDET', 'API Testing Engineer', 'REST API Tester', 'Mobile Application Tester',
        'Performance Test Engineer', 'JMeter Performance Tester', 'Security Testing Engineer',
        'ETL Testing Engineer', 'Database Testing Engineer', 'Salesforce QA Engineer',
        'ServiceNow QA Engineer', 'Test Automation Architect', 'QA Lead', 'QA Manager',
    ],
    'Software Development & Programming': [
        'Java Developer', 'Java Developer Fresher', 'Python Developer', 'Python Developer Fresher',
        'JavaScript Developer', 'React Developer', 'Angular Developer', 'Node.js Developer',
        'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Django Developer',
        'Spring Boot Developer', '.NET Developer', 'C# Developer', 'PHP Developer', 'Laravel Developer',
        'Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Developer',
        'SQL Developer', 'Software Engineer Fresher', 'Senior Software Engineer', 'Software Architect',
    ],
    'Cloud, DevOps, Cybersecurity & IT': [
        'AWS Cloud Engineer', 'Azure Cloud Engineer', 'Google Cloud Engineer', 'DevOps Engineer',
        'DevOps Fresher', 'Kubernetes Engineer', 'Docker Engineer', 'Site Reliability Engineer',
        'Linux Administrator', 'System Administrator', 'Network Engineer', 'Cybersecurity Analyst',
        'SOC Analyst', 'Ethical Hacker', 'Penetration Tester', 'IT Support Engineer',
        'Technical Support Engineer', 'ServiceNow Developer', 'Salesforce Developer', 'SAP Consultant',
    ],
    'Business, Finance, HR, Sales & Management': [
        'Business Analyst', 'Product Manager', 'Project Manager', 'Scrum Master', 'Agile Coach',
        'HR Executive', 'HR Manager', 'IT Recruiter', 'Talent Acquisition Specialist', 'Accountant',
        'Accountant Fresher', 'Financial Analyst', 'Investment Analyst', 'Banking Executive',
        'Sales Executive', 'Sales Manager', 'Business Development Executive',
        'Customer Support Executive', 'Operations Manager',
    ],
    'Engineering, Design, Healthcare & Education': [
        'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Electronics Engineer',
        'Automobile Engineer', 'Embedded Systems Engineer', 'UI UX Designer', 'Graphic Designer',
        'Web Designer', 'Video Editor', 'Content Writer', 'Nurse', 'Pharmacist',
        'Medical Laboratory Technician', 'Teacher', 'School Teacher Fresher', 'Lecturer',
        'Research Assistant',
    ],
}


def slugify(value):
    return value.lower().replace('&', 'and').replace('#', 'sharp').replace('.net', 'dotnet').replace('.', '').replace(' ', '-').replace('--', '-')


ROLE_CATALOG = []
for category, titles in ROLE_GROUPS.items():
    for title in titles:
        ROLE_CATALOG.append({'title': title, 'slug': slugify(title), 'category': category})

# Match the requested SEO slug instead of exposing a redundant "google-" prefix.
for role in ROLE_CATALOG:
    if role['title'] == 'Google Campaign Manager 360':
        role['slug'] = 'campaign-manager-360-specialist'

ROLE_BY_SLUG = {role['slug']: role for role in ROLE_CATALOG}

EXPERIENCE_OPTIONS = [
    ('fresher', 'Fresher'), ('1-year-experience', '1 year'), ('2-years-experience', '2 years'),
    ('3-years-experience', '3 years'), ('5-years-experience', '5 years'),
    ('8-years-experience', '8 years'), ('10-plus-years-experience', '10+ years'),
]


def role_skills(title, category):
    text = f'{title} {category}'.lower()
    groups = [
        (('python', 'data scientist', 'machine learning', 'ai ', 'llm', 'rag', 'nlp'), ['Python', 'SQL', 'Machine Learning', 'Pandas', 'TensorFlow', 'Git']),
        (('java', 'spring'), ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'JUnit', 'Git']),
        (('javascript', 'react', 'angular', 'node', 'frontend', 'full stack'), ['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'REST APIs', 'Git']),
        (('qa', 'test', 'selenium', 'playwright', 'cypress', 'sdet'), ['Test Automation', 'Selenium', 'API Testing', 'SQL', 'CI/CD', 'Defect Tracking']),
        (('cloud', 'aws', 'azure', 'devops', 'kubernetes', 'docker', 'reliability'), ['Cloud Architecture', 'Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Monitoring']),
        (('marketing', 'seo', 'ads', 'media', 'dv360'), ['Campaign Strategy', 'Google Analytics', 'Paid Search', 'SEO', 'Reporting', 'A/B Testing']),
    ]
    for keywords, skills in groups:
        if any(keyword in text for keyword in keywords):
            return skills
    return ['Communication', 'Planning', 'Problem Solving', 'Documentation', 'Stakeholder Management', 'Microsoft Office']


def role_content(role, experience=''):
    title = role['title']
    role_name = title.lower()
    level = dict(EXPERIENCE_OPTIONS).get(experience, '')
    # Catalog titles that explicitly target entry-level candidates should use
    # the practical fresher path even when no experience query is supplied.
    is_fresher = level == 'Fresher' or 'fresher' in role_name or 'intern' in role_name
    if is_fresher:
        qualifier = ' as a fresher'
    elif level:
        qualifier = f' with {level.lower()} of experience'
    else:
        qualifier = ''
    skills = role_skills(title, role['category'])
    primary, secondary, tertiary = skills[:3]
    if is_fresher:
        responsibilities = [
            f'Completed an internship, academic project, or structured training assignment focused on {role_name} fundamentals.',
            f'Developed practical work using {primary}, {secondary}, and {tertiary} while following documented requirements and review steps.',
            f'Implemented a small {role_name} project from planning through testing, demonstration, and feedback revisions.',
            f'Created clear documentation covering setup, decisions, test evidence, and next steps for the {role_name} project.',
            f'Collaborated with mentors, classmates, or cross-functional partners to clarify requirements and resolve issues.',
            f'Practised {primary} and {secondary} through repeatable exercises, code reviews, test scenarios, or campaign simulations.',
            'Presented project outcomes, explained trade-offs, and responded to technical or process questions with evidence.',
            f'Optimized a training or project workflow by removing avoidable rework and applying structured quality checks.',
            'Improved project completion time by 20% through better task planning and reusable documentation.',
            f'Maintained a practical portfolio that demonstrates {role_name} skills, tools, communication, and continuous learning.',
        ]
    else:
        responsibilities = [
            f'Developed and delivered {role_name} solutions using {primary}, {secondary}, and {tertiary} against agreed requirements.',
            f'Implemented repeatable {role_name} workflows, standards, and review checkpoints to improve delivery quality.',
            f'Designed practical approaches for {role_name} work, balancing technical constraints, stakeholder needs, and measurable outcomes.',
            f'Managed priorities, dependencies, risks, and handoffs across {role_name} initiatives and cross-functional teams.',
            f'Optimized {role_name} processes by analyzing results, removing bottlenecks, and documenting reusable best practices.',
            f'Investigated issues involving {primary} and {secondary}, communicated root causes, and coordinated verified resolutions.',
            f'Produced role-specific documentation, dashboards, reports, or technical artifacts that helped teams make informed decisions.',
            f'Mentored colleagues or supported peer reviews covering {primary}, {secondary}, quality standards, and delivery expectations.',
            'Reduced avoidable rework by 30% by introducing measurable checks, clearer ownership, and follow-up reporting.',
            f'Partnered with stakeholders to define success metrics and translate {role_name} results into actionable improvements.',
        ]
    return {
        'summary': f'Results-driven {title}{qualifier} who has a practical record of delivering measurable outcomes, collaborating with cross-functional teams, and improving reliable day-to-day operations. This ATS-friendly example shows how to present relevant skills, achievements, projects, and responsibilities clearly.',
        'skills': skills,
        'examples': [
            {
                'name': 'Achievement-led example',
                'best_for': 'Candidates who can show measurable delivery, quality, efficiency, or business outcomes.',
                'summary': f'{title}{qualifier} who connects {skills[0]}, {skills[1]}, and role-specific decisions to measurable improvements for customers and teams.',
                'bullets': [
                    f'Improved a {title.lower()} workflow by applying {skills[0]} and documenting the resulting quality or delivery gain.',
                    'Prioritised the highest-impact work, communicated trade-offs, and reported outcomes with clear evidence.',
                ],
            },
            {
                'name': 'Project-led example',
                'best_for': 'Freshers and career changers who need to foreground practical projects, coursework, or portfolio work.',
                'summary': f'Practical {title} profile demonstrating {skills[2]} through a focused project, a repeatable process, and clear documentation of decisions.',
                'bullets': [
                    f'Built or supported a realistic project using {skills[0]}, {skills[1]}, and {skills[2]} to solve a defined problem.',
                    'Explained the approach, testing or review steps, and what would be improved in the next iteration.',
                ],
            },
        ],
        'responsibilities': responsibilities,
        'projects': [
            {'name': f'{title} Impact Project', 'description': f'Built a role-focused project that applied {skills[0]} and {skills[1]} to solve a realistic business problem, with documented results and a clear delivery process.'},
            {'name': 'Process Improvement Initiative', 'description': 'Identified a recurring bottleneck, introduced a measurable improvement, and documented the before-and-after outcome for future teams.'},
        ],
        'achievements': [
            'Improved delivery efficiency by 28% through clear prioritization and repeatable workflows.',
            'Reduced avoidable rework by 35% by introducing measurable quality checks and documentation.',
            'Presented concise status updates and recommendations to technical and business stakeholders.',
        ],
        'interview_tips': [
            f'Explain one project where you used {skills[0]} to solve a problem.',
            'Use the STAR structure: situation, task, action, and measurable result.',
            'Prepare a concise explanation of your tools, trade-offs, and quality checks.',
        ],
        'mistakes': [
            'Listing tools without showing what you achieved with them.',
            'Using the same generic summary for every application.',
            'Hiding measurable outcomes inside long paragraphs instead of action-oriented bullets.',
        ],
    }
