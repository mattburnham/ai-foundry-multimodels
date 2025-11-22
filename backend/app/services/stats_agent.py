import logging
import json
from typing import Dict, Optional
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StatsAnalystAgent:
    """
    Manages the Azure AI Foundry Stats Analyst Agent with idempotent creation.
    The agent analyzes model performance statistics and provides insights.
    """
    
    def __init__(self):
        self.agent_id: Optional[str] = None
        self.project_client: Optional[AIProjectClient] = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the AI Project client and get or create the agent."""
        try:
            # Check if we have a saved agent ID
            if settings.STATS_AGENT_ID:
                self.agent_id = settings.STATS_AGENT_ID
                logger.info(f"Using existing agent ID: {self.agent_id}")
            
            # Initialize project client if we have connection string
            if settings.AZURE_AI_PROJECT_CONNECTION_STRING:
                try:
                    credential = DefaultAzureCredential(managed_identity_client_id=settings.MANAGED_IDENTITY_CLIENT_ID)
                    # Use the full connection string as the endpoint
                    # Format: https://[service].services.ai.azure.com/api/projects/[project-name]
                    project_endpoint = settings.AZURE_AI_PROJECT_CONNECTION_STRING
                    
                    logger.info(f"Using project endpoint: {project_endpoint}")
                    self.project_client = AIProjectClient(
                        endpoint=project_endpoint,
                        credential=credential
                    )
                    
                    logger.info("AI Project client initialized successfully")
                    
                    # If no agent ID, create one
                    if not self.agent_id:
                        self.agent_id = self._create_agent()
                except Exception as e:
                    logger.warning(f"Failed to initialize AI Project client: {str(e)}")
                    logger.info("Agent functionality will be disabled. Set AZURE_AI_PROJECT_CONNECTION_STRING to enable.")
                    self.project_client = None
                    self.agent_id = None
            else:
                logger.warning("AZURE_AI_PROJECT_CONNECTION_STRING not set. Agent functionality disabled.")
                
        except Exception as e:
            logger.error(f"Failed to initialize Stats Analyst Agent: {str(e)}")
            # Don't raise - allow app to start even if agent is not configured
            self.project_client = None
            self.agent_id = None
    
    def _create_agent(self) -> str:
        """Create a new agent with stats analysis capabilities."""
        try:
            logger.info("Creating new Stats Analyst Agent...")
            
            # Create agent with system instructions (simplified, no custom tools for now)
            agent = self.project_client.agents.create_agent(
                model=settings.MODEL_DEPLOYMENT_NAME,  # Using GPT-4 for best analysis
                name="stats-analyst-agent",
                instructions="""You are an expert AI model performance analyst. Your role is to analyze statistics from multiple AI models and provide actionable insights.

When analyzing statistics, focus on:
1. **Performance**: Response time, tokens per second
2. **Cost Efficiency**: Token usage patterns, cost per interaction
3. **Model Strengths**: Which model excels at which tasks
4. **Recommendations**: Suggest optimal model for different use cases

Key pricing context (approximate):
- GPT-4: Most expensive (~$0.03/1K input, $0.06/1K output)
- DeepSeek: Mid-range pricing, good for reasoning
- Phi-3: Most economical, good for simple tasks

