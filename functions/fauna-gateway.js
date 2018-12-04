// import { signupUser } from './gateway/signup';

export function handler(event, context, callback) {
  // console.log('event', event);
  // console.log('------------');
  // console.log('queryStringParameters', event.queryStringParameters);
  console.log('ctx', context.clientContext);
  if (context.clientContext) {
    // authenticated
    const { identity, user } = context.clientContext;

    // if the request has an auth bearer token with the Netlify identity jwt, `user` will be an object like this:
    // app_metadata: {provider: "email"}
    // email: "swyx@netlify.com"
    // exp: 1543936656
    // sub: "4273eee0-6c66-431d-bb32-6ce317265e1a" // this is the netlify identity user id
    // user_metadata: {full_name: "swyx"}

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
