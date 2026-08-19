"use client";

import { useEffect, useState } from "react";
import { gethotel, addhotel } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

const Hotel = () => {

    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formdata, setFormdata] = useState({
        id: "",
        hotelName: "",
        location: "",
        pricePerNight: 0,
        rating: 0,
        availableRooms: 0,
    });

    // GET HOTELS
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const data = await gethotel();
                alert(JSON.stringify(data));
                setHotels(data);

                console.log("HOTELS FROM API:", data);

                setHotels(data);
            } catch (error) {
                console.error("Error fetching hotels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    // INPUT CHANGE
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormdata((prev) => ({
            ...prev,
            [name]:
                name === "pricePerNight" ||
                name === "rating" ||
                name === "availableRooms"
                    ? Number(value)
                    : value,
        }));
    };

    // SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addhotel(formdata);

            const data = await gethotel();
            setHotels(data);

            setFormdata({
                id: "",
                hotelName: "",
                location: "",
                pricePerNight: 0,
                rating: 0,
                availableRooms: 0,
            });

        } catch (error) {
            console.error("Error saving hotel:", error);
        }
    };

    // EDIT
    const handleEdit = (hotel: any) => {
        setFormdata({
            id: hotel._id || hotel.id || "",
            hotelName: hotel.hotelName || "",
            location: hotel.location || "",
            pricePerNight: hotel.pricePerNight || 0,
            rating: hotel.rating || 0,
            availableRooms: hotel.availableRooms || 0,
        });
    };

    if (loading) {
        return <div>Loading hotels...</div>;
    }

    return (
        <div className="space-y-6">

            {/* HOTEL FORM */}

            <div className="rounded-xl border p-6">

                <h2 className="text-xl font-semibold mb-4">
                    Add Hotel
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {/* HOTEL NAME */}

                    <div>
                        <label className="block mb-2">
                            Hotel Name
                        </label>

                        <select
                            name="hotelName"
                            value={formdata.hotelName}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2"
                            required
                        >
                            <option value="">
                                Select Hotel
                            </option>

                            {hotels.map((hotel: any) => (
                                <option
                                    key={hotel._id}
                                    value={hotel.hotelName}
                                >
                                    {hotel.hotelName}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* LOCATION */}

                    <div>
                        <label className="block mb-2">
                            Location
                        </label>

                        <select
                            name="location"
                            value={formdata.location}
                            onChange={handleChange}
                            className="w-full rounded-md border px-3 py-2"
                            required
                        >
                            <option value="">
                                Select Location
                            </option>

                            {hotels.map((hotel: any) => (
                                <option
                                    key={hotel._id}
                                    value={hotel.location}
                                >
                                    {hotel.location}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* PRICE */}

                    <div>
                        <label className="block mb-2">
                            Price Per Night
                        </label>

                        <Input
                            type="number"
                            name="pricePerNight"
                            value={formdata.pricePerNight}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    {/* RATING */}

                    <div>
                        <label className="block mb-2">
                            Rating
                        </label>

                        <Input
                            type="number"
                            name="rating"
                            value={formdata.rating}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    {/* AVAILABLE ROOMS */}

                    <div>
                        <label className="block mb-2">
                            Available Rooms
                        </label>

                        <Input
                            type="number"
                            name="availableRooms"
                            value={formdata.availableRooms}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <Button type="submit">
                        Add Hotel
                    </Button>

                </form>
            </div>


            {/* HOTEL LIST */}

            <div className="rounded-xl border overflow-hidden">

                <Table>

                    <TableHeader>
                        <TableRow>
                            <TableHead>Hotel Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>

                        {hotels.length > 0 ? (

                            hotels.map((hotel: any) => (

                                <TableRow key={hotel._id}>

                                    <TableCell>
                                        {hotel.hotelName}
                                    </TableCell>

                                    <TableCell>
                                        {hotel.location}
                                    </TableCell>

                                    <TableCell>
                                        ${hotel.pricePerNight}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            onClick={() =>
                                                handleEdit(hotel)
                                            }
                                        >
                                            Edit
                                        </Button>
                                    </TableCell>

                                </TableRow>

                            ))

                        ) : (

                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-6"
                                >
                                    No hotels found
                                </TableCell>
                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </div>

        </div>
    );
};

export default Hotel;