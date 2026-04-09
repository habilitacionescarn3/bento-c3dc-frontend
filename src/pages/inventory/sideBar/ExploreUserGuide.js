import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, withStyles } from '@material-ui/core';
import styles from './ExploreUserGuideStyle';
import userguideIcon from '../../../assets/icons/Explore_User_Guide_Icon.svg';
import userguideIconWhite from '../../../assets/icons/Explore_User_Guide_Icon_White.svg';
import { useUserGuide } from './UserGuideContext';

const UseGuideButtonContainer = styled.div`
  .buttonContainer {
    display: flex;
    margin-left: 12.5px;
    margin-top: 15px;
  }

  .buttonText {
    color: #415153;
    font-weight: 600;
    font-family: 'Nunito Sans';
    font-size: 14px;
    line-height: 30px;
    margin-left: 8px;
  }
`;

const ExploreUserGuide = ({ classes }) => {
  const { openUserGuide } = useUserGuide();
  const [isHover, setIsHover] = useState(false);

  return (
    <UseGuideButtonContainer>
      <div className="buttonContainer">
        <Button
          variant="outlined"
          onClick={() => openUserGuide()}
          className={classes.customButton}
          classes={{ root: classes.clearAllButtonRoot }}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <img src={isHover ? userguideIconWhite : userguideIcon} alt="user guide icon" />
        </Button>
        <div className="buttonText">Explore the C3DC User Guide</div>
      </div>
    </UseGuideButtonContainer>
  );
};

export default withStyles(styles)(ExploreUserGuide);
