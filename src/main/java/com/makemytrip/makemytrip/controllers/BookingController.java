package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.User;
import com.makemytrip.makemytrip.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/flight")
    public ResponseEntity<User.Booking> bookFlight(@RequestBody FlightBookingRequest request) {
        User.Booking booking = bookingService.bookFlight(
                request.getUserId(),
                request.getFlightId(),
                request.getSeats(),
                request.getPrice(),
                request.getFlightName(),
                request.getDate());
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/hotel")
    public ResponseEntity<User.Booking> bookHotel(@RequestBody HotelBookingRequest request) {
        User.Booking booking = bookingService.bookHotel(
                request.getUserId(),
                request.getHotelId(),
                request.getRooms(),
                request.getNights(),
                request.getPrice(),
                request.getHotelName(),
                request.getDate());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<User.Booking>> getUserBookings(@PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(400).body(ex.getMessage());
    }
}

class FlightBookingRequest {
    private String userId;
    private String flightId;
    private String flightName;
    private int seats;
    private double price;
    private String date;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public String getFlightName() { return flightName; }
    public void setFlightName(String flightName) { this.flightName = flightName; }

    public int getSeats() { return seats; }
    public void setSeats(int seats) { this.seats = seats; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}

class HotelBookingRequest {
    private String userId;
    private String hotelId;
    private String hotelName;
    private int rooms;
    private int nights;
    private double price;
    private String date;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public int getRooms() { return rooms; }
    public void setRooms(int rooms) { this.rooms = rooms; }

    public int getNights() { return nights; }
    public void setNights(int nights) { this.nights = nights; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
