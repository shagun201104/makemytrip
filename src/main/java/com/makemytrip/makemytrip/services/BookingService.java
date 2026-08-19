package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.User;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Handles flight and hotel bookings. When a real flight/hotel id is supplied
 * and found in the database, the item's own price is used and its inventory
 * (available seats / rooms) is decremented. Otherwise the booking is recorded
 * from the details the client provides so the flow still works end-to-end.
 */
@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public User.Booking bookFlight(String userId, String flightId, int seats,
                                   double clientPrice, String clientName, String date) {
        if (seats < 1) {
            throw new RuntimeException("At least one seat is required");
        }
        User user = getUser(userId);

        double unitPrice = clientPrice;
        String itemName = (clientName == null || clientName.isBlank()) ? "Flight" : clientName;

        if (flightId != null && !flightId.isBlank()) {
            Flight flight = flightRepository.findById(flightId).orElse(null);
            if (flight != null) {
                if (flight.getAvailableSeats() < seats) {
                    throw new RuntimeException(
                            "Only " + flight.getAvailableSeats() + " seat(s) left on this flight");
                }
                flight.setAvailableSeats(flight.getAvailableSeats() - seats);
                flightRepository.save(flight);
                unitPrice = flight.getPrice();
                itemName = flight.getFlightName();
            }
        }

        double total = unitPrice * seats;
        User.Booking booking = buildBooking("FLIGHT", flightId, itemName, seats, total, date);
        attachBooking(user, booking);
        return booking;
    }

    public User.Booking bookHotel(String userId, String hotelId, int rooms, int nights,
                                  double clientPrice, String clientName, String date) {
        if (rooms < 1) {
            throw new RuntimeException("At least one room is required");
        }
        if (nights < 1) {
            nights = 1;
        }
        User user = getUser(userId);

        double unitPrice = clientPrice;
        String itemName = (clientName == null || clientName.isBlank()) ? "Hotel" : clientName;

        if (hotelId != null && !hotelId.isBlank()) {
            Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
            if (hotel != null) {
                if (hotel.getAvailableRooms() < rooms) {
                    throw new RuntimeException(
                            "Only " + hotel.getAvailableRooms() + " room(s) left at this hotel");
                }
                hotel.setAvailableRooms(hotel.getAvailableRooms() - rooms);
                hotelRepository.save(hotel);
                unitPrice = hotel.getPricePerNight();
                itemName = hotel.getHotelName();
            }
        }

        double total = unitPrice * rooms * nights;
        User.Booking booking = buildBooking("HOTEL", hotelId, itemName, rooms, total, date);
        attachBooking(user, booking);
        return booking;
    }

    public List<User.Booking> getUserBookings(String userId) {
        User user = getUser(userId);
        return user.getBookings() == null ? new ArrayList<>() : user.getBookings();
    }

    // ---- helpers ----

    private User getUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("A user id is required to make a booking");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User.Booking buildBooking(String type, String itemId, String itemName,
                                      int quantity, double total, String date) {
        User.Booking booking = new User.Booking();
        booking.setType(type);
        booking.setBookingId(generateRef(type));
        booking.setItemId(itemId);
        booking.setItemName(itemName);
        booking.setQuantity(quantity);
        booking.setTotalPrice(total);
        booking.setDate((date == null || date.isBlank()) ? LocalDate.now().toString() : date);
        return booking;
    }

    private void attachBooking(User user, User.Booking booking) {
        List<User.Booking> bookings = user.getBookings();
        if (bookings == null) {
            bookings = new ArrayList<>();
        }
        bookings.add(booking);
        user.setBookings(bookings);
        userRepository.save(user);
    }

    private String generateRef(String type) {
        String prefix = "FLIGHT".equals(type) ? "MMTF" : "MMTH";
        return prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
