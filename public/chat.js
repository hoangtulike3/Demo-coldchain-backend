document.addEventListener("DOMContentLoaded", () => {
  const socket = io({
    auth: { serverOffset: 0 },
  });

  // 방에 참여
  const roomId = "8";
  const userId = "";
  socket.emit("joinRoom", { userId, roomId });

  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("chat message", input.value, roomId);
      input.value = "";
    }
  });

  socket.on("chat message", (data) => {
    const item = document.createElement("li");
    item.textContent = data.message;
    messages.appendChild(item);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected: ${reason}`);
  });
});
