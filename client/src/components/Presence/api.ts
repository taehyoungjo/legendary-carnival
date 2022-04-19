const newRoomEndPoint = `${window.location.origin}/api/rooms`;

/**
 * Create a short-lived room for demo purposes
 */
async function createRoom() {
  // const exp = Math.round(Date.now() / 1000 + 60 * 30)
  // const options = {
  //     properties: {
  //         exp: exp,
  //     }
  // }
  // let response = await fetch(newRoomEndPoint, {
  //     method: 'POST',
  //     body: JSON.stringify(options),
  //     mode: 'cors'
  // }),
  //  room = await response.json()

  // return room

  return { url: "https://stilllife.daily.co/SDqx9bdRlsl6oFFfWyxF" };
}

export default { createRoom };
