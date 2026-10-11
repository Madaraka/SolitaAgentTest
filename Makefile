.PHONY: all install ollama

all: install

ollama:
	test -f .env || cp .example.env .env
	@set -a && . ./.env && set +a && \
	base_url="$${OLLAMA_BASE_URL:-http://localhost:11434}" && \
	if ! curl -sf "$$base_url/api/tags" >/dev/null; then \
		nohup ollama serve >/dev/null 2>&1 & \
		until curl -sf "$$base_url/api/tags" >/dev/null; do sleep 1; done; \
	fi
	ollama pull nomic-embed-text
	ollama pull llama3.1

install:
	npm install
	test -f .env || cp .example.env .env
	docker compose up -d --wait
	$(MAKE) ollama
	npm run ingest
