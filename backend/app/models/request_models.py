from pydantic import BaseModel, Field
from typing import Optional, Dict

class GenerateRequest(BaseModel):
    model: str = Field(..., description="The model to use for generation")
    prompt: str = Field(..., description="The prompt to generate from")
    parameters: Optional[Dict] = Field(
        default=None,
        description="Optional model parameters like temperature, max_tokens, etc."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "model": "gpt4",
                "prompt": "Explain quantum computing in simple terms",
                "parameters": {
                    "temperature": 0.7,
                    "max_tokens": 800
                }
            }
        }

class GenerateResponse(BaseModel):
    response: str = Field(..., description="The generated response")
    model: str = Field(..., description="The model used for generation")
    prompt: str = Field(..., description="The original prompt")
    usage: Optional[Dict] = Field(
        default=None,
        description="Token usage information"
    )

class AnalyzeStatsRequest(BaseModel):
    stats_data: Dict = Field(..., description="Model statistics data")
    question: Optional[str] = Field(
        default="Analyze these statistics and provide insights on performance and cost efficiency",
        description="Optional specific question about the stats"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "stats_data": {
                    "gpt4": {
                        "count": 5,
                        "totalResponseTime": 12.5,
                        "totalTokensPerSecond": 125.5,
                        "totalTokens": 1500
                    }
                },
                "question": "Which model is most cost-effective?"
            }
        }

class AnalyzeStatsResponse(BaseModel):
    analysis: str = Field(..., description="Agent's analysis and insights")
    agent_id: str = Field(..., description="ID of the agent that performed the analysis")