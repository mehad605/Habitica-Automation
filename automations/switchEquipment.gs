/**
 * switchEquipment(rewardName)
 * 
 * Switches the player's equipment set based on the reward claimed.
 * Uses UrlFetchApp.fetchAll to send requests in parallel for efficiency.
 */
function switchEquipment(rewardName) {

  // find matching equipment set
  let setName = Object.keys(EQUIPMENT_SETS).find(key => rewardName.toLowerCase().includes(key));
  if (!setName) {
    return;
  }

  let targetSet = EQUIPMENT_SETS[setName];
  let currentEquipped = getEquippedGear();
  let requests = [];

  console.log("Switching to " + setName + " equipment set...");

  // for each slot in the set
  for (let [slot, itemKey] of Object.entries(targetSet)) {

    // skip if already correct or it's the base shield
    if (itemKey === "shield_base_0" || currentEquipped[slot] === itemKey) {
      continue;
    }
      
    // add to batch requests
    requests.push(Object.assign({
      "url": "https://habitica.com/api/v3/user/equip/equipped/" + itemKey
    }, POST_PARAMS));
  }

  // send parallel requests
  if (requests.length > 0) {
    fetchBatch(requests);
    console.log("Successfully switched " + requests.length + " items.");
  } else {
    console.log("Already wearing the " + setName + " set.");
  }
}

/**
 * createEquipmentRewards()
 * 
 * Creates rewards in Habitica for all equipment sets defined in setup.gs.
 * Each reward will have a cost of 0 gold.
 */
function createEquipmentRewards() {
  let setNames = Object.keys(EQUIPMENT_SETS);
  console.log("Creating rewards for equipment sets: " + setNames.join(", "));

  let requests = [];
  for (let setName of setNames) {
    let reward = {
      "text": "Equip " + setName.charAt(0).toUpperCase() + setName.slice(1),
      "type": "reward",
      "value": 0,
      "notes": "Automatically switch to the " + setName + " equipment set."
    };
    
    requests.push(Object.assign({
      "url": "https://habitica.com/api/v3/tasks/user",
      "contentType": "application/json",
      "payload": JSON.stringify(reward)
    }, POST_PARAMS));
  }

  if (requests.length > 0) {
    fetchBatch(requests);
    console.log("Successfully created " + requests.length + " equipment rewards.");
  }
}
