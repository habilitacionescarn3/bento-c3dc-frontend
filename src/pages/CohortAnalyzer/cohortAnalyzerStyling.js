import { makeStyles } from '@material-ui/core';
import { cohortAnalyzerCoreStyles } from './cohortAnalyzerStyling/coreStyles';
import { cohortAnalyzerLayoutStyles } from './cohortAnalyzerStyling/layoutStyles';
import { cohortAnalyzerSummaryStyles } from './cohortAnalyzerStyling/summaryStyles';

export const useStyle = makeStyles((theme) => ({
  ...cohortAnalyzerCoreStyles(theme),
  ...cohortAnalyzerLayoutStyles(theme),
  ...cohortAnalyzerSummaryStyles(theme),
}));
