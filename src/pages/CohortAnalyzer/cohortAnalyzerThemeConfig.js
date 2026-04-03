import { themeConfig } from '../studies/tableConfig/Theme';

/**
 * Table + MUI overrides for Cohort Analyzer data grids (table view).
 */
export const cohortAnalyzerThemeConfig = {
    ...themeConfig,
    tblHeader: {
        ...themeConfig.tblHeader,
        MuiTableRow: {
            head: {
                height: '40px',
                borderTop: '3px solid #679AAA',
                borderBottom: '1px solid #000000',
            },
        },
    },
    tblBody: {
        ...themeConfig.tblBody,
        MuiTableCell: {
            ...themeConfig.tblBody.MuiTableCell,
            body: {
                ...themeConfig.tblBody.MuiTableCell.body,
                '&:first-of-type': {
                    color: '#004C73',
                    textDecoration: 'underline',
                },
            },
        },
    },
};
