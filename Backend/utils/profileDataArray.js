// Utility: Add/Remove logic for array fields
// function handleAddRemoveArray(existingArray = [], updatePayload = {}) {
//   /*
//     updatePayload format:
//     {
//       add: ["React", "Node.js"],
//       remove: ["C"]
//     }
//   */

//   // Start with a copy of existing entries
//   let result = [...existingArray];

//   // Add new items (only if they don't already exist)
//   if (Array.isArray(updatePayload.add)) {
//     updatePayload.add.forEach((item) => {
//       if (!result.includes(item)) {
//         result.push(item);
//       }
//     });
//   }

//   // Remove items
//   if (Array.isArray(updatePayload.remove)) {
//     result = result.filter((item) => !updatePayload.remove.includes(item));
//   }

//   return result;
// }

// Utility: Add/Remove logic for array fields
function handleAddRemoveArray(existingArray = [], updatePayload = {}) {
  /*
    updatePayload format:
    {
      add: ["React"],
      remove: ["C"]
    }
  */

  let result = [...existingArray];

  // ADD
  if (Array.isArray(updatePayload.add)) {
    updatePayload.add.forEach(item => {
      if (!result.includes(item)) {
        result.push(item);
      }
    });
  }

  // REMOVE
  if (Array.isArray(updatePayload.remove)) {
    result = result.filter(item => !updatePayload.remove.includes(item));
  }

  return result;
}

module.exports = { handleAddRemoveArray };
