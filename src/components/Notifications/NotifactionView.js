import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useGlobal } from '../Global/GlobalProvider';
import SuccessOutlined from '../../assets/icons/SuccessOutlined.svg';

const Alert = withStyles(() => ({
  message: {},
}))((props) => <MuiAlert elevation={6} variant="filled" {...props} />);

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  snackbarStyles: {
    marginTop: '115px',
  },
  alertStyles: {
    // Widths & Size
    width: (props) => props.width || '235px',
    maxWidth: (props) => props.width || '235px',
    minHeight: '50px',
    boxSizing: 'border-box',
    display: 'flex',
    padding: (props) => (props.textAlign === 'left' ? '12px 16px' : '6px 16px'),

    // Fonts
    color: '#ffffff',
    fontFamily: 'Nunito',
    textAlign: (props) => props.textAlign || 'center',
    justifyContent: (props) => (props.textAlign === 'left' ? 'flex-start' : 'center'),
    alignItems: (props) => (props.textAlign === 'left' ? 'flex-start' : 'center'),
    fontSize: '16px',
    fontWeight: '300',
    letterSpacing: '0',
    lineHeight: '22px',

    // Background & Borders
    backgroundColor: (props) => props.backgroundColor || '#313131',
    borderColor: (props) => props.backgroundColor || 'none',
    borderRadius: '5px',
    boxShadow: '-4px 8px 27px 4px rgba(27,28,28,0.09)',

    // Positioning
    zIndex: '1100',

    '& .MuiAlert-message': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: (props) => (props.textAlign === 'left' ? 'flex-start' : 'center'),
      justifyContent: (props) => (props.textAlign === 'left' ? 'flex-start' : 'center'),
      textAlign: (props) => props.textAlign || 'center',
      width: '100%',
      margin: 0,
      padding: 0,
    },
  },
  notificationIcon: {
    flexShrink: 0,
    display: 'block',
    marginRight: (props) => (props.textAlign === 'left' ? 10 : 8),
  },
  notificationMessage: {
    flex: 1,
    whiteSpace: 'pre-line',
    textAlign: (props) => props.textAlign || 'center',
  },
}));

const NotificationView = () => {
  const { Notification } = useGlobal();
  const {
    open, message, duration, location, styleOptions,
  } = Notification.getProps();
  const classes = useStyles(styleOptions || {});

  const { vertical, horizontal } = location;

  const handleClose = () => {
    Notification.close();
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={open}
        className={classes.snackbarStyles}
        anchorOrigin={{ vertical, horizontal }}
        autoHideDuration={duration || 5000}
        onClose={handleClose}
      >
        <Alert severity="success" icon={false} className={classes.alertStyles}>
          <img src={SuccessOutlined} alt="" className={classes.notificationIcon} />
          <span className={classes.notificationMessage}>{message}</span>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NotificationView;
