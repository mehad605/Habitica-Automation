/**
 * castBurstOfFlames(numBursts)
 * 
 * Casts Burst of Flames on a specific daily task multiple times.
 */
function castBurstOfFlames(numBursts) {

  // parse number of bursts
  numBursts = parseInt(numBursts);
  if (isNaN(numBursts) || numBursts <= 0) {
    console.log("Invalid number of bursts: " + numBursts);
    return;
  }

  // get user stats and mana
  getUser(true);
  let mp = user.stats.mp;
  let maxBursts = Math.floor(mp / 10);
  
  if (numBursts > maxBursts) {
    console.log("Not enough mana for " + numBursts + " bursts. Mana: " + mp + ". Casting " + maxBursts + " instead.");
    numBursts = maxBursts;
  }

  if (numBursts <= 0) {
    console.log("No mana to cast Burst of Flames.");
    return;
  }

  // get dailies to find the target task
  getTasks();
  let targetTask = dailies.find(d => d.text === BURST_OF_FLAMES_TARGET);

  if (!targetTask) {
    console.log("Target daily \"" + BURST_OF_FLAMES_TARGET + "\" not found.");
    return;
  }

  console.log("Casting Burst of Flames " + numBursts + " time(s) on target daily \"" + targetTask.text + "\"");

  // Create batch requests
  let requests = [];
  for (let i = 0; i < numBursts; i++) {
    requests.push(Object.assign({
      "url": "https://habitica.com/api/v3/user/class/cast/fireball?targetId=" + targetTask.id
    }, POST_PARAMS));
  }

  // Send requests in batches to avoid timeout and respect rate limits
  // (fetching in batches of 10-20 is generally safe for Habitica)
  let batchSize = 10;
  for (let i = 0; i < requests.length; i += batchSize) {
    let currentBatch = requests.slice(i, i + batchSize);
    fetchBatch(currentBatch);
    console.log("Cast batch " + (Math.floor(i / batchSize) + 1));
    if (interruptLoop()) {
      break;
    }
  }

  console.log("Finished casting Burst of Flames.");
}

/**
 * createBurstReward()
 * 
 * Creates the "Burst of Flames" reward in Habitica with cost 0 and note 0.
 */
function createBurstReward() {
  let reward = {
    "text": "Burst of Flames",
    "type": "reward",
    "value": 0,
    "notes": "0"
  };
  
  let params = Object.assign({
    "contentType": "application/json",
    "payload": JSON.stringify(reward)
  }, POST_PARAMS);
  
  fetch("https://habitica.com/api/v3/tasks/user", params);
  console.log("Created 'Burst of Flames' reward.");
}
