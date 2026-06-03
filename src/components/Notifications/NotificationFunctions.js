import React from 'react';

const NotificationFunctions = () => {
  // States
  const [open, setOpen] = React.useState(false);
  const [duration, setDuration] = React.useState(10000);
  const [message, setMessage] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = React.useState({
    vertical: 'bottom',
    horizontal: 'right',
  });
  const [styleOptions, setStyleOptions] = React.useState({});

  // Methods for Notifications.
  const close = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    setStyleOptions({});
  };

  /** @param {string} msg @param {number} [timeoutDuration] @param {{ width?: string, textAlign?: 'left'|'center'|'right' }} [options] */
  const show = (msg, timeoutDuration, options = {}) => {
    setMessage(msg);
    setDuration(timeoutDuration);
    setStyleOptions(options);
    setOpen(true);
  };

  const getProps = () => ({
    open, duration, message, location, styleOptions,
  });

  return {
    show,
    close,
    getProps,
  };
};

export default NotificationFunctions;
