# SolitaAgentTest

Hej Solita teamet. 

Jag valde att skapa en agent som hittar barer i Stockholm. 
Vectordatabasen är en lokal Postgres - pgvector fylld med 100 AI-genererade barer.
Använde mig av LangChain Agent, modellen är Ollama 3.1 (också lokal)

Installera Node 20+, Docker och Ollama

För att starta upp den:

$ make install

$ npm start

Sen kan allt hittas på http://localhost:3000/docs