import logging
from fastapi import APIRouter, HTTPException
from app.models.request_models import GenerateRequest, GenerateResponse, AnalyzeStatsRequest, AnalyzeStatsResponse
from app.services.azure_ai import ai_service
from app.services.stats_agent import stats_agent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_response(request: GenerateRequest):
    """
    Generate a response using the specified AI model
    """
    try:
        logger.info(f"Received request for model: {request.model}")
        logger.info(f"Request parameters: {request.parameters}")
        
        result = await ai_service.generate(
            model=request.model,
            prompt=request.prompt,
            parameters=request.parameters
        )
        
        logger.info("Successfully generated response")
        return GenerateResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/analyze-stats", response_model=AnalyzeStatsResponse)
async def analyze_stats(request: AnalyzeStatsRequest):
    """
    Analyze model statistics using the AI Stats Analyst Agent
    """
    try:
        logger.info("Received stats analysis request")
        logger.info(f"Stats data: {request.stats_data}")
        
        if not stats_agent.agent_id:
            raise HTTPException(
                status_code=503,
                detail="Stats Analyst Agent not configured. Please set AZURE_AI_PROJECT_CONNECTION_STRING in environment."
            )
        
        analysis = stats_agent.analyze_stats(
            stats_data=request.stats_data,
            user_question=request.question
        )
        
        logger.info("Successfully generated stats analysis")
        return AnalyzeStatsResponse(
            analysis=analysis,
            agent_id=stats_agent.agent_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze stats: {str(e)}"
        )