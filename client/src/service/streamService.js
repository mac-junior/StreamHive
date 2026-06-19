export const getStreamToken = async (userId) => {
  const res = await fetch("http://localhost:5000/api/stream/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error("Token not received from server");
  }

  return data.token;
};