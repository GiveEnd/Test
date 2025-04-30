# Тестовое приложение

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev

# Сборка для продакшена
npm run build

# Проверка линтером
npm run lint
```

## Развертывание на GitHub Pages

1. Убедитесь, что у вас есть репозиторий на GitHub
2. Настройте GitHub Pages в настройках репозитория:
   - Перейдите в Settings > Pages
   - В разделе "Source" выберите "GitHub Actions"
3. При пуше в ветку `main` будет автоматически запускаться процесс деплоя
4. После успешного деплоя приложение будет доступно по адресу: `https://<username>.github.io/test/`

## Структура проекта

```
├── public/          # Статические файлы
├── src/            # Исходный код
│   ├── assets/     # Ресурсы (изображения, стили)
│   ├── components/ # Vue компоненты
│   ├── views/      # Страницы приложения
│   ├── router/     # Маршрутизация
│   ├── store/      # Хранилище данных
│   ├── App.vue     # Корневой компонент
│   └── main.js     # Точка входа
├── .github/        # GitHub Actions конфигурация
├── index.html      # HTML шаблон
└── vite.config.js  # Конфигурация Vite
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
