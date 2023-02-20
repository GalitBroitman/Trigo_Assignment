
import { connect, StringCodec } from 'nats';
const nats = await connect({ servers: 'nats://nats:4222' });

// create a codec
const sc = StringCodec();

// handle requests to the "echo" operation
const subscription = nats.subscribe("echo");
(async (sub) => {
  console.log(`listening for ${sub.getSubject()} requests...`);
  for await (const m of sub) {
    const message = sc.decode(m.data);
    // validate the request
    if (!message || typeof message !== 'string') {
        m.respond(sc.encode('Invalid request body'));
      } else {
        // respond with the message returned by the service
        m.respond(sc.encode(message));
      }
  }
  console.log(`subscription ${sub.getSubject()} drained.`);
})(subscription);

