import axios from "axios"

const BACKEND_URL = "http://localhost:8080"

export const login = async (email, password) => {
    try {
        const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`
        const res = await axios.post(url)
        const data = res.data
        console.log(data)
        return data
    } catch (error) {
        throw error
    }
}


export const signup = async (
    firstname,
    lastname,
    phoneNumber,
    email,
    password
) => {
    try {
        const res = await axios.post(`${BACKEND_URL}/user/signup`, {
            firstname,
            lastname,
            phoneNumber,
            email,
            password,
        });
        const data = res.data
        console.log(data)
        return data
    } catch (error) {
        throw error;
    }
};

export const getflight = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/flight`)
        const data = res.data
        return data
    } catch (error) {
        console.log(data);
    }
};
export const addflight = async (
    _id,
    flightName,
    from,
    to,
    departureTime,
    arrivalTime,
    price,
    availableSeats,
) => {


    try {
        const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
            _id,
            flightName,
            from,
            to,
            departureTime,
            arrivalTime,
            price,
            availableSeats,
        });
        const data = res.data;
        return data
    } catch (error) {
        console.log(error)
    }


};
export const gethotel = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/hotel`)
        const data = res.data
        return data
    } catch (error) {
        console.log(data);
    }
};


export const addhotel = async (
    id,
    hotelName,
    location,
    pricePerNight,
    rating,
    availableRooms,
) => {


    try {
        const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
            id,
            hotelName,
            location,
            pricePerNight,
            rating,
            availableRooms,
        });
        const data = res.data;
        return data
    } catch (error) {
        console.log(error)
    }


};
