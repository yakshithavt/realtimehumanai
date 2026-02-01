from fastapi import APIRouter

@router.get("/topics")
async def get_math_topics():
    """Get available mathematics topics"""
    return {
        "success": True,
        "topics": [
            {
                "id": "algebra_basics",
                "name": "Algebra Basics",
                "category": "algebra",
                "difficulty": "beginner",
                "description": "Variables, equations, and basic algebraic concepts"
            },
            {
                "id": "linear_equations",
                "name": "Linear Equations",
                "category": "algebra",
                "difficulty": "beginner",
                "description": "Solving linear equations with one variable"
            },
            {
                "id": "quadratic_equations",
                "name": "Quadratic Equations",
                "category": "algebra",
                "difficulty": "intermediate",
                "description": "Solving quadratic equations using factoring and formula"
            },
            {
                "id": "geometry_basics",
                "name": "Geometry Basics",
                "category": "geometry",
                "difficulty": "beginner",
                "description": "Basic geometric shapes, angles, and properties"
            },
            {
                "id": "calculus_limits",
                "name": "Calculus - Limits",
                "category": "calculus",
                "difficulty": "advanced",
                "description": "Understanding limits and continuity"
            }
        ]
    }

@router.get("/problems/{topic_id}")
async def get_math_problem(topic_id: str):
    """Get a specific math problem"""
    problems = {
        "linear_equations": {
            "equation": "2x + 5 = 13",
            "solution": "x = 4",
            "steps": [
                "Subtract 5 from both sides: 2x = 13 - 5",
                "Simplify: 2x = 8",
                "Divide both sides by 2: x = 8/2",
                "Final answer: x = 4"
            ]
        },
        "quadratic_equations": {
            "equation": "x² - 5x + 6 = 0",
            "solution": "x = 2 or x = 3",
            "steps": [
                "Factor the quadratic: (x - 2)(x - 3) = 0",
                "Set each factor to zero: x - 2 = 0 or x - 3 = 0",
                "Solve: x = 2 or x = 3"
            ]
        }
    }
    
    problem = problems.get(topic_id)
    if not problem:
        return {"success": False, "error": "Topic not found"}
    
    return {
        "success": True,
        "problem": problem
    }

router = APIRouter(prefix="/math", tags=["Mathematics"])
