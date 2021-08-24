import React, { useState } from "react";
import { useHistory } from "react-router";
import { createReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import { getValidationErrors } from "../../validation/reservations";
import ReservationForm from "./ReservationForm";

/**
 * Defines the component for creating a new reservation
 *
 * @returns {JSX.Element}
 */

function NewReservation() {
  const [errors, setErrors] = useState(undefined);
  const history = useHistory();

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
        const reservation = await createReservation(
          reservationInfo,
          abortController.signal
        );
        console.debug(reservation);
        history.push(`/dashboard?date=${reservationInfo.reservation_date}`);
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
      <ReservationForm handleSubmit={submit} handleCancel={handleCancel} />
    </>
  );
}

export default NewReservation;
