import { v4 as uuidv4 } from "uuid";

function handelStart(roomArry, socket, cb, io) {
  let availableroom = checkAvailableRoom();
  if (availableroom.is) {
    socket.join(availableroom.roomid);
    cb("p2");
    closeRoom(availableroom.roomid);
    if (availableroom && availableroom.room) {
      io.to(availableroom.room.p1.id).emit("remote-socket", socket.id);
      socket.emit("remote-socket", availableroom.room.p1.id);
      socket.emit("roomid", availableroom.room.roomid);
      console.log("room available ");
    }
  } else {
    letid = uuidv4();
    socket.join(roomid);
   Arry.push({
     id,
      isAvailable: true,
      p1: {
        id: socket.id,
      },
      p2: {
        id: null,
      },
    });
    cb("p1");
    socket.emit("roomid",id);
    console.log("created new");
  }

  function closeRoom(roomid) {
    for (let i = 0; i <Arry.length; i++) {
      if (roomArry[i].roomid ===id) {
       Arry[i].isAvailable = false;
       Arry[i].p2.id = socket.id;
        break;
      }
    }
  }

  function checkAvailableRoom() {
    for (let i = 0; i <Arry.length; i++) {
      if (
       Arry[i].isAvailable &&
       Arry[i].p1.id !== socket.id &&
       Arry[i].p2.id !== socket.id
      ) {
        return { is: true,id:Arry[i].roomid,:Arry[i] };
      }
      if (roomArry[i].p1.id === socket.id ||Arry[i].p2.id === socket.id) {
        return { is: false,id: "",: null };
      }
    }
    return { is: false,id: "",: null };
  }
}

function getType(id,Arr) {
  for (let i = 0; i <Arr.length; i++) {
    if (roomArr[i].p1.id === id) {
      return { type: "p1", p2id:Arr[i].p2.id };
    } else if (roomArr[i].p2.id === id) {
      return { type: "p2", p1id:Arr[i].p1.id };
    }
  }

  return false;
}

function handelDisconnect(disconnectedId,Arr, io) {
  for (let i = 0; i <Arr.length; i++) {
    if (roomArr[i].p1.id === disconnectedId) {
      if (roomArr[i].p2.id) {
        io.to(roomArr[i].p2.id).emit("disconnected");
      }
     Arr.splice(i, 1);
      break;
    } else if (roomArr[i].p2.id === disconnectedId) {
      if (roomArr[i].p1.id) {
        io.to(roomArr[i].p1.id).emit("disconnected");
      }
     Arr.splice(i, 1);
      break;
    }
  }
}

function handelSkip(socketId,Arr, io) {
  // Find the the user is in
  letIndex =Arr.findIndex(
    (room) =>.p1.id === socketId ||.p2.id === socketId
  );

  if (roomIndex !== -1) {
    let =Arr[roomIndex];
    let otherUserId = null;

    if (room.p1.id === socketId) {
      otherUserId =.p2.id;
    } else if (room.p2.id === socketId) {
      otherUserId =.p1.id;
    }

    // Notify the other user to skip
    if (otherUserId) {
      io.to(otherUserId).emit("skipped");
    }

    // Remove the as both users are now disconnected
   Arr.splice(roomIndex, 1);

    // The user who initiated skip starts a new search
    let socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit("start", (person) => {
        handelStart(
         Arr,
          socket,
          (role) => {
            socket.emit("role", role);
          },
          io
        );
      });
    }

    // The other user starts a new search
    if (otherUserId) {
      let otherSocket = io.sockets.sockets.get(otherUserId);
      if (otherSocket) {
        otherSocket.emit("start", (person) => {
          handelStart(
           Arr,
            otherSocket,
            (role) => {
              otherSocket.emit("role", role);
            },
            io
          );
        });
      }
    }
  }
}

module.exports = {
  handelStart,
  getType,
  handelDisconnect,
  handelSkip,
};