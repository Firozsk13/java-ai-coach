## 🚀 Server Starter Steps

Follow the steps below to set up and start your FastAPI server properly:

---

### **1️Check / Install Python 3.11**
Ensure that **Python 3.11** is installed on your system.  
You can verify the version by running:

```bash

python3 --version

```

### ** 2 Create a Virtual Environment
   - python3.11 -m venv venv


### ** 3 Activate the Virtual Environment

   - For macOS / Linux :-
    source venv/bin/activate  

   - For Windows (PowerShell) :-
    .venv\Scripts\Activate.ps1 


### ** 4 Install Project Dependencies  

    pip install -r requirements.txt

### ** 5 ENV Setup

    - Create file with name `.env` at root level   
    - Copy content from `.env.example` to `.env` file

### ** 6 Pinecone Setup

    - Refer to the Pinecone Setup section below.

    - After completing that setup, update the following keys in your .env file:    

    ```bash

    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_ENV=your_pinecone_environment
    PINECONE_INDEX=your_pinecone_index_name

    ```

### ** 7 Mistral AI Setup

    - Refer to the Mistral AI Setup section below.

    - After completing that setup, update the following key in your .env file:

    ```bash

    MISTRAL_API_KEY=your_mistral_api_key

    ```

### ** 8 MongoDB Setup

    - Before running the server, refer to the provided video to set up MongoDB.

    - Add the MongoDB connection string to your .env file :

    ```bash

    MONGODB_URL="your_mongodb_connection_string"

    ```

### ** 9 Run the FastAPI Server   

    uvicorn app:app --reload --port 9000


### ** 10 Open in Browser

    Once the server starts successfully, open your browser and go to:

    👉 http://127.0.0.1:9000/docs

    This will open the Swagger UI, where you can interact with all available APIs.

---    




### 🧠 Pinecone Setup

1. Go to [https://app.pinecone.io](https://app.pinecone.io) and create an account.  
2. In the console, open **API Keys → Create API Key**, name it, and copy the key.  
3. Go to **Indexes → Create Index**:
   - Name: e.g., `semantic-search`  
   - Dimension: e.g., `1536`  
   - Metric: `cosine`  
   - Cloud: `AWS`  
   - Region: choose (`us-east-1`)  
4. Click **Create Index** and use the index name + API key in your code.



### Mistral AI Setup

1] Sign Up / Log In
    - Visit https://console.mistral.ai
    - to create an account or log in.

2] Create API Key
    - Navigate to API Keys in your workspace settings.
    - Click Create new key, assign a name, and click Create.
    - Copy the API key immediately; it won't be shown again.

#this is for test
 