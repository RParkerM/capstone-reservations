import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { editReservation, getReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import { getValidationErrors } from "../../validation/reservations";
import ReservationForm from "./ReservationForm";

/**
 * Defines the component for editing a reservation
 *
 * @returns {JSX.Element}
 */

function EditReservation() {
  const [reservationInfo, setReservationInfo] = useState(undefined);
  const [errors, setErrors] = useState(undefined);
  const history = useHistory();
  const { reservationId } = useParams();

  const getReservationInfo = () => {
    const abortController = new AbortController();

    setErrors(undefined);
    if (!isNaN(reservationId)) {
      getReservation(reservationId, abortController.signal)
        .then((reservation) => {
          reservation.reservation_time = reservation.reservation_time.slice(
            0,
            5
          );
          setReservationInfo(reservation);
        })
        .catch(setErrors);
    }
    return () => abortController.abort();
  };
  useEffect(getReservationInfo, [reservationId]);

  const isValidReservation = (reservationInfo) => {
    const errorMessages = getValidationErrors(reservationInfo);
    if (errorMessages.length > 0) {
      setErrors({ message: errorMessages.join("\n") });
      console.error("Invalid reservation", reservationInfo, errorMessages);
      return false;
    } else {
      setErrors(undefined);
    }
    return true;
  };

  const submit = async (reservationInfo) => {
    const abortController = new AbortController();

    if (isValidReservation(reservationInfo)) {
      try {
        await editReservation(reservationInfo, abortController.signal);
        history.push(`/dashboard?date=${reservationInfo.reservation_date}`);
      } catch (err) {
        setErrors(err);
      }
    } else {
    }
  };

  const handleCancel = (event) => {
    history.goBack();
  };

  return (
    <>
      <h1 className='mb-3'>Edit Reservation</h1>
      <ErrorAlert error={errors} />
      <ReservationForm
        handleSubmit={submit}
        handleCancel={handleCancel}
        reservation={reservationInfo}
      />
    </>
  );
}

export default EditReservation;
