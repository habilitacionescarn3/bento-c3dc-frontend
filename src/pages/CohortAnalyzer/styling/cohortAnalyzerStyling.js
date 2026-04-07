import { makeStyles } from '@material-ui/core';
import { cohortAnalyzerCoreStyles } from './coreStyles';
import { cohortAnalyzerLayoutStyles } from './layoutStyles';
import { cohortAnalyzerSummaryStyles } from './summaryStyles';

export const useStyle = makeStyles((theme) => ({
  ...cohortAnalyzerCoreStyles(theme),
  ...cohortAnalyzerLayoutStyles(theme),
  ...cohortAnalyzerSummaryStyles(theme),
}));
