import SleeperAPI from './src/index.js';

async function testAPI() {
    const sleeper = new SleeperAPI();
    
    try {
        console.log('🏈 Testing Sleeper API...\n');
        
        // Test basic connectivity
        console.log('📡 Testing connectivity...');
        const nflState = await sleeper.getNflState();
        console.log(`✅ Connected! Current NFL week: ${nflState.week}\n`);
        
        // Test user lookup (replace with a real username)
        console.log('👤 Testing user lookup...');
        const user = await sleeper.getUser('toricook13');
        console.log(`✅ Found user: ${user.display_name} (ID: ${user.user_id})\n`);
        
        // Test user by ID
        console.log('🆔 Testing user lookup by ID...');
        const userById = await sleeper.getUserById(user.user_id);
        console.log(`✅ Found same user: ${userById.display_name}\n`);
        
        // Test league lookup (replace with a real league ID)
        console.log('🏆 Testing get 2024 league for this user...');
        const league = await sleeper.getLeaguesForUser(user.user_id, 2024);
        console.log(`✅ Found league: ${league[0].league_id}\n`);
        
        // Test helper method if you have it
        if (sleeper.getLeagueOverview) {
            console.log('📊 Testing league overview...');
            const overview = await sleeper.getLeagueOverview(league[0].league_id);
            //console.log(`✅ League overview (without teams): ${JSON.stringify(overview.league, null, 2)}\n`);
        }

        console.log('🏆 Testing get standings for this league...');
        const standings = await sleeper.getLeagueStandings(league[0].league_id);
        console.log(`✅ League standings: ${JSON.stringify(standings, null, 2)}\n`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the tests
testAPI();