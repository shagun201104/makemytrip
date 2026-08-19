package com.makemytrip.makemytrip.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.makemytrip.makemytrip.models.User;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;

import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/flights")
    public ResponseEntity<List<Flight>> getAllFlights() {
        List<Flight> flights = flightRepository.findAll();
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/hotels")
    public ResponseEntity<List<Hotel>> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return ResponseEntity.ok(hotels);
    }

    @PostMapping("flight")
    public Flight addFlight(@RequestBody Flight flight) {
        return flightRepository.save(flight);
    }

    @PostMapping("hotel")
    public Hotel addHotel(@RequestBody Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @PutMapping("flight/{id}")
    public ResponseEntity<Flight> editFlight(@PathVariable String id, @RequestBody Flight Updatedflight) {
        Optional<Flight> flightoptional = flightRepository.findById(id);

        if (flightoptional.isPresent()) {
            Flight flight = flightoptional.get();
            flight.setFlightName(Updatedflight.getFlightName());
            flight.setFrom(Updatedflight.getFrom());
            flight.setTo(Updatedflight.getTo());
            flight.setDepartureTime(Updatedflight.getDepartureTime());
            flight.setArrivalTime(Updatedflight.getArrivalTime());
            flight.setPrice(Updatedflight.getPrice());
            flight.setAvailableSeats(Updatedflight.getAvailableSeats());

            Flight savedFlight = flightRepository.save(flight);
            return ResponseEntity.ok(savedFlight);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("hotel/{id}")
    public ResponseEntity<Hotel> editHotel(@PathVariable String id, @RequestBody Hotel Updatedhotel) {
        Optional<Hotel> hoteloptional = hotelRepository.findById(id);

        if (hoteloptional.isPresent()) {
            Hotel hotel = hoteloptional.get();
            hotel.setHotelName(Updatedhotel.getHotelName());
            hotel.setLocation(Updatedhotel.getLocation());
            hotel.setPricePerNight(Updatedhotel.getPricePerNight());
            hotel.setRating(Updatedhotel.getRating());
            hotel.setAvailableRooms(Updatedhotel.getAvailableRooms());

            Hotel savedHotel = hotelRepository.save(hotel);
            return ResponseEntity.ok(savedHotel);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}