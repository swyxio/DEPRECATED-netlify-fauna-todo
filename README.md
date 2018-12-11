# netlify-fauna-todo

Netlify Identity + FaunaDB app with most recent versions of FaunaDB client and React.

- Video: https://youtu.be/7OB_IjTTcwg
- Demo: https://cocky-almeida-4df361.netlify.com/
- Github: https://github.com/sw-yx/netlify-fauna-todo

One click deploy:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sw-yx/netlify-fauna-todo&stack=fauna) (and then make sure to turn on Netlify Identity since it doesnt do that yet)

Manual deploy/Local development

1. Deploy to Netlify and run `netlify addons:create fauna`
1. look for the given server secret from the netlify addon, and copy it
1. run `export FAUNADB_SERVER_SECRET=your_secret_here`

Features of note:

- Netlify Identity Authentication
- `useFauna` React Hook
- custom hooks from [@swyx/hooks](https://github.com/sw-yx/hooks)
