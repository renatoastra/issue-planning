FROM node:alpine as builder

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./package.json ./
RUN npm install --force
COPY --chown=node:node ./ ./

COPY . .

RUN npx prisma generate

ENV DATABASE_URL="postgresql://admin:postgres@duozada-db/duozada?schema=public"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhhY3QtbWFybGluLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_VALDwhTTaZ1rfdNJQwLOuiLh4SGewvkyvJM2b6mxjI
ENV NODE_ENV="production"
ENV PUBLIC_AWS_KEY=AKIATWLWLOJNS4ZGL3VX
ENV SECRET_AWS_KEY=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
ENV BASE_URL=https://issue-planning.vercel.app/
ENV S3_UPLOAD_REGION=sa-east-1
ENV VERCEL_URL=https://issue-planning.vercel.app/
ENV SOKETI_DEFAULT_APP_ID=issue-planing
ENV SOKETI_DEFAULT_APP_SECRET=6shiidf3t9im3loqx5u0uwrieaav7ak4
ENV SOKETI_DEFAULT_APP_KEY=z8hxd1e3kb69q2sql188vhsjk8yhgs7w

ENV NEXT_PUBLIC_SOKETI_CLUSTER=
ENV NEXT_PUBLIC_PUSHER_APP_KEY=z8hxd1e3kb69q2sql188vhsjk8yhgs7w
ENV NEXT_PUBLIC_PUSHER_KEY=z8hxd1e3kb69q2sql188vhsjk8yhgs7w
ENV NEXT_PUBLIC_SOKETI_URL=soketi-production-f9f5.up.railway.app
ENV NEXT_PUBLIC_SOKETI_PORT=6001
ENV SOKETI_DEBUG=1

RUN npm run build

FROM nginx
COPY --from=builder /home/node/app/.next /usr/share/nginx/html