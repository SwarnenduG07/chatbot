from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def helth_check():
    return "The helth check is ok"

@app.get("/api/v1/users")
async def get_users():
    return "The users are ok"
