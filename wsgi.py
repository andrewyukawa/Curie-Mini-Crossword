from app import app

# This handler is for Vercel serverless deployment
handler = app

# This is only used when running locally
if __name__ == "__main__":
    app.run() 