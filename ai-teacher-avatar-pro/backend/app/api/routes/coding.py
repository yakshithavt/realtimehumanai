from fastapi import APIRouter

@router.get("/languages")
async def get_programming_languages():
    """Get supported programming languages"""
    return {
        "success": True,
        "languages": [
            {
                "id": "python",
                "name": "Python",
                "difficulty": "beginner",
                "description": "Beginner-friendly language with simple syntax",
                "uses": ["Web development", "Data science", "AI/ML", "Automation"]
            },
            {
                "id": "javascript",
                "name": "JavaScript",
                "difficulty": "beginner",
                "description": "Language of the web, runs in browsers",
                "uses": ["Web development", "Frontend", "Node.js", "Mobile apps"]
            },
            {
                "id": "java",
                "name": "Java",
                "difficulty": "intermediate",
                "description": "Object-oriented language for enterprise applications",
                "uses": ["Android apps", "Enterprise software", "Web backends"]
            },
            {
                "id": "cpp",
                "name": "C++",
                "difficulty": "advanced",
                "description": "High-performance language for system programming",
                "uses": ["Game development", "Systems programming", "Embedded systems"]
            }
        ]
    }

@router.get("/exercises/{language}")
async def get_coding_exercises(language: str):
    """Get coding exercises for a specific language"""
    exercises = {
        "python": [
            {
                "id": "hello_world",
                "title": "Hello World",
                "difficulty": "beginner",
                "description": "Your first Python program",
                "starter_code": "# Write your first Python program\nprint('Hello, World!')",
                "solution": "print('Hello, World!')",
                "hints": ["Use the print() function", "Remember the quotes"]
            },
            {
                "id": "variables",
                "title": "Variables and Data Types",
                "difficulty": "beginner",
                "description": "Learn about variables and basic data types",
                "starter_code": "# Create variables\nname = \nage = ",
                "solution": "name = 'Student'\nage = 15",
                "hints": ["Strings use quotes", "Numbers don't need quotes"]
            }
        ],
        "javascript": [
            {
                "id": "hello_world",
                "title": "Hello World",
                "difficulty": "beginner",
                "description": "Your first JavaScript program",
                "starter_code": "// Write your first JavaScript program\nconsole.log('Hello, World!');",
                "solution": "console.log('Hello, World!');",
                "hints": ["Use console.log() to output", "Remember the semicolon"]
            }
        ]
    }
    
    language_exercises = exercises.get(language, [])
    return {
        "success": True,
        "language": language,
        "exercises": language_exercises
    }

router = APIRouter(prefix="/coding", tags=["Coding"])
