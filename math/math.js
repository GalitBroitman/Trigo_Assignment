import { connect, JSONCodec, StringCodec } from 'nats';
const nats = await connect({ servers: 'nats://nats:4222' });

// create a codec
const jc = JSONCodec();
const sc = StringCodec();


// handle requests to the "subtract" operation
const subtract_subscription = nats.subscribe("math.subtract");
(async (sub) => {
  console.log(`listening for ${sub.getSubject()} requests...`);
  for await (const m of sub) {
    const { num1, num2 } = jc.decode(m.data);
    const result = num1 - num2;

    // respond with the message returned by the service
    m.respond(sc.encode(result.toString()));
      
  }
  console.log(`subscription ${sub.getSubject()} drained.`);
})(subtract_subscription);


// handle requests to the "divide" operation
const divide_subscription = nats.subscribe("math.divide");
(async (sub) => {
  console.log(`listening for ${sub.getSubject()} requests...`);
  for await (const m of sub) {
    const { num1, num2 } = jc.decode(m.data);

    // validate the request
    if (num2 === 0) {
      m.respond(sc.encode('Cannot divide by zero'));
    } else {
      const result = num1 / num2; 
      // respond with the message returned by the service
      m.respond(sc.encode(result.toString()));
    }

      
  }
  console.log(`subscription ${sub.getSubject()} drained.`);
})(divide_subscription);
