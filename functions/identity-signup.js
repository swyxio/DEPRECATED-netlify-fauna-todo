export function handler(event, context, callback) {
  console.log('event', event);
  // console.log('------------');
  // console.log('queryStringParameters', event.queryStringParameters);
  console.log('ctx', context.clientContext);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ app_metadata: { roles: ['admin'], foo: 'bar' } })
  });
}
