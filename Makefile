.PHONY: up down test test-e2e logs fresh build

up:
	./vendor/bin/sail up -d

down:
	./vendor/bin/sail down

test:
	./vendor/bin/sail artisan test --parallel

test-e2e:
	npx playwright test

test-e2e-ui:
	npx playwright test --ui

logs:
	./vendor/bin/sail logs -f laravel.test

fresh:
	./vendor/bin/sail artisan migrate:fresh --seed

build:
	./vendor/bin/sail npm run build && ./vendor/bin/sail artisan config:cache

server:
	./vendor/bin/sail npm run dev
