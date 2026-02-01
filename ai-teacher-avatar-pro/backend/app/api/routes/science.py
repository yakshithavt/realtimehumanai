from fastapi import APIRouter

@router.get("/experiments")
async def get_science_experiments():
    """Get available science experiments"""
    return {
        "success": True,
        "experiments": [
            {
                "id": "pendulum_motion",
                "name": "Simple Pendulum Motion",
                "subject": "physics",
                "difficulty": "beginner",
                "description": "Explore the relationship between length and period",
                "materials": ["String", "Weight", "Support stand", "Timer", "Ruler"],
                "safety_notes": ["Ensure secure attachment", "Keep away from breakable objects"]
            },
            {
                "id": "acid_base_reaction",
                "name": "Acid-Base Neutralization",
                "subject": "chemistry",
                "difficulty": "intermediate",
                "description": "Observe pH changes during neutralization",
                "materials": ["Hydrochloric acid", "Sodium hydroxide", "pH indicator", "Beaker"],
                "safety_notes": ["Wear safety goggles", "Work in ventilated area", "Handle acids carefully"]
            },
            {
                "id": "osmosis_potato",
                "name": "Osmosis in Potato Cells",
                "subject": "biology",
                "difficulty": "beginner",
                "description": "Demonstrate water movement across cell membranes",
                "materials": ["Potato", "Salt", "Water", "Knife", "Beakers"],
                "safety_notes": ["Handle knife with care", "Adult supervision required"]
            }
        ]
    }

@router.get("/subjects")
async def get_science_subjects():
    """Get available science subjects"""
    return {
        "success": True,
        "subjects": [
            {
                "id": "physics",
                "name": "Physics",
                "description": "Study of matter, energy, and their interactions",
                "topics": ["Mechanics", "Electricity", "Magnetism", "Optics", "Thermodynamics"]
            },
            {
                "id": "chemistry",
                "name": "Chemistry",
                "description": "Study of matter and its properties",
                "topics": ["Atoms", "Molecules", "Reactions", "Acids", "Bases", "Solutions"]
            },
            {
                "id": "biology",
                "name": "Biology",
                "description": "Study of living organisms",
                "topics": ["Cells", "Genetics", "Evolution", "Ecology", "Anatomy"]
            }
        ]
    }

router = APIRouter(prefix="/science", tags=["Science"])
