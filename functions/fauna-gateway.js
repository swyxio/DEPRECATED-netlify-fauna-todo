// import { signupUser } from './gateway/signup';

export function handler(event, context, callback) {
  // console.log('event', event);
  // console.log('------------');
  // console.log('queryStringParameters', event.queryStringParameters);
  console.log('ctx', context.clientContext);
  if (context.clientContext) {
    // authenticated
    const { identity, user } = context.clientContext;
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        msg: 'auth-hello: ' + Math.round(Math.random() * 10),
        identity,
        user
      })
    });
  } else {
    // unauthenticated
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        msg:
          'auth-hello - no authentication detected. Note that netlify-lambda doesnt locally emulate Netlify Identity.'
      })
    });
  }
}
