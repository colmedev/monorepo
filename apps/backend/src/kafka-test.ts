// import { Kafka } from 'kafkajs';

// // Configuración del cliente de Kafka
// const kafka = new Kafka({
//   clientId: 'kafka-test-app',
//   brokers: ['localhost:9092'],
// });

// const producer = kafka.producer();
// const consumer = kafka.consumer({ groupId: 'test-group' });

// async function testProducer() {
//   console.log('🚀 Conectando producer...');
//   await producer.connect();
//   console.log('✅ Producer conectado');

//   const topic = 'test-topic';

//   // Enviar mensajes
//   console.log(`📤 Enviando mensajes al topic "${topic}"...`);
//   await producer.send({
//     topic,
//     messages: [
//       { value: 'Hola Kafka!' },
//       { value: 'Este es un mensaje de prueba' },
//       { value: JSON.stringify({ id: 1, nombre: 'Prueba', timestamp: new Date() }) },
//     ],
//   });
//   console.log('✅ Mensajes enviados');

//   await producer.disconnect();
//   console.log('👋 Producer desconectado');
// }

// async function testConsumer() {
//   console.log('🚀 Conectando consumer...');
//   await consumer.connect();
//   console.log('✅ Consumer conectado');

//   const topic = 'test-topic';

//   // Suscribirse al topic
//   await consumer.subscribe({ topic, fromBeginning: true });
//   console.log(`📥 Escuchando mensajes del topic "${topic}"...`);

//   // Procesar mensajes
//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log({
//         topic,
//         partition,
//         offset: message.offset,
//         value: message.value?.toString(),
//       });
//     },
//   });
// }

// async function main() {
//   const mode = process.argv[2];

//   try {
//     if (mode === 'producer') {
//       await testProducer();
//     } else if (mode === 'consumer') {
//       await testConsumer();
//     } else {
//       console.log('Uso: ts-node kafka-test.ts [producer|consumer]');
//       console.log('\nEjemplos:');
//       console.log('  ts-node src/kafka-test.ts producer  # Enviar mensajes');
//       console.log('  ts-node src/kafka-test.ts consumer  # Recibir mensajes');
//       process.exit(1);
//     }
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// }

// main();


import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'kafka-test-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

async function main() {
  try {
    console.log('🚀 Connecting producer...')
    await producer.connect()
    console.log('📤 Sending message...')
    await producer.send({
      topic: 'test-topic',
      messages: [
        { value: '¡hello world! ' + new Date().toISOString() },
      ],
    })
    console.log('✅ Message sent')
    await producer.disconnect()

    const groupId = 'test-group-' + Date.now()
    console.log(`🚀 Connecting consumer with groupId: ${groupId}...`)
    const consumer = kafka.consumer({ groupId })

    await consumer.connect()
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

    console.log('📥 Starting consumer runner...')
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('📨 Message received:', {
          value: message.value?.toString(),
          topic,
          partition,
        })
      },
    })

    // Keep process alive
    console.log('⏳ Consumer is running...')
  } catch (error) {
    console.error('❌ Error in main:', error)
  }

}

main().catch(console.error)
