from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader,TextLoader
from langchain_community.document_loaders import PyPDFLoader
import re

def parse_pdf(file_path: str) -> list:
    # loader = PyPDFLoader(file_path)
    # documents = loader.load()
    # file_name = file_path.split("\\")[-1]
    # text_splitter = RecursiveCharacterTextSplitter(
    #     chunk_size=700, chunk_overlap=100, separators=["\n", " ", ""])
    # docs = text_splitter.split_documents(documents)
    

    # for idx, text in enumerate(docs):
    #             docs[idx].metadata['name']=file_name
    #             docs[idx].metadata['type']='pdf'

    # print(f"\t Total documents created: {len(docs)}",docs)
    # return docs
    
    loader = PyMuPDFLoader(file_path)
    documents = loader.load() 
    file_name = re.search(r'[^/]+$', file_path).group(0)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""])
    docs = text_splitter.split_documents(documents) 
    for idx, text in enumerate(docs):
                docs[idx].metadata['name']=file_name
                docs[idx].metadata['type']='pdf'

    # print(f"\t Total documents created: {len(docs)}",docs)
    return docs

def parse_text(file_path: str) -> list:
    file_data = open(file_path, 'r', encoding='utf-8')
    file_content = file_data.read()
    # print(f"\t Reading a file: {file_path}\n\t Length of the File: {len(file_content)}")
    file_name = file_path.split("\\")[-1]
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100,
        length_function=len
    )
    docs = text_splitter.create_documents([file_content]) 
    
    for idx, text in enumerate(docs):
                docs[idx].metadata['name']=file_name
                docs[idx].metadata['type']='txt'

    # print(f"\t Total documents created: {len(docs)}")
    return docs
 

# def parse_text(file_path: str) -> list:
    # Reading the text file
    with open(file_path, 'r', encoding='utf-8') as file_data:
        file_content = file_data.read()

    print(f"\t Reading a file: {file_path}\n\t Length of the File: {len(file_content)}")
    
    # Extract file name from the file path
    file_name = re.search(r'[^/\\]+$', file_path).group(0)
    
    # Initialize the text splitter with the desired chunk size and overlap
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,  # Adjust this based on your desired chunk size
        chunk_overlap=100, 
        length_function=len
    )
    
    # Split the content into smaller chunks (documents)
    docs = text_splitter.create_documents([file_content])  # Wrap the content in a list
    
    # Add metadata for each document chunk
    for idx, text in enumerate(docs):
        docs[idx].metadata['name'] = file_name
        docs[idx].metadata['type'] = 'txt'
        docs[idx].metadata['page'] = idx + 1  # Assign a unique page number to each chunk
        docs[idx].metadata['total_pages'] = len(docs)
    
    print(f"\t Total documents created: {len(docs)}")
    
    # Return the documents (chunks)
    return docs