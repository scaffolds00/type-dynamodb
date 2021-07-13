// // ---------- update name and password ----------
// var params = {
//     TableName: "User",
//     Key:{
//         "id": "232",
//     },
//     UpdateExpression: "set name= :r, password=:p",
//     ExpressionAttributeValues:{
//         ":r":"newName",
//         ":p":"StringPassword",
//     },
//     ReturnValues:"UPDATED_NEW"
// };

// docClient.update(params)// json as result