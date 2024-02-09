import { useState, useEffect, useCallback, useRef, Fragment } from "react";

const ONE_HOUR = 3600000;

const SessionTimeout = ({
  signOut
}: {
  signOut: () => void;
}) => {
  const [events, setEvents] = useState(["click", "load", "scroll", "mousemove", "keydown"]);

  let startTimerInterval = useRef<NodeJS.Timeout>();

  // start inactive check
  let timeChecker = () => {
    startTimerInterval.current = setTimeout(() => {
      signOut();
    }, ONE_HOUR);
  };

  // reset interval timer
  let resetTimer = useCallback(() => {
    clearTimeout(startTimerInterval.current);
    timeChecker();
  }, []);

  useEffect(() => {
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();

    return () => {
      clearTimeout(startTimerInterval.current);
    };
  }, [resetTimer, events, timeChecker]);

  return <Fragment />;
};

export default SessionTimeout;
