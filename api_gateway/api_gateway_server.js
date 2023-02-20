import express, { json } from 'express';
import { connect, StringCodec, JSONCodec } from 'nats';

const nats = await connect({ servers: 'nats://nats:4222' });
const app = express();

// create a codec
const sc = StringCodec();
const jc = JSONCodec();

app.use(json()); // middleware to parse JSON request bodies

app.post('/math/:operation', async (req, res) => {
  const operation = req.params.operation;
  const { num1, num2 } = req.body;
  // validate the request
  if (!num1 || !num2 || isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  const send_data  = jc.encode({ num1,num2 });

  // route the request to the relevant service
  await nats.request(`math.${operation}`, send_data)
  .then((m) => {
    console.log(`got response: ${sc.decode(m.data)}`);
    // respond with the result returned by the service
    res.json({ result: parseFloat(sc.decode(m.data)) });      
  })
  .catch((err) => {
    console.log(`problem with request: ${err.message}`);
  });
});

app.post('/echo', async (req, res) => {
  const message = req.body.message;
  // validate the request
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  // route the request to the relevant service
  await nats.request("echo", sc.encode(message))
  .then((m) => {
    console.log(`got response: ${sc.decode(m.data)}`);
    // respond with the result returned by the service
    res.json({ message: sc.decode(m.data) });
    
  })
  .catch((err) => {
    console.log(`problem with request: ${err.message}`);
  });
});


const port = 80;
app.listen(port, () => {
  console.log(`API Gateway server listening on port ${port}`);
});
