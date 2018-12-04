const faunadb = require('faunadb');

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

// /* create a user in FaunaDB that can connect from the browser */
// function createUser(userData, password) {
//   return client.query(q.Create(q.Class("users"), {
//     credentials : {
//       password : password
//     },
//     data : {
//       id : userData.id,
//       user_metadata : userData.user_metadata
//     }
//   }))
// }

// function obtainToken(user, password) {
//   console.log("creating FaunaDB token for " + user)
//   return client.query(
//     q.Login(q.Select("ref", user), { password }))
// }

export function handler(event, context, callback) {
  const body = JSON.parse(event.body);
  console.log({ body });
  // console.log('------------');
  // console.log('queryStringParameters', event.queryStringParameters);
  // body = {
  //   event: 'signup',
  //   instance_id: '3f627b1d-a964-40f9-bba0-098db82b9151',
  //   user: {
  //     id: '5debd585-bbcd-40a5-a892-767dd09fc6e2',
  //     aud: '',
  //     role: '',
  //     email: 'swyx+2@netlify.com',
  //     confirmation_sent_at: '2018-12-04T15:50:10Z',
  //     app_metadata: { provider: 'email' },
  //     user_metadata: { full_name: 'swyx2' },
  //     created_at: '2018-12-04T15:50:10Z',
  //     updated_at: '2018-12-04T15:50:10Z'
  //   }
  // };

  console.log('ctx', context.clientContext);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ app_metadata: { roles: ['admin'], foo: 'bar' } })
  });
}
