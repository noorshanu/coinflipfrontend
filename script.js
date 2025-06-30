const axios = require('axios');

async function createGame(startTime) {
    try {
        const response = await axios.post('https://coin-flip-backend-nishantpacharnes-projects.vercel.app/api/generate-game', {
            startTime: startTime.toISOString()
        });
        console.log(`Game created with start time: ${startTime.toLocaleString()}`);
        console.log('Response:', response.data);
    } catch (error) {
        console.error(`Failed to create game for start time: ${startTime.toLocaleString()}`);
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// async function generateGames() {
//     while (true) {  // Infinite loop to keep the script running
//         console.log('\n--- Starting new batch of games ---\n');
//         const baseTime = new Date();
        
//         // Create 8 games with 2-minute intervals
//         for (let i = 0; i < 8; i++) {
//             const gameStartTime = new Date(baseTime);
//             // Add (i+1)*2 minutes to the base time for each game
//             gameStartTime.setMinutes(gameStartTime.getMinutes() + (i + 1) * 2);
            
//             // Add a small delay between API calls to prevent rate limiting
//             await new Promise(resolve => setTimeout(resolve, 1000));
            
//             await createGame(gameStartTime);
//         }

//         // Wait for 16 minutes before creating the next batch
//         // We use 15.5 minutes to account for API call times and ensure no gaps
//         console.log('\nWaiting 15.5 minutes before creating next batch...');
//         await new Promise(resolve => setTimeout(resolve, 15.5 * 60 * 1000));
//     }
// }

// // Handle script termination gracefully
// process.on('SIGINT', () => {
//     console.log('\nScript terminated by user. Shutting down...');
//     process.exit(0);
// });

// // Start the continuous game generation
// console.log('Starting continuous game generation script...');
// console.log('Press Ctrl+C to stop the script\n');
// generateGames();
const startTime = new Date();
startTime.setMinutes(startTime.getMinutes() + 1);
createGame(startTime);
