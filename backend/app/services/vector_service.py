
import os

from dotenv import load_dotenv
from langchain_openai import AzureOpenAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()


def create_vector_store(chunks, source="unknown.pdf"):

    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
    )

    texts = [chunk["text"] for chunk in chunks]

    metadatas = [
        {
            "page": chunk["page"],
            "source": source
        }
        for chunk in chunks
    ]

    vector_store = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory="chroma_db"
    )

    return vector_store


def search_documents(vector_store, query, k=3):
    results = vector_store.similarity_search(query, k=k)
    return results


def get_vector_store():

    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
    )

    vector_store = Chroma(
        persist_directory="chroma_db",
        embedding_function=embeddings
    )

    return vector_store
