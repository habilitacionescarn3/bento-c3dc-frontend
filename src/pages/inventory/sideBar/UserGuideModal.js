import React, { useEffect, useState } from 'react';
import { Modal, Box, IconButton, withStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import styles from './ExploreUserGuideStyle';
import OverviewSection from './ExploreUserGuide/OverviewSection';
import FindDataSection from './ExploreUserGuide/FindDataSection';
import CohortSection from './ExploreUserGuide/CohortSection';
import StudyMetadataSection from './ExploreUserGuide/StudyMetadataSection';
import AnalyzingCohortsSection from './ExploreUserGuide/AnalyzingCohortsSection';
import FullGuideSection from './ExploreUserGuide/FullGuideSection';
import ContactUsSection from './ExploreUserGuide/ContactUsSection';

export const USER_GUIDE_TITLE_LIST = [
  'Overview',
  'Finding Participants, Studies, Samples, and Files',
  'Downloading Metadata from the Studies tab',
  'Creating and managing cohorts',
  'Analyzing Cohorts',
  'Contact Us',
  'Full User Guide',
];

const modalBody = {
  position: 'relative',
  margin: '0 auto',
  marginTop: '6%',
  width: '90%',
  maxWidth: '1279px',
  height: '723px',
  background: '#FFFFFF',
  border: '1px solid #505050',
  borderRadius: '40px',
  overflow: 'hidden',
  outline: 0,
};

function UserGuideModal({ classes, open, onClose, pendingSectionId }) {
  const [selectedNavTitle, setSelectedNavTitle] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedNavTitle('');
      return;
    }
    if (!pendingSectionId) {
      setSelectedNavTitle('');
      return;
    }
    setSelectedNavTitle(pendingSectionId);
    const t = window.setTimeout(() => {
      const contentElement = document.getElementById('UserGuideContentSection');
      const element = document.getElementById(pendingSectionId);
      if (contentElement && element) {
        contentElement.scrollTo({
          top: element.offsetTop - 40,
          behavior: 'smooth',
        });
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [open, pendingSectionId]);

  const handleNavClick = (event) => {
    const id = event.target.getAttribute('name');
    setSelectedNavTitle(id);
    const contentElement = document.getElementById('UserGuideContentSection');
    const element = document.getElementById(id);
    if (contentElement && element) {
      contentElement.scrollTo({
        top: element.offsetTop - 40,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box style={modalBody}>
        <IconButton aria-label="close" onClick={onClose} className={classes.closeButton}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className={classes.paperArea}>
          <div className={classes.navSection}>
            <div className={classes.navTitle}>USER GUIDE TOPICS</div>
            {USER_GUIDE_TITLE_LIST.map((titleItem, index) => {
              const key = `topic_${index}`;
              return (
                <div
                  key={key}
                  name={titleItem}
                  className={selectedNavTitle === titleItem ? classes.navTopicItemSelected : classes.navTopicItem}
                  onClick={handleNavClick}
                >
                  {titleItem}
                </div>
              );
            })}
          </div>

          <div id="UserGuideContentSection" className={classes.contentSection}>
            <div className={classes.contentList}>
              <div className={classes.contentTitle}>C3DC Explore Dashboard & Cohort(s) Analyzer</div>
              <OverviewSection classes={classes} />
              <FindDataSection classes={classes} />
              <StudyMetadataSection classes={classes} />
              <CohortSection classes={classes} />
              <AnalyzingCohortsSection classes={classes} />
              <ContactUsSection classes={classes} />
              <FullGuideSection classes={classes} />
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default withStyles(styles)(UserGuideModal);
