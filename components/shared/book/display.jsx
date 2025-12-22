import Image from "next/image";
import { Calendar, Clock, MapPin, Users, Bed, Home } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "Time TBD";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const EventBookingDisplay = ({ booking }) => {
  const ticketImage =
    booking.listing?.media_urls?.[0] || "/event_placeholder.jpg";

  const ticketItems = booking.ticket_details
    ? Object.entries(JSON.parse(booking.ticket_details))
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => ({ name, qty }))
    : [];

  const ticketSummary =
    ticketItems.length > 0
      ? ticketItems.map((item) => `${item.qty} ${item.name}`).join(", ")
      : "N/A";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="relative">
        <Image
          src={ticketImage}
          alt="Event"
          width={800}
          height={400}
          className="w-full h-64 object-cover"
          priority={true}
        />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {booking.listing?.title || "Event"}
        </h2>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          You have{" "}
          <span className="font-semibold text-gray-900">{ticketSummary}</span>{" "}
          for{" "}
          <span className="font-semibold text-gray-900">
            {booking.listing?.title || "this event"}
          </span>{" "}
          on{" "}
          <span className="font-semibold text-gray-900">
            {formatDate(booking.listing?.event_date)}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-gray-900">
            {formatTime(booking.booking_time)}
          </span>
          , taking place at{" "}
          <span className="font-semibold text-gray-900">
            {booking.listing?.location || "Venue TBD"}
          </span>
          .
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(booking.listing?.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(booking.booking_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{booking.listing?.location || "Venue TBD"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HotelBookingDisplay = ({ booking }) => {
  const hotelImage =
    booking.hotel?.image_urls?.[0] ||
    booking.room_type?.image_urls?.[0] ||
    "/hotel_placeholder.jpg";

  const calculateNights = () => {
    if (!booking.check_in_date || !booking.check_out_date) return 0;
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="relative">
        <Image
          src={hotelImage}
          alt="Hotel"
          width={800}
          height={400}
          className="w-full h-64 object-cover"
          priority={true}
        />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {booking.hotel?.name || "Hotel"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {booking.hotel?.city}, {booking.hotel?.state}
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            {booking.room_type?.name || "Room"}
          </h3>
          <p className="text-xs text-gray-600">
            Room {booking.room?.room_number}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(booking.check_in_date)} -{" "}
              {formatDate(booking.check_out_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bed className="w-4 h-4" />
            <span>
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {booking.adults} Adult{booking.adults !== 1 ? "s" : ""}
              {booking.children > 0 &&
                `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}`}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Your reservation at{" "}
          <span className="font-semibold text-gray-900">
            {booking.hotel?.name}
          </span>{" "}
          has been confirmed. Check-in is at{" "}
          <span className="font-semibold text-gray-900">
            {formatDate(booking.check_in_date)}
          </span>
          . Your confirmation details have been sent to your email.
        </p>

        {booking.special_requests && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Special Requests:
            </p>
            <p className="text-sm text-gray-900">{booking.special_requests}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ApartmentBookingDisplay = ({ booking }) => {
  const apartmentImage =
    booking.apartment?.image_urls?.[0] || "/apartment_placeholder.jpg";

  const calculateNights = () => {
    if (!booking.check_in_date || !booking.check_out_date) return 0;
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="relative">
        <Image
          src={apartmentImage}
          alt="Apartment"
          width={800}
          height={400}
          className="w-full h-64 object-cover"
          priority={true}
        />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {booking.apartment?.name || "Serviced Apartment"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {booking.apartment?.city}, {booking.apartment?.state}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(booking.check_in_date)} -{" "}
              {formatDate(booking.check_out_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <span>
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Your reservation at{" "}
          <span className="font-semibold text-gray-900">
            {booking.apartment?.name}
          </span>{" "}
          has been confirmed. Check-in is at{" "}
          <span className="font-semibold text-gray-900">
            {formatDate(booking.check_in_date)}
          </span>
          . Your confirmation details have been sent to your email.
        </p>

        {booking.special_requests && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Special Requests:
            </p>
            <p className="text-sm text-gray-900">{booking.special_requests}</p>
          </div>
        )}
      </div>
    </div>
  );
};
