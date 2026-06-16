from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
import models
import schemas
from database import engine, SessionLocal
from datetime import datetime
import re

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig
)

from peft import PeftModel

import torch

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusAI API")

# -----------------------------------
# MODEL CONFIG
# -----------------------------------

MODEL_NAME = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
ADAPTER_PATH = "checkpoint-2109"

print("Loading model...")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

base_model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map={"": 0},
    torch_dtype=torch.float16
)

model = PeftModel.from_pretrained(
    base_model,
    ADAPTER_PATH
)

print("Model Ready!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def title_generate(user_prompt: str) -> str:

    prompt_lower = user_prompt.lower().strip()
    if len(prompt_lower.split()) <= 3:
        return user_prompt.title()
        
    # patterns - it checks these in order. if it finds a match, it stops and returns the title.
    patterns = [
        r"(?:safely|use|programmatically|register) (?:attempt to |try to )?(?:check|evaluate|calculate|extract|create|execute|select|find|determine) (?:if\s+|a\s+|an\s+|the\s+)?(.*?)(?:\s+before|\s+using|\s+by|\s+to|\s+in|$)",
        r"(?:add|enable|create|set up) (?:a\s+|an\s+|the\s+)?(.*?(?:constraint|simulation|physics|driver|keyframe|action|particle system|force field|shape key))",
        r"(?:set|change|configure|enable|toggle) (?:the\s+|a\s+)?(.*?(?:render|resolution|camera|viewport|shading|world|engine|pass|timeline|background|collection|layer))",
        r"(?:create|generate|build|set up|simulate|bpy|blender|python|code) (?:a\s+|an\s+)?(?:procedural\s+|basic\s+|highly\s+)?(.*? (?:material|shader|texture|effect|bsdf))",
        r"(?:apply|add|use|stack) (?:a\s+|an\s+)?(.*?(?:modifier|operation|node))",
        r"(?:mirror|twist|bend|transform|reduce|smooth|bevel|deform|parent|join|separate|delete|select|purge|pack|unpack|rename) (?:a\s+|an\s+|the\s+|all\s+)?(.*?(?:mesh|object|cube|sphere|cylinder|plane|curve|vertices|faces|edges|bones|collection|data blocks|slots))",
        r"(?:generate|create|spawn|construct|build|import|export) (?:a\s+|an\s+)?(?:procedural\s+|basic\s+|complex\s+|simple\s+|new\s+)?(.*?)(?:\s+using|\s+by|\s+with|\s+on|\s+from|\s+that|\s+where|\s+consisting|$)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, prompt_lower)
        if match:
            # grab the captured text and strip away any trailing punctuation
            captured_text = match.group(1).strip(".,;")
            # clean up the string and limit it to a maximum of 4 words 
            words = captured_text.split()
            clean_title = " ".join(words[:4]).title()
            return clean_title
    return " ".join(user_prompt.split()[:3]).title() + "..."


# model selector - edit below function if adding new model 
def call_llm_model(model_name: str, prompt: str) -> str:

    formatted_prompt = f"""### Instruction:
{prompt}

### Response:
"""

    inputs = tokenizer(
        formatted_prompt,
        return_tensors="pt"
    ).to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=120,
        temperature=0.1,
        do_sample=False,
        repetition_penalty=1.2
    )

    response = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    response = response.replace(
        formatted_prompt,
        ""
    ).strip()

    return response



@app.post("/api/chat", response_model=schemas.ConversationResponse)
def generate_chat(chat_req: schemas.ChatInput, db: Session = Depends(get_db)):
    
    # we assign id for the new chat 
    conv_id = chat_req.conversation_id
    if not conv_id:
        conv_id = str(uuid.uuid4())
        
        title1 = title_generate(chat_req.prompt)
        conversation = models.Conversation(id=conv_id, title=title1)
        db.add(conversation)
        db.commit()
    else:
        # if we continue to chat in the previous chat, date and time will be changed to the current time 
        conversation = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Chat session not found")
        conversation.created_at = datetime.utcnow()
    
    user_msg = models.Message(conversation_id=conv_id, role="user", content=chat_req.prompt)
    db.add(user_msg)
    
    #pass the model name from the model selector in the UI
    llm_output_script = call_llm_model(
        model_name=chat_req.model_name, 
        prompt=chat_req.prompt
    )
    
    #save selected models output string to postgreSQL
    model_msg = models.Message(conversation_id=conv_id, role="model", content=llm_output_script)
    db.add(model_msg)
    db.commit()
    
    #fetch updated conversation to return
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conv_id).first()
    return conversation

@app.get("/api/chats")
def get_all_chats(db: Session = Depends(get_db)):
    chats = db.query(models.Conversation).order_by(models.Conversation.created_at.desc()).all()
    return [
        {
            "id": c.id, 
            "title": c.title, 
            "created_at": f"{c.created_at.isoformat()}Z" if c.created_at else None
        } 
        for c in chats
    ]

@app.get("/api/chats/{conversation_id}", response_model=schemas.ConversationResponse)
def get_chat_history(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Chat not found")
    return conversation


