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
      return false;
    } else {
      setErrors(undefined);
    }
    return true;
  };

  const submit = async (reservationInfo) => {
    const abortController = new AbortController();

    console.log(reservationInfo);
    if (isValidReservation(reservationInfo)) {
      try {
        const reservation = await editReservation(
          reservationInfo,
          abortController.signal
        );
        console.debug(reservation);
        history.goBack();
      } catch (err) {
        setErrors(err);
      }
    }
  };

  const handleCancel = (event) => {
    history.goBack();
  };

  return (
    <>
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
