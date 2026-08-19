const BASE_URL = "http://localhost:8080";

export const login = async (data: { email: string; password: string }) => {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
};

export const signup = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;



}) => {
  const res = await fetch(`${BASE_URL}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }

  return res.json();
};


export const getflight = async () => {
  const res = await fetch(`${BASE_URL}/admin/flights`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch flights");
  }

  return res.json();
};

export const addflight = async (flightData: any) => {
  const res = await fetch(`${BASE_URL}/admin/flight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flightData),
  });

  if (!res.ok) {
    throw new Error("Failed to add flight");
  }

  return res.json();
};

export const editflight = async (id: string, flightData: any) => {
  const res = await fetch(`${BASE_URL}/admin/flight/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flightData),
  });

  if (!res.ok) {
    throw new Error("Failed to update flight");
  }

  return res.json();
};

export const gethotel = async () => {
  const res = await fetch(`${BASE_URL}/admin/hotels`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch hotels");
  }

  return res.json();
};

export const addhotel = async (hotelData: any) => {
  const res = await fetch(`${BASE_URL}/admin/hotel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hotelData),
  });

  if (!res.ok) {
    throw new Error("Failed to add hotel");
  }

  return res.json();
};

export const edithotel = async (id: string, hotelData: any) => {
  const res = await fetch(`${BASE_URL}/admin/hotel/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hotelData),
  });

  if (!res.ok) {
    throw new Error("Failed to update hotel");
  }

  return res.json();
};

export const bookFlight = async (data: {
  userId: string;
  flightId?: string;
  flightName: string;
  seats: number;
  price: number;
  date?: string;
}) => {
  const res = await fetch(`${BASE_URL}/booking/flight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to book flight");
  }

  return res.json();
};

export const bookHotel = async (data: {
  userId: string;
  hotelId?: string;
  hotelName: string;
  rooms: number;
  nights: number;
  price: number;
  date?: string;
}) => {
  const res = await fetch(`${BASE_URL}/booking/hotel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to book hotel");
  }

  return res.json();
};

export const getUserBookings = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/booking/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
};

export const updateProfile = async (
  id: string,
  data: { firstname?: string; lastname?: string; phoneNumber?: string }
) => {
  const res = await fetch(`${BASE_URL}/user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to update profile");
  }

  return res.json();
};
