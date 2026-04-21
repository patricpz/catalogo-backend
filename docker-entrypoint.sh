#!/bin/sh
set -eu

echo "Aguardando banco (tentando sincronizar schema com Prisma)..."

attempt=1
max_attempts=10
until npx prisma db push; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Falha ao conectar ao PostgreSQL após ${max_attempts} tentativas."
    exit 1
  fi
  attempt=$((attempt + 1))
  echo "Banco ainda não pronto. Tentativa ${attempt}/${max_attempts} em 2s..."
  sleep 2
done

echo "Iniciando API..."
node dist/server.js