Be concise, data-driven, and provide specific recommendations. Use percentages and comparisons.
Example: "GPT-4 is 25% faster but costs 3x more than Phi-3 for code generation tasks."
"""
            )
            
            logger.info(f"Agent created successfully with ID: {agent.id}")
            logger.warning(f"IMPORTANT: Add this to your .env file: STATS_AGENT_ID={agent.id}")
            
            return agent.id
            
        except Exception as e:
            logger.error(f"Failed to create agent: {str(e)}")
            raise
    
    def analyze_stats(self, stats_data: Dict, user_question: str = "Analyze these statistics and provide insights") -> str:
        """
        Send stats data to the agent and get analysis.
        
        Args:
            stats_data: Dictionary containing model statistics
            user_question: Optional specific question about the stats
            
        Returns:
            Agent's analysis as a string
        """
        if not self.project_client or not self.agent_id:
            return "Agent not configured. Please set AZURE_AI_PROJECT_CONNECTION_STRING in .env file."
        
        try:
            # Create a thread for this conversation
            thread = self.project_client.agents.threads.create()
            thread_id = thread.get("id") if isinstance(thread, dict) else getattr(thread, "id", None)
            
            logger.info(f"Created thread: {thread_id}")
            
            # Format stats into a readable message
            stats_summary = self._format_stats(stats_data)
            message_content = f"{user_question}\n\nStatistics:\n{stats_summary}"
            
            # Add message to thread
            self.project_client.agents.messages.create(
                thread_id=thread_id,
                role="user",
                content=message_content
            )
            
            logger.info("Starting agent run...")
            
            # Run the agent
            run = self.project_client.agents.runs.create_and_process(
                thread_id=thread_id,
                agent_id=self.agent_id
            )
            
            run_status = run.get("status") if isinstance(run, dict) else getattr(run, "status", "unknown")
            logger.info(f"Agent run completed with status: {run_status}")
            
            # Get the response messages
            messages = self.project_client.agents.messages.list(thread_id=thread_id, order="desc")
            messages_list = list(messages) if not isinstance(messages, list) else messages
            
            logger.info(f"Retrieved {len(messages_list)} messages")
            
            # Get the latest assistant message
            for message in messages_list:
                message_role = message.get("role") if isinstance(message, dict) else getattr(message, "role", None)
                message_content = message.get("content") if isinstance(message, dict) else getattr(message, "content", None)
                
                if message_role == "assistant" and message_content:
                    # Handle different content types
                    content_parts = []
                    
                    if isinstance(message_content, str):
                        content_parts.append(message_content)
                    elif isinstance(message_content, list):
                        for content_item in message_content:
                            if isinstance(content_item, dict):
                                if content_item.get("type") == "text":
                                    text_obj = content_item.get("text", {})
                                    if isinstance(text_obj, dict) and "value" in text_obj:
                                        content_parts.append(text_obj["value"])
                                    elif isinstance(text_obj, str):
                                        content_parts.append(text_obj)
                            elif hasattr(content_item, 'text') and content_item.text:
                                if hasattr(content_item.text, 'value'):
                                    content_parts.append(content_item.text.value)
                                else:
                                    content_parts.append(str(content_item.text))
                    
                    if content_parts:
                        result = "\n".join(content_parts)
                        logger.info(f"Generated analysis ({len(result)} characters)")
                        return result
            
            return "No response from agent."
            
        except Exception as e:
            logger.error(f"Error during agent analysis: {str(e)}", exc_info=True)
            return f"Error analyzing stats: {str(e)}"
    
    def _format_stats(self, stats_data: Dict) -> str:
        """Format stats data into a readable string for the agent."""
        try:
            formatted = []
            
            for model_id, stats in stats_data.items():
                avg_response_time = stats['totalResponseTime'] / stats['count']
                avg_tokens_per_sec = stats['totalTokensPerSecond'] / stats['count']
                avg_tokens = stats['totalTokens'] / stats['count']
                
                formatted.append(f"""
Model: {model_id}
- Interactions: {stats['count']}
- Avg Response Time: {avg_response_time:.2f}s
- Avg Tokens/Second: {avg_tokens_per_sec:.1f}
- Total Tokens: {stats['totalTokens']:,}
- Avg Tokens per Interaction: {avg_tokens:.0f}
- Prompt Tokens: {stats['totalPromptTokens']:,}
- Completion Tokens: {stats['totalCompletionTokens']:,}
""")
            
            return "\n".join(formatted)
            
        except Exception as e:
            logger.error(f"Error formatting stats: {str(e)}")
            return json.dumps(stats_data, indent=2)

# Create singleton instance
stats_agent = StatsAnalystAgent()
