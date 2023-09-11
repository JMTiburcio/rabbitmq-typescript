import amqp from 'amqplib';

const consumer = async () => {
  try {
    const connection = await amqp.connect("amqp://karhub:karhub@localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertExchange("main-exchange", "direct", { "alternateExchange":"alter-exchange" });
    await channel.assertExchange("alter-exchange", "fanout");

    await channel.assertQueue("main-queue");
    await channel.assertQueue("alter-queue");

    await channel.bindQueue("main-queue", "main-exchange", "main-queue");
    await channel.bindQueue("alter-queue", "alter-exchange", "");
    
    console.log("Consumer activated...");
    console.log("Waiting for messages. Press CTRL+C to exit.\n\n");

    channel.consume("main-queue", (msg) => {
      if (msg !== null) {
        console.log(`main-queue: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });

    channel.consume("alter-queue", (msg) => {
      if (msg !== null) {
        console.log(`alter-queue: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });

  } catch (error) {
    console.error(error);
  }
};

consumer();
