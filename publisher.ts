import amqp from 'amqplib';

const publisher = async () => {
  try {
    const connection = await amqp.connect("amqp://karhub:karhub@localhost:5672");
    const channel = await connection.createChannel();
    
    await channel.assertExchange("main-exchange", "direct", { "alternateExchange":"alter-exchange" });
    await channel.assertExchange("alter-exchange", "fanout");

    await channel.assertQueue("main-queue");
    await channel.bindQueue("main-queue", "main-exchange", "main-queue");
    
    console.log("Publisher activated...");
    console.log("Press any key to send a message. Press CTRL+C to exit.\n\n");

    let count = 0;
    
    process.stdin.setRawMode(true);
    process.stdin.on('data', async (data) => {
      const key = data.toString().trim();
      if (key === '\u0003') { // CTRL+C
        console.log('Encerrando o Publisher.');
        process.exit();
      } else {
        count++
        const message = `Message #${count}`;
        count % 3 != 0 
          ? channel.publish("main-exchange", "main-queue", Buffer.from(message))
          : channel.publish("main-exchange", "no-queue", Buffer.from(message))
        console.log(`Message #${count} sent`);
      }
    });

  } catch (error) {
    console.error(error);
  }
};

publisher();
