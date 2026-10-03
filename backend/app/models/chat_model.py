from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str


class Source(BaseModel):
    page: int
    source: str


class AnswerResponse(BaseModel):
    answer: str
    sources: list[Source]

