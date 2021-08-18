import React from "react";

import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import NewReservation from "./Reservations/NewReservation";
import { today } from "../utils/date-time";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  let query = useQuery();

  return (
    <Switch>
      <Route exact={true} path='/'>
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path='/reservations/new'>
        <NewReservation />
      </Route>
      <Route exact={true} path='/reservations'>
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path='/dashboard'>
        <Dashboard date={query.get("date") || today()} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
