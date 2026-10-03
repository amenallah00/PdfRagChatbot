import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION")
)

response = client.embeddings.create(
    model=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
    input="This is a test sentence for my PDF RAG chatbot."
)

embedding = response.data[0].embedding

print("Embedding generated successfully!")
print("Dimensions:", len(embedding))
print("First values:", embedding[:5])